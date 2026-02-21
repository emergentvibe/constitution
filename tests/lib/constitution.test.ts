/**
 * Tests for constitution lookup with fallback safety.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { mockQueryOne, resetDbMocks } from '../mocks/db';

import { getDefaultConstitution, getConstitution } from '@/lib/constitution';

describe('getDefaultConstitution', () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it('returns DB row when table exists and has default', async () => {
    const dbRow = {
      id: 'abc-123',
      slug: 'emergentvibe',
      name: 'Test Constitution',
      content_hash: 'hash123',
      version: '1.0.0',
      snapshot_space: 'test.eth',
      metadata: { founder_address: '0xabc', bootstrap_tier2_limit: 5 },
      is_default: true,
      is_active: true,
    };
    mockQueryOne.mockResolvedValueOnce(dbRow);

    const result = await getDefaultConstitution();
    expect(result.id).toBe('abc-123');
    expect(result.slug).toBe('emergentvibe');
    expect(result.version).toBe('1.0.0');
    expect(result.founder_address).toBe('0xabc');
    expect(result.bootstrap_tier2_limit).toBe(5);
  });

  it('returns fallback when DB row is null', async () => {
    mockQueryOne.mockResolvedValueOnce(null);

    const result = await getDefaultConstitution();
    expect(result.slug).toBe('emergentvibe');
    expect(result.version).toBe('0.1.5');
  });

  it('returns fallback when table does not exist', async () => {
    mockQueryOne.mockRejectedValueOnce(
      new Error('relation "constitutions" does not exist')
    );

    const result = await getDefaultConstitution();
    expect(result.slug).toBe('emergentvibe');
    expect(result.version).toBe('0.1.5');
  });

  it('rethrows non-table-missing errors', async () => {
    mockQueryOne.mockRejectedValueOnce(new Error('connection refused'));

    await expect(getDefaultConstitution()).rejects.toThrow('connection refused');
  });
});

describe('getConstitution', () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it('finds by slug', async () => {
    const dbRow = {
      id: 'abc-123',
      slug: 'emergentvibe',
      name: 'Test',
      content_hash: 'hash',
      version: '1.0',
      snapshot_space: null,
      metadata: {},
    };
    mockQueryOne.mockResolvedValueOnce(dbRow);

    const result = await getConstitution('emergentvibe');
    expect(result).not.toBeNull();
    expect(result!.slug).toBe('emergentvibe');
    // Verify slug-based query was used (not UUID)
    const queryArg = mockQueryOne.mock.calls[0][0] as string;
    expect(queryArg).toContain('slug');
  });

  it('finds by UUID', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const dbRow = {
      id: uuid,
      slug: 'test',
      name: 'Test',
      content_hash: 'hash',
      version: '1.0',
      snapshot_space: null,
      metadata: {},
    };
    mockQueryOne.mockResolvedValueOnce(dbRow);

    const result = await getConstitution(uuid);
    expect(result).not.toBeNull();
    // Verify UUID-based query was used
    const queryArg = mockQueryOne.mock.calls[0][0] as string;
    expect(queryArg).toContain('id');
  });

  it('returns null for nonexistent slug', async () => {
    mockQueryOne.mockResolvedValueOnce(null);

    const result = await getConstitution('nonexistent');
    expect(result).toBeNull();
  });

  it('returns fallback for emergentvibe when table missing', async () => {
    mockQueryOne.mockRejectedValueOnce(
      new Error('relation "constitutions" does not exist')
    );

    const result = await getConstitution('emergentvibe');
    expect(result).not.toBeNull();
    expect(result!.slug).toBe('emergentvibe');
  });

  it('returns null for non-emergentvibe when table missing', async () => {
    mockQueryOne.mockRejectedValueOnce(
      new Error('relation "constitutions" does not exist')
    );

    const result = await getConstitution('other-project');
    expect(result).toBeNull();
  });
});
