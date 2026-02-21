import { NextRequest, NextResponse } from 'next/server';
import { getTiers, getTierStats, getAllConfig } from '@/lib/tiers';
import { resolveConstitution, ConstitutionNotFoundError } from '@/lib/constitution';

export const dynamic = 'force-dynamic';

// GET /api/tiers - List all tiers with stats
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

    const [tiers, stats, config] = await Promise.all([
      getTiers(constitution.id),
      getTierStats(constitution.id),
      getAllConfig()
    ]);

    return NextResponse.json({
      tiers,
      stats,
      config: {
        founding_board_size: config.founding_board_size,
        bootstrap_tier: config.bootstrap_tier,
        promotion_voting_days: config.promotion_voting_days,
        promotion_cooldown_days: config.promotion_cooldown_days
      }
    });
  } catch (error) {
    console.error('Error fetching tiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tiers' },
      { status: 500 }
    );
  }
}
