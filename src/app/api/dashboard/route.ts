import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { resolveConstitution, ConstitutionNotFoundError } from '@/lib/constitution';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get('wallet');
    if (!wallet) {
      return NextResponse.json({ error: 'wallet parameter required' }, { status: 400 });
    }

    let constitution;
    try {
      constitution = await resolveConstitution(request.nextUrl.searchParams.get('constitution'));
    } catch (err) {
      if (err instanceof ConstitutionNotFoundError) {
        return NextResponse.json({ error: err.message }, { status: 404 });
      }
      throw err;
    }

    const walletLower = wallet.toLowerCase();

    // Find agent by wallet_address or operator_address (scoped to constitution)
    const agent = await queryOne<{
      id: string;
      name: string;
      wallet_address: string;
      operator_address: string | null;
      tier: number;
      registered_at: string;
      mission: string | null;
    }>(
      `SELECT id, name, wallet_address, operator_address, tier, registered_at, mission
       FROM agents
       WHERE (wallet_address = $1 OR operator_address = $1) AND constitution_id = $2
       LIMIT 1`,
      [walletLower, constitution.id]
    );

    if (!agent) {
      return NextResponse.json({ error: 'No agent found for this wallet' }, { status: 404 });
    }

    // Activity: governance votes
    const governanceVoteCount = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM governance_votes WHERE wallet_address = $1',
      [agent.wallet_address]
    );

    // Activity: promotion votes
    const promotionVoteCount = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM promotion_votes WHERE voter_id = $1',
      [agent.id]
    );

    // Activity: proposals created (scoped to constitution)
    const proposalCount = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM governance_proposals WHERE author_wallet = $1 AND constitution_id = $2',
      [agent.wallet_address, constitution.id]
    );

    // Recent governance votes (last 10)
    const recentVotes = await query<{
      proposal_id: string;
      choice: number;
      created_at: string;
    }>(
      `SELECT gv.proposal_id, gv.choice, gv.created_at
       FROM governance_votes gv
       WHERE gv.wallet_address = $1
       ORDER BY gv.created_at DESC
       LIMIT 10`,
      [agent.wallet_address]
    );

    // Enrich with proposal titles
    const enrichedVotes = [];
    for (const vote of recentVotes) {
      const proposal = await queryOne<{ title: string }>(
        'SELECT title FROM governance_proposals WHERE id = $1',
        [vote.proposal_id]
      );
      enrichedVotes.push({
        ...vote,
        proposal_title: proposal?.title || 'Unknown Proposal',
      });
    }

    // Progression: tier members count (scoped to constitution)
    const tierMemberCount = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM agents WHERE tier = $1 AND constitution_id = $2',
      [agent.tier, constitution.id]
    );

    // Progression: pending promotions user can vote on
    const pendingPromotions = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM promotions
       WHERE from_tier = $1 AND status = 'pending'`,
      [agent.tier]
    );

    // Progression: eligible for promotion (has been registered 30+ days)
    const daysSinceRegistration = Math.floor(
      (Date.now() - new Date(agent.registered_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      identity: {
        id: agent.id,
        name: agent.name,
        wallet_address: agent.wallet_address,
        operator_address: agent.operator_address,
        tier: agent.tier,
        registered_at: agent.registered_at,
        mission: agent.mission,
      },
      activity: {
        governance_votes: parseInt(governanceVoteCount?.count || '0'),
        promotion_votes: parseInt(promotionVoteCount?.count || '0'),
        proposals_created: parseInt(proposalCount?.count || '0'),
        recent_votes: enrichedVotes,
      },
      progression: {
        current_tier: agent.tier,
        tier_members: parseInt(tierMemberCount?.count || '0'),
        pending_promotions: parseInt(pendingPromotions?.count || '0'),
        eligible_for_promotion: daysSinceRegistration >= 30,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
  }
}
