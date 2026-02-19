import { NextRequest, NextResponse } from 'next/server';
import { voteOnPromotion, getPromotionWithDetails } from '@/lib/promotions';

export const dynamic = 'force-dynamic';

// POST /api/promotions/[id]/vote - Cast a vote
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { voter_id, vote, reason } = body;

    if (!voter_id) {
      return NextResponse.json(
        { error: 'voter_id is required' },
        { status: 400 }
      );
    }

    if (typeof vote !== 'boolean') {
      return NextResponse.json(
        { error: 'vote must be a boolean (true = for, false = against)' },
        { status: 400 }
      );
    }

    await voteOnPromotion(params.id, voter_id, vote, reason);
    
    // Return updated promotion
    const promotion = await getPromotionWithDetails(params.id);

    return NextResponse.json({
      message: vote ? 'Voted for promotion' : 'Voted against promotion',
      promotion
    });
  } catch (error) {
    console.error('Error voting on promotion:', error);
    const message = error instanceof Error ? error.message : 'Failed to cast vote';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
