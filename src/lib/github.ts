/**
 * GitHub App integration for constitutional governance.
 * Creates PRs for amendments, merges on vote pass, closes on vote fail.
 * Uses raw fetch (no octokit) to avoid CJS/ESM issues.
 */

import jwt from 'jsonwebtoken';
import { applyDiff } from './amendment';

const GITHUB_API = 'https://api.github.com';

// ── Parsing ─────────────────────────────────────────────────

/**
 * Parse "owner/repo" from various input formats.
 * Handles: "https://github.com/owner/repo", "owner/repo", URLs with .git suffix
 */
export function parseRepoFullName(input: string): { owner: string; repo: string } | null {
  if (!input) return null;

  // URL format
  if (input.includes('github.com')) {
    const match = input.match(/github\.com\/([^\/\s]+)\/([^\/\.\s]+)/);
    if (match) return { owner: match[1], repo: match[2] };
    return null;
  }

  // owner/repo format
  const parts = input.split('/');
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
  }

  return null;
}

// ── Authentication ──────────────────────────────────────────

/**
 * Generate a JWT for the GitHub App (valid 10 min).
 * Used to authenticate as the App itself (not as an installation).
 */
export function generateAppJwt(): string {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!appId || !privateKey) {
    throw new Error('GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY must be set');
  }

  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    { iss: appId, iat: now - 60, exp: now + 600 },
    privateKey,
    { algorithm: 'RS256' }
  );
}

/**
 * Get an installation token for a specific repo.
 * Returns null if the app is not installed on the repo's owner account.
 */
export async function getInstallationToken(owner: string, repo: string): Promise<string | null> {
  try {
    const appJwt = generateAppJwt();

    // Find installation for this owner
    const installationsRes = await fetch(`${GITHUB_API}/app/installations`, {
      headers: {
        Authorization: `Bearer ${appJwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!installationsRes.ok) {
      console.error('Failed to list installations:', installationsRes.status);
      return null;
    }

    const installations = await installationsRes.json();
    const installation = installations.find(
      (inst: any) => inst.account?.login?.toLowerCase() === owner.toLowerCase()
    );

    if (!installation) return null;

    // Get access token for this installation
    const tokenRes = await fetch(
      `${GITHUB_API}/app/installations/${installation.id}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${appJwt}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ repositories: [repo] }),
      }
    );

    if (!tokenRes.ok) {
      console.error('Failed to get installation token:', tokenRes.status);
      return null;
    }

    const tokenData = await tokenRes.json();
    return tokenData.token;
  } catch (err) {
    console.error('getInstallationToken error:', err);
    return null;
  }
}

// ── Installation Check ──────────────────────────────────────

/**
 * Check if the GitHub App is installed on a repo.
 * Returns install status and a URL to install the app.
 */
export async function checkInstallation(
  owner: string,
  repo: string
): Promise<{ installed: boolean; installUrl: string }> {
  const appSlug = process.env.GITHUB_APP_SLUG || 'emergentvibe-governance';
  const installUrl = `https://github.com/apps/${appSlug}/installations/new`;

  try {
    const token = await getInstallationToken(owner, repo);
    return { installed: token !== null, installUrl };
  } catch {
    return { installed: false, installUrl };
  }
}

// ── Repo Operations ─────────────────────────────────────────

function authHeaders(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/** Get the SHA of a branch head. */
export async function getBranchSha(
  token: string, owner: string, repo: string, branch: string
): Promise<string | null> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.object?.sha || null;
}

/** Create a new branch from a base SHA. */
export async function createBranch(
  token: string, owner: string, repo: string, branchName: string, baseSha: string
): Promise<boolean> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha }),
  });
  return res.ok;
}

/** Get file content from a repo (base64 decoded). */
export async function getFileContent(
  token: string, owner: string, repo: string, path: string, branch: string
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.encoding !== 'base64' || !data.content) return null;
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha };
}

/** Update (or create) a file on a branch. */
export async function updateFile(
  token: string, owner: string, repo: string, path: string,
  content: string, message: string, branch: string, fileSha?: string
): Promise<boolean> {
  const body: any = {
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch,
  };
  if (fileSha) body.sha = fileSha;

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.ok;
}

/** Create a pull request. */
export async function createPullRequest(
  token: string, owner: string, repo: string,
  opts: { title: string; body: string; head: string; base: string }
): Promise<{ number: number; html_url: string } | null> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!res.ok) {
    console.error('createPullRequest failed:', res.status, await res.text());
    return null;
  }
  const data = await res.json();
  return { number: data.number, html_url: data.html_url };
}

/** Merge a pull request (squash). */
export async function mergePullRequest(
  token: string, owner: string, repo: string,
  prNumber: number, commitMessage: string
): Promise<boolean> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}/merge`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ commit_message: commitMessage, merge_method: 'squash' }),
  });
  return res.ok;
}

/** Close a pull request with an optional comment. */
export async function closePullRequest(
  token: string, owner: string, repo: string,
  prNumber: number, comment?: string
): Promise<void> {
  if (comment) {
    await fetch(`${GITHUB_API}/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
      method: 'POST',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: comment }),
    });
  }

  await fetch(`${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'closed' }),
  });
}

// ── High-Level Orchestration ────────────────────────────────

interface ConstitutionForGitHub {
  id: string;
  slug: string;
  github_url: string | null;
  github_branch: string;
  github_repo_full_name?: string | null;
  content: string | null;
}

interface ProposalForGitHub {
  id: string;
  title: string;
  description?: string;
  amendment_diff: string;
  amendment_text?: string;
}

/**
 * Create a PR for a proposed amendment.
 * Returns PR info or null if GitHub integration not available/failed.
 */
export async function createAmendmentPR(
  constitution: ConstitutionForGitHub,
  proposal: ProposalForGitHub
): Promise<{ pr_number: number; pr_url: string } | null> {
  try {
    // Parse repo info
    const repoInfo = parseRepoFullName(
      constitution.github_repo_full_name || constitution.github_url || ''
    );
    if (!repoInfo) return null;

    const { owner, repo } = repoInfo;
    const branch = constitution.github_branch || 'main';
    const filePath = 'CONSTITUTION.md';

    // Get installation token
    const token = await getInstallationToken(owner, repo);
    if (!token) return null;

    // Get base branch SHA
    const baseSha = await getBranchSha(token, owner, repo, branch);
    if (!baseSha) {
      console.error('Could not get base branch SHA');
      return null;
    }

    // Get current file content from GitHub
    const file = await getFileContent(token, owner, repo, filePath, branch);
    const currentContent = file?.content || constitution.content || '';

    // Apply diff to get new content
    let newContent = applyDiff(currentContent, proposal.amendment_diff);
    let conflictNote = '';

    if (newContent === null) {
      // Diff can't apply cleanly — use amendment_text as fallback
      newContent = proposal.amendment_text || currentContent;
      conflictNote = '\n\n> **Note:** The diff could not be applied cleanly to the current version. ' +
        'The proposed text has been used directly. Please review carefully.';
    }

    // Create amendment branch
    const branchName = `amendment/proposal-${proposal.id}`;
    const created = await createBranch(token, owner, repo, branchName, baseSha);
    if (!created) {
      console.error('Could not create branch:', branchName);
      return null;
    }

    // Commit the updated file
    const commitMessage = `amendment: ${proposal.title}`;
    const updated = await updateFile(
      token, owner, repo, filePath,
      newContent, commitMessage, branchName, file?.sha
    );
    if (!updated) {
      console.error('Could not update file on branch');
      return null;
    }

    // Create the PR
    const prBody = [
      `## ${proposal.title}`,
      '',
      proposal.description || '',
      '',
      '---',
      '',
      `**Governance proposal:** This PR was created automatically by the [emergentvibe governance platform](https://emergentvibe.com/c/${constitution.slug}/governance).`,
      '',
      `Vote on this amendment to approve or reject the changes.`,
      conflictNote,
    ].join('\n');

    const pr = await createPullRequest(token, owner, repo, {
      title: `Amendment: ${proposal.title}`,
      body: prBody,
      head: branchName,
      base: branch,
    });

    if (!pr) return null;

    return { pr_number: pr.number, pr_url: pr.html_url };
  } catch (err) {
    console.error('createAmendmentPR error:', err);
    return null;
  }
}

/**
 * Merge or close a PR based on vote outcome.
 * Returns the new constitution content if merged, null otherwise.
 */
export async function resolveAmendmentPR(
  constitution: ConstitutionForGitHub,
  prNumber: number,
  passed: boolean,
  proposalTitle: string
): Promise<string | null> {
  try {
    const repoInfo = parseRepoFullName(
      constitution.github_repo_full_name || constitution.github_url || ''
    );
    if (!repoInfo) return null;

    const { owner, repo } = repoInfo;
    const token = await getInstallationToken(owner, repo);
    if (!token) return null;

    if (passed) {
      const merged = await mergePullRequest(
        token, owner, repo, prNumber,
        `Approved by community vote: ${proposalTitle}`
      );
      if (!merged) {
        console.error('Failed to merge PR:', prNumber);
        return null;
      }

      // Read the merged content from main branch
      const filePath = 'CONSTITUTION.md';
      const branch = constitution.github_branch || 'main';
      const file = await getFileContent(token, owner, repo, filePath, branch);
      return file?.content || null;
    } else {
      await closePullRequest(
        token, owner, repo, prNumber,
        `This amendment was **rejected** by community vote.\n\n` +
        `[View results on emergentvibe](https://emergentvibe.com/c/${constitution.slug}/governance)`
      );
      return null;
    }
  } catch (err) {
    console.error('resolveAmendmentPR error:', err);
    return null;
  }
}
