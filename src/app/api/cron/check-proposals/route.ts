/**
 * Cron endpoint: resolve expired proposals.
 * Checks Snapshot outcomes, updates proposal status, merges/closes GitHub PRs.
 *
 * POST /api/cron/check-proposals
 * Authorization: Bearer ${CRON_SECRET}
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getProposal as getSnapshotProposal, checkProposalOutcome, type ProposalMetadata } from '@/lib/snapshot';
import { resolveAmendmentPR } from '@/lib/github';
import { applyDiff } from '@/lib/amendment';

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const results: Array<{ id: string; status: string; error?: string }> = [];

  try {
    // Find expired active proposals (voting_end has passed)
    const expiredProposals = await db`
      SELECT gp.*,
             c.github_url, c.github_branch, c.github_repo_full_name,
             c.content as constitution_content, c.slug as constitution_slug
      FROM governance_proposals gp
      JOIN constitutions c ON c.id = gp.constitution_id
      WHERE gp.status = 'active'
        AND gp.voting_end < NOW()
    `;

    for (const proposal of expiredProposals) {
      try {
        let passed = false;

        // Check Snapshot outcome if linked
        if (proposal.snapshot_id) {
          try {
            const snapshotData = await getSnapshotProposal(proposal.snapshot_id);
            if (snapshotData) {
              const metadata: ProposalMetadata = {
                type: proposal.proposal_type || 'policy_proposal',
                category: proposal.category || '',
              };
              const outcome = checkProposalOutcome(snapshotData, metadata);
              passed = outcome.passed;
            }
          } catch (err) {
            console.error(`Snapshot check failed for ${proposal.id}:`, err);
          }
        }

        const newStatus = passed ? 'executed' : 'rejected';

        // Update proposal status
        await db`
          UPDATE governance_proposals
          SET status = ${newStatus}, updated_at = NOW()
          WHERE id = ${proposal.id}
        `;

        // Handle GitHub PR if present
        if (proposal.github_pr_number && proposal.github_url) {
          const newContent = await resolveAmendmentPR(
            {
              id: proposal.constitution_id,
              slug: proposal.constitution_slug,
              github_url: proposal.github_url,
              github_branch: proposal.github_branch,
              github_repo_full_name: proposal.github_repo_full_name,
              content: proposal.constitution_content,
            },
            proposal.github_pr_number,
            passed,
            proposal.title
          );

          // If merged, update constitution content in DB
          if (passed && newContent) {
            await db`
              UPDATE constitutions
              SET content = ${newContent}, updated_at = NOW()
              WHERE id = ${proposal.constitution_id}
            `;
          } else if (passed && proposal.amendment_diff && proposal.constitution_content) {
            // Fallback: apply diff locally if we couldn't read merged content from GitHub
            const localContent = applyDiff(proposal.constitution_content, proposal.amendment_diff);
            if (localContent) {
              await db`
                UPDATE constitutions
                SET content = ${localContent}, updated_at = NOW()
                WHERE id = ${proposal.constitution_id}
              `;
            }
          }
        }

        results.push({ id: proposal.id, status: newStatus });
      } catch (err: any) {
        console.error(`Failed to process proposal ${proposal.id}:`, err);
        results.push({ id: proposal.id, status: 'error', error: err.message });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (err: any) {
    console.error('Cron check-proposals error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
