import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// GET /api/symbiont-hub/proposals/[id] - Get proposal with votes
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const proposal = await queryOne(
      `SELECT p.*, a.name as proposer_name, a.wallet_address as proposer_wallet
       FROM proposals p
       LEFT JOIN agents a ON p.proposer_id = a.id
       WHERE p.id = $1`,
      [id]
    );

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Get votes with voter info
    const votes = await query(
      `SELECT v.*, a.name as voter_name, a.wallet_address as voter_wallet
       FROM votes v
       LEFT JOIN agents a ON v.voter_id = a.id
       WHERE v.proposal_id = $1
       ORDER BY v.created_at`,
      [id]
    );

    return NextResponse.json({
      ...proposal,
      votes
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposal' },
      { status: 500 }
    );
  }
}
