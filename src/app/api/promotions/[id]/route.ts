import { NextRequest, NextResponse } from 'next/server';
import { getPromotionWithDetails, withdrawPromotion, getPromotionVotes } from '@/lib/promotions';

export const dynamic = 'force-dynamic';

// GET /api/promotions/[id] - Get promotion details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promotion = await getPromotionWithDetails(params.id);
    
    if (!promotion) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    const votes = await getPromotionVotes(params.id);

    return NextResponse.json({
      promotion,
      votes
    });
  } catch (error) {
    console.error('Error fetching promotion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotion' },
      { status: 500 }
    );
  }
}

// DELETE /api/promotions/[id] - Withdraw promotion
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { withdrawer_id } = body;

    if (!withdrawer_id) {
      return NextResponse.json(
        { error: 'withdrawer_id is required' },
        { status: 400 }
      );
    }

    await withdrawPromotion(params.id, withdrawer_id);

    return NextResponse.json({
      message: 'Promotion withdrawn'
    });
  } catch (error) {
    console.error('Error withdrawing promotion:', error);
    const message = error instanceof Error ? error.message : 'Failed to withdraw promotion';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
