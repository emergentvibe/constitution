import { NextRequest, NextResponse } from 'next/server';
import { getTier, getTierMembers } from '@/lib/tiers';
import { resolveConstitution, ConstitutionNotFoundError } from '@/lib/constitution';

export const dynamic = 'force-dynamic';

// GET /api/tiers/[level] - Get tier details with members
export async function GET(
  request: NextRequest,
  { params }: { params: { level: string } }
) {
  try {
    const level = parseInt(params.level);

    if (isNaN(level) || level < 1) {
      return NextResponse.json(
        { error: 'Invalid tier level' },
        { status: 400 }
      );
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

    const tier = await getTier(level, constitution.id);

    if (!tier) {
      return NextResponse.json(
        { error: 'Tier not found' },
        { status: 404 }
      );
    }

    const members = await getTierMembers(level, constitution.id);

    return NextResponse.json({
      tier,
      members
    });
  } catch (error) {
    console.error('Error fetching tier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tier' },
      { status: 500 }
    );
  }
}
