import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { resolveConstitution, ConstitutionNotFoundError } from '@/lib/constitution';

export const dynamic = 'force-dynamic';

// GET /api/members — List members of a constitution
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
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

    let sql = `
      SELECT id, wallet_address, name, tier, registered_at, last_seen_at
      FROM members
      WHERE constitution_id = $1
    `;
    const params: (string | number)[] = [constitution.id];
    let paramIndex = 2;

    if (tier) {
      sql += ` AND tier = $${paramIndex++}`;
      params.push(parseInt(tier));
    }

    sql += ` ORDER BY registered_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const members = await query(sql, params);

    const countResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM members WHERE constitution_id = $1',
      [constitution.id]
    );
    const total = parseInt(countResult?.count || '0');

    return NextResponse.json({
      members,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error listing members:', error);
    return NextResponse.json(
      { error: 'Failed to list members' },
      { status: 500 }
    );
  }
}
