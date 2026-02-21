import { NextRequest, NextResponse } from 'next/server';
import { listPromotions, createPromotion, getPromotionWithDetails } from '@/lib/promotions';
import { resolveConstitution, ConstitutionNotFoundError } from '@/lib/constitution';

export const dynamic = 'force-dynamic';

// GET /api/promotions - List promotions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const fromTier = searchParams.get('from_tier');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let constitution;
    try {
      constitution = await resolveConstitution(searchParams.get('constitution'));
    } catch (err) {
      if (err instanceof ConstitutionNotFoundError) {
        return NextResponse.json({ error: err.message }, { status: 404 });
      }
      throw err;
    }

    const promotions = await listPromotions({
      status,
      from_tier: fromTier ? parseInt(fromTier) : undefined,
      limit,
      offset,
      constitutionId: constitution.id,
    });

    // Get details for each (scoped to constitution)
    const promotionsWithDetails = await Promise.all(
      promotions.map(p => getPromotionWithDetails(p.id, constitution.id))
    );

    return NextResponse.json({
      promotions: promotionsWithDetails.filter(Boolean),
      limit,
      offset
    });
  } catch (error) {
    console.error('Error listing promotions:', error);
    return NextResponse.json(
      { error: 'Failed to list promotions' },
      { status: 500 }
    );
  }
}

// POST /api/promotions - Create a promotion proposal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proposer_id, nominees, rationale, constitution: constitutionSlug } = body;

    if (!proposer_id) {
      return NextResponse.json(
        { error: 'proposer_id is required' },
        { status: 400 }
      );
    }

    if (!nominees || !Array.isArray(nominees) || nominees.length === 0) {
      return NextResponse.json(
        { error: 'nominees array is required and must not be empty' },
        { status: 400 }
      );
    }

    let constitution;
    try {
      constitution = await resolveConstitution(constitutionSlug);
    } catch (err) {
      if (err instanceof ConstitutionNotFoundError) {
        return NextResponse.json({ error: err.message }, { status: 404 });
      }
      throw err;
    }

    const promotion = await createPromotion(proposer_id, nominees, rationale, constitution.id);
    const details = await getPromotionWithDetails(promotion.id, constitution.id);

    return NextResponse.json({
      message: 'Promotion proposal created',
      promotion: details
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion:', error);
    const message = error instanceof Error ? error.message : 'Failed to create promotion';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
