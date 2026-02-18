import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// GET /api/symbiont-hub/agents/[id] - Get agent by ID or wallet address
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Try UUID first, then wallet address
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    const sql = isUuid
      ? 'SELECT * FROM agents WHERE id = $1'
      : 'SELECT * FROM agents WHERE wallet_address = $1';
    
    const agent = await queryOne(sql, [id]);
    
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Update last_seen
    await query('UPDATE agents SET last_seen_at = NOW() WHERE id = $1', [agent.id]);

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

// PATCH /api/symbiont-hub/agents/[id] - Update agent
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { signature, ...updates } = body;

    // TODO: Verify signature
    if (!signature) {
      return NextResponse.json(
        { error: 'Signature required for updates' },
        { status: 401 }
      );
    }

    // Only allow updating certain fields
    const allowedFields = ['name', 'mission', 'contact_endpoint', 'metadata', 'tier'];
    const updateFields: string[] = [];
    const updateValues: (string | number | boolean | null)[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (field in updates) {
        updateFields.push(`${field} = $${paramIndex++}`);
        updateValues.push(field === 'metadata' ? JSON.stringify(updates[field]) : updates[field]);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updateFields.push(`last_seen_at = NOW()`);
    updateValues.push(id);

    const sql = `
      UPDATE agents 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id
    `;

    const result = await queryOne(sql, updateValues);

    if (!result) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Agent updated', id: result.id });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

// DELETE /api/symbiont-hub/agents/[id] - Unregister agent (exit)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { signature, reason } = body;

    // TODO: Verify signature
    if (!signature) {
      return NextResponse.json(
        { error: 'Signature required for exit' },
        { status: 401 }
      );
    }

    // Soft delete - mark as exited rather than delete
    const result = await queryOne(
      `UPDATE agents 
       SET metadata = COALESCE(metadata, '{}'::jsonb) || $1, tier = 0
       WHERE id = $2
       RETURNING id`,
      [JSON.stringify({ exited: true, exit_reason: reason, exit_date: new Date().toISOString() }), id]
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Agent unregistered (exit rights exercised)',
      id: result.id
    });
  } catch (error) {
    console.error('Error unregistering agent:', error);
    return NextResponse.json(
      { error: 'Failed to unregister agent', details: String(error) },
      { status: 500 }
    );
  }
}
