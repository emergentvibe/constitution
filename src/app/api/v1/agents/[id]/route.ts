import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyMessage } from 'ethers';

// GET /api/v1/agents/[id] - Get agent or member by ID or wallet address
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Try UUID first, then wallet address
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const agentSql = isUuid
      ? 'SELECT * FROM agents WHERE id = $1'
      : 'SELECT * FROM agents WHERE wallet_address = $1';

    const agent = await queryOne(agentSql, [id]);

    if (agent) {
      await query('UPDATE agents SET last_seen_at = NOW() WHERE id = $1', [agent.id]);
      return NextResponse.json({ ...agent, type: 'agent' });
    }

    // Fallback: check members table (UUID shared during migration)
    const memberSql = isUuid
      ? 'SELECT * FROM members WHERE id = $1'
      : 'SELECT * FROM members WHERE wallet_address = $1';

    const member = await queryOne(memberSql, [id]);

    if (member) {
      await query('UPDATE members SET last_seen_at = NOW() WHERE id = $1', [member.id]);
      return NextResponse.json({ ...member, type: 'member' });
    }

    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching agent/member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/agents/[id] - Update agent
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { signature, ...updates } = body;

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature required for updates' },
        { status: 401 }
      );
    }

    // Look up agent to get wallet address for verification
    const agent = await queryOne<{ wallet_address: string }>(
      'SELECT wallet_address FROM agents WHERE id = $1',
      [id]
    );
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Verify signature proves ownership of the agent's wallet
    try {
      const expectedMessage = `Update agent ${id}`;
      const recoveredAddress = verifyMessage(expectedMessage, signature);
      if (recoveredAddress.toLowerCase() !== agent.wallet_address.toLowerCase()) {
        return NextResponse.json(
          { error: 'Signature does not match agent wallet' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid signature format' },
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

// DELETE /api/v1/agents/[id] - Unregister agent (exit)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { signature } = body;

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature required for exit' },
        { status: 401 }
      );
    }

    // Look up agent to verify ownership
    const agent = await queryOne<{ wallet_address: string }>(
      'SELECT wallet_address FROM agents WHERE id = $1',
      [id]
    );
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Verify signature proves ownership of the agent's wallet
    try {
      const expectedMessage = `Exit agent ${id}`;
      const recoveredAddress = verifyMessage(expectedMessage, signature);
      if (recoveredAddress.toLowerCase() !== agent.wallet_address.toLowerCase()) {
        return NextResponse.json(
          { error: 'Signature does not match agent wallet' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid signature format' },
        { status: 401 }
      );
    }

    // Hard delete - exit rights are absolute
    const result = await queryOne(
      `DELETE FROM agents WHERE id = $1 RETURNING id, name`,
      [id]
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Agent unregistered (exit rights exercised)',
      id: result.id,
      name: result.name
    });
  } catch (error) {
    console.error('Error unregistering agent:', error);
    return NextResponse.json(
      { error: 'Failed to unregister agent' },
      { status: 500 }
    );
  }
}
