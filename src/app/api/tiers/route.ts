import { NextResponse } from 'next/server';
import { getTiers, getTierStats, getAllConfig } from '@/lib/tiers';

export const dynamic = 'force-dynamic';

// GET /api/tiers - List all tiers with stats
export async function GET() {
  try {
    const [tiers, stats, config] = await Promise.all([
      getTiers(),
      getTierStats(),
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
      { error: 'Failed to fetch tiers', details: String(error) },
      { status: 500 }
    );
  }
}
