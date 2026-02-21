import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { CONSTITUTION_VERSION, CONSTITUTION_HASH, BOOTSTRAP_TIER2_LIMIT } from '@/lib/symbiont';
import { resolveConstitution, ConstitutionNotFoundError } from '@/lib/constitution';

// GET /api/symbiont-hub/stats - Network statistics
export async function GET(request: NextRequest) {
  try {
    let constitution;
    try {
      constitution = await resolveConstitution(request.nextUrl.searchParams.get('constitution'));
    } catch (err) {
      if (err instanceof ConstitutionNotFoundError) {
        return NextResponse.json({ error: err.message }, { status: 404 });
      }
      throw err;
    }

    // Agent counts by tier (scoped to constitution)
    const tierCounts = await query<{ tier: number; count: string }>(
      'SELECT tier, COUNT(*) as count FROM agents WHERE constitution_id = $1 GROUP BY tier ORDER BY tier',
      [constitution.id]
    );

    // Total agents
    const totalResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM agents WHERE constitution_id = $1',
      [constitution.id]
    );
    const totalAgents = parseInt(totalResult?.count || '0');

    // Proposal counts by status (scoped to constitution)
    const proposalCounts = await query<{ status: string; count: string }>(
      'SELECT status, COUNT(*) as count FROM proposals WHERE constitution_id = $1 GROUP BY status',
      [constitution.id]
    );

    // Active proposals (deliberation or voting)
    const activeResult = await queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM proposals WHERE constitution_id = $1 AND status IN ('deliberation', 'voting')",
      [constitution.id]
    );
    const activeProposals = parseInt(activeResult?.count || '0');

    // Recent registrations (last 24h)
    const recentResult = await queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM agents WHERE constitution_id = $1 AND registered_at > NOW() - INTERVAL '24 hours'",
      [constitution.id]
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
