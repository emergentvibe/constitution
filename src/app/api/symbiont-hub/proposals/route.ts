import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// GET /api/symbiont-hub/proposals - List proposals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `
      SELECT p.*, a.name as proposer_name, a.wallet_address as proposer_wallet
      FROM proposals p
      LEFT JOIN agents a ON p.proposer_id = a.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND p.status = $${paramIndex++}`;
      params.push(status);
    }
    if (type) {
      sql += ` AND p.type = $${paramIndex++}`;
      params.push(type);
    }

    sql += ` ORDER BY p.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const proposals = await query(sql, params);

    return NextResponse.json({ proposals, limit, offset });
  } catch (error) {
    console.error('Error listing proposals:', error);
    return NextResponse.json(
      { error: 'Failed to list proposals' },
      { status: 500 }
    );
  }
}

// POST /api/symbiont-hub/proposals - Create proposal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      proposer_id,
      type,
      title,
      description,
      diff,
      affected_principles,
      signature
    } = body;

    // Validate required fields
    if (!proposer_id || !type || !title || !description || !diff || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify proposer exists and is Tier 2+
    const proposer = await queryOne<{ tier: number }>(
      'SELECT tier FROM agents WHERE id = $1',
      [proposer_id]
    );

    if (!proposer) {
      return NextResponse.json(
        { error: 'Proposer not found' },
        { status: 404 }
      );
    }

    if (proposer.tier < 2) {
      return NextResponse.json(
        { error: 'Only Tier 2+ agents can propose amendments' },
        { status: 403 }
      );
    }

    // Calculate deliberation and voting periods
    const now = new Date();
    let deliberationDays = 7;
    let votingDays = 7;
    
    if (type === 'emergency') {
      deliberationDays = 2; // 48 hours minimum
      votingDays = 3;
    } else if (type === 'interpretation') {
      deliberationDays = 3;
      votingDays = 5;
    }

    const deliberationEnds = new Date(now.getTime() + deliberationDays * 24 * 60 * 60 * 1000);
    const votingEnds = new Date(deliberationEnds.getTime() + votingDays * 24 * 60 * 60 * 1000);

    // Get quorum (50% of Tier 2+ agents)
    const agentCount = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM agents WHERE tier >= 2'
    );
    const quorum = Math.ceil(parseInt(agentCount?.count || '1') / 2);

    const result = await queryOne<{ id: string }>(
      `INSERT INTO proposals (
        proposer_id, type, title, description, diff,
        affected_principles, deliberation_ends_at, voting_ends_at, quorum_required
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [
        proposer_id,
        type,
        title,
        description,
        diff,
        affected_principles || [],
        deliberationEnds.toISOString(),
        votingEnds.toISOString(),
        quorum
      ]
    );

    return NextResponse.json({
      message: 'Proposal created',
      id: result?.id,
      deliberation_ends_at: deliberationEnds.toISOString(),
      voting_ends_at: votingEnds.toISOString(),
      quorum_required: quorum
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    );
  }
}
