import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { CONSTITUTION_VERSION, CONSTITUTION_HASH, BOOTSTRAP_TIER2_LIMIT } from '@/lib/symbiont';

// GET /api/symbiont-hub/stats - Network statistics
export async function GET() {
  try {
    // Agent counts by tier
    const tierCounts = await query<{ tier: number; count: string }>(
      'SELECT tier, COUNT(*) as count FROM agents GROUP BY tier ORDER BY tier'
    );

    // Total agents
    const totalResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM agents'
    );
    const totalAgents = parseInt(totalResult?.count || '0');

    // Proposal counts by status
    const proposalCounts = await query<{ status: string; count: string }>(
      'SELECT status, COUNT(*) as count FROM proposals GROUP BY status'
    );

    // Active proposals (deliberation or voting)
    const activeResult = await queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM proposals WHERE status IN ('deliberation', 'voting')"
    );
    const activeProposals = parseInt(activeResult?.count || '0');

    // Recent registrations (last 24h)
    const recentResult = await queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM agents WHERE registered_at > NOW() - INTERVAL '24 hours'"
    );
    const recentRegistrations = parseInt(recentResult?.count || '0');

    // Bootstrap status
    const bootstrapRemaining = Math.max(0, BOOTSTRAP_TIER2_LIMIT - totalAgents);
    const bootstrapComplete = bootstrapRemaining === 0;

    return NextResponse.json({
      constitution: {
        version: CONSTITUTION_VERSION,
        hash: CONSTITUTION_HASH
      },
      agents: {
        total: totalAgents,
        by_tier: tierCounts.reduce((acc, { tier, count }) => {
          acc[`tier_${tier}`] = parseInt(count);
          return acc;
        }, {} as Record<string, number>),
        recent_24h: recentRegistrations
      },
      proposals: {
        by_status: proposalCounts.reduce((acc, { status, count }) => {
          acc[status] = parseInt(count);
          return acc;
        }, {} as Record<string, number>),
        active: activeProposals
      },
      bootstrap: {
        tier2_limit: BOOTSTRAP_TIER2_LIMIT,
        remaining_slots: bootstrapRemaining,
        complete: bootstrapComplete
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
