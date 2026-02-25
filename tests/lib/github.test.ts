/**
 * Tests for GitHub App integration.
 * Pure function tests + orchestration tests with mocked fetch.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock jsonwebtoken before importing github.ts
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mock-jwt-token'),
  },
}));

// Mock amendment.ts
vi.mock('@/lib/amendment', () => ({
  applyDiff: vi.fn((original: string, diff: string) => {
    if (diff === 'bad-diff') return null;
    return 'amended content';
  }),
}));

import { parseRepoFullName, createAmendmentPR, resolveAmendmentPR } from '@/lib/github';

describe('parseRepoFullName', () => {
  it('parses https github URL', () => {
    expect(parseRepoFullName('https://github.com/emergentvibe/constitution'))
      .toEqual({ owner: 'emergentvibe', repo: 'constitution' });
  });

  it('parses github URL with .git suffix', () => {
    expect(parseRepoFullName('https://github.com/myorg/my-repo.git'))
      .toEqual({ owner: 'myorg', repo: 'my-repo' });
  });

  it('parses owner/repo format', () => {
    expect(parseRepoFullName('emergentvibe/constitution'))
      .toEqual({ owner: 'emergentvibe', repo: 'constitution' });
  });

  it('parses owner/repo with .git suffix', () => {
    expect(parseRepoFullName('myorg/repo.git'))
      .toEqual({ owner: 'myorg', repo: 'repo' });
  });

  it('returns null for empty string', () => {
    expect(parseRepoFullName('')).toBeNull();
  });

  it('returns null for invalid format', () => {
    expect(parseRepoFullName('just-a-name')).toBeNull();
  });

  it('returns null for URL without owner/repo', () => {
    expect(parseRepoFullName('https://github.com/')).toBeNull();
  });
});

// ── Orchestration Tests (mocked fetch) ──────────────────────

const mockFetch = vi.fn();

const mockConstitution = {
  id: 'const-123',
  slug: 'test-constitution',
  github_url: 'https://github.com/testorg/test-constitution',
  github_branch: 'main',
  github_repo_full_name: 'testorg/test-constitution',
  content: '# Old Constitution\n\nOriginal text.',
};

const mockProposal = {
  id: 'prop-456',
  title: 'Update Article 1',
  description: 'This updates article 1 for clarity.',
  amendment_diff: 'valid-diff',
  amendment_text: 'Fallback text if diff fails',
};

function mockFetchResponses(responses: Array<{ match: (url: string, opts?: any) => boolean; ok: boolean; json?: any }>) {
  mockFetch.mockImplementation(async (url: string, opts?: any) => {
    for (const response of responses) {
      if (response.match(url, opts)) {
        return {
          ok: response.ok,
          status: response.ok ? 200 : 404,
          json: async () => response.json || {},
          text: async () => JSON.stringify(response.json || {}),
        };
      }
    }
    // Default: return ok true with empty JSON to avoid blocking on unexpected calls
    return { ok: true, status: 200, json: async () => ({}), text: async () => '{}' };
  });
}

describe('createAmendmentPR', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    vi.stubEnv('GITHUB_APP_ID', '12345');
    vi.stubEnv('GITHUB_APP_PRIVATE_KEY', 'mock-key');
    vi.stubEnv('GITHUB_APP_SLUG', 'test-app');
    mockFetch.mockReset();
  });

  it('returns null when constitution has no github_url', async () => {
    const result = await createAmendmentPR(
      { ...mockConstitution, github_url: null, github_repo_full_name: null },
      mockProposal
    );
    expect(result).toBeNull();
  });

  it('returns null when app is not installed', async () => {
    mockFetchResponses([
      { match: (url) => url.includes('/app/installations'), ok: true, json: [] },
    ]);

    const result = await createAmendmentPR(mockConstitution, mockProposal);
    expect(result).toBeNull();
  });

  it('creates PR on happy path', async () => {
    mockFetchResponses([
      { match: (url) => url.endsWith('/app/installations'), ok: true, json: [{ id: 1, account: { login: 'testorg' } }] },
      { match: (url) => url.includes('/access_tokens'), ok: true, json: { token: 'install-token-123' } },
      { match: (url) => url.includes('/git/ref/heads/main'), ok: true, json: { object: { sha: 'base-sha-abc' } } },
      { match: (url, opts) => url.includes('/contents/CONSTITUTION.md') && (!opts?.method || opts.method === 'GET'), ok: true, json: { content: Buffer.from('# Old Content').toString('base64'), sha: 'file-sha-def', encoding: 'base64' } },
      { match: (url, opts) => url.includes('/git/refs') && opts?.method === 'POST', ok: true, json: {} },
      { match: (url, opts) => url.includes('/contents/CONSTITUTION.md') && opts?.method === 'PUT', ok: true, json: {} },
      { match: (url, opts) => url.includes('/pulls') && opts?.method === 'POST', ok: true, json: { number: 42, html_url: 'https://github.com/testorg/test-constitution/pull/42' } },
    ]);

    const result = await createAmendmentPR(mockConstitution, mockProposal);

    expect(result).toEqual({
      pr_number: 42,
      pr_url: 'https://github.com/testorg/test-constitution/pull/42',
    });
  });

  it('uses fallback text when diff cannot apply', async () => {
    mockFetchResponses([
      { match: (url) => url.endsWith('/app/installations'), ok: true, json: [{ id: 1, account: { login: 'testorg' } }] },
      { match: (url) => url.includes('/access_tokens'), ok: true, json: { token: 'install-token-123' } },
      { match: (url) => url.includes('/git/ref/heads/main'), ok: true, json: { object: { sha: 'base-sha-abc' } } },
      { match: (url, opts) => url.includes('/contents/CONSTITUTION.md') && (!opts?.method || opts.method === 'GET'), ok: true, json: { content: Buffer.from('# Different Content').toString('base64'), sha: 'file-sha-def', encoding: 'base64' } },
      { match: (url, opts) => url.includes('/git/refs') && opts?.method === 'POST', ok: true, json: {} },
      { match: (url, opts) => url.includes('/contents/CONSTITUTION.md') && opts?.method === 'PUT', ok: true, json: {} },
      { match: (url, opts) => url.includes('/pulls') && opts?.method === 'POST', ok: true, json: { number: 43, html_url: 'https://github.com/testorg/test-constitution/pull/43' } },
    ]);

    const badDiffProposal = { ...mockProposal, amendment_diff: 'bad-diff' };
    const result = await createAmendmentPR(mockConstitution, badDiffProposal);

    expect(result).toEqual({
      pr_number: 43,
      pr_url: 'https://github.com/testorg/test-constitution/pull/43',
    });

    // Verify the file update used fallback text
    const updateCall = mockFetch.mock.calls.find(
      (call: any[]) => call[0].includes('/contents/CONSTITUTION.md') && call[1]?.method === 'PUT'
    );
    expect(updateCall).toBeDefined();
    const body = JSON.parse(updateCall![1].body);
    const decoded = Buffer.from(body.content, 'base64').toString('utf-8');
    expect(decoded).toBe('Fallback text if diff fails');
  });
});

describe('resolveAmendmentPR', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    vi.stubEnv('GITHUB_APP_ID', '12345');
    vi.stubEnv('GITHUB_APP_PRIVATE_KEY', 'mock-key');
    mockFetch.mockReset();
  });

  it('merges PR when vote passes', async () => {
    mockFetchResponses([
      { match: (url) => url.endsWith('/app/installations'), ok: true, json: [{ id: 1, account: { login: 'testorg' } }] },
      { match: (url) => url.includes('/access_tokens'), ok: true, json: { token: 'install-token-123' } },
      { match: (url) => url.includes('/merge'), ok: true, json: { merged: true } },
      { match: (url) => url.includes('/contents/CONSTITUTION.md'), ok: true, json: { content: Buffer.from('# Merged Content').toString('base64'), sha: 'new-sha', encoding: 'base64' } },
    ]);

    const result = await resolveAmendmentPR(mockConstitution, 42, true, 'Update Article 1');

    expect(result).toBe('# Merged Content');

    const mergeCall = mockFetch.mock.calls.find(
      (call: any[]) => call[0].includes('/merge')
    );
    expect(mergeCall).toBeDefined();
  });

  it('closes PR with comment when vote fails', async () => {
    mockFetchResponses([
      { match: (url) => url.endsWith('/app/installations'), ok: true, json: [{ id: 1, account: { login: 'testorg' } }] },
      { match: (url) => url.includes('/access_tokens'), ok: true, json: { token: 'install-token-123' } },
      { match: (url) => url.includes('/comments'), ok: true, json: {} },
      { match: (url, opts) => url.includes('/pulls/42') && opts?.method === 'PATCH', ok: true, json: {} },
    ]);

    const result = await resolveAmendmentPR(mockConstitution, 42, false, 'Update Article 1');

    expect(result).toBeNull();

    // Verify comment was posted
    const commentCall = mockFetch.mock.calls.find(
      (call: any[]) => call[0].includes('/comments') && call[1]?.method === 'POST'
    );
    expect(commentCall).toBeDefined();

    // Verify PR was closed
    const closeCall = mockFetch.mock.calls.find(
      (call: any[]) => call[0].includes('/pulls/42') && call[1]?.method === 'PATCH'
    );
    expect(closeCall).toBeDefined();
  });

  it('returns null when app is not installed', async () => {
    mockFetchResponses([
      { match: (url) => url.includes('/app/installations'), ok: true, json: [] },
    ]);

    const result = await resolveAmendmentPR(mockConstitution, 42, true, 'Test');
    expect(result).toBeNull();
  });
});
