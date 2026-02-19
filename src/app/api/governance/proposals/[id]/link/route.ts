// POST /api/governance/proposals/[id]/link - Link local proposal to Snapshot

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getProposal } from '@/lib/snapshot';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { snapshot_id, author_wallet } = body;
    
    if (!snapshot_id) {
      return NextResponse.json({ error: 'snapshot_id is required' }, { status: 400 });
    }
    
    if (!author_wallet) {
      return NextResponse.json({ error: 'author_wallet required for auth' }, { status: 401 });
    }
    
    // Verify the Snapshot proposal exists
    const snapshotProposal = await getProposal(snapshot_id);
    if (!snapshotProposal) {
      return NextResponse.json({ 
        error: 'Snapshot proposal not found. Make sure it was submitted successfully.' 
      }, { status: 404 });
    }
    
    const db = getDb();
    
    // Get local proposal
    const [proposal] = await db`
      SELECT * FROM governance_proposals WHERE id = ${id}::uuid
    `;
    
    if (!proposal) {
      return NextResponse.json({ error: 'Local proposal not found' }, { status: 404 });
    }
    
    // Verify ownership
    if (proposal.author_wallet?.toLowerCase() !== author_wallet.toLowerCase()) {
      return NextResponse.json({ error: 'Only the author can link this proposal' }, { status: 403 });
    }
    
    // Check not already linked
    if (proposal.snapshot_id) {
      return NextResponse.json({ 
        error: 'Proposal is already linked to Snapshot',
        snapshot_id: proposal.snapshot_id
      }, { status: 400 });
    }
    
    // Update with Snapshot data
    const [updated] = await db`
      UPDATE governance_proposals SET
        snapshot_id = ${snapshot_id},
        status = ${snapshotProposal.state},
        voting_start = ${new Date(snapshotProposal.start * 1000).toISOString()},
        voting_end = ${new Date(snapshotProposal.end * 1000).toISOString()},
        snapshot_data = ${JSON.stringify(snapshotProposal)},
        updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;
    
    return NextResponse.json({
      proposal: updated,
      message: 'Successfully linked to Snapshot',
      snapshotProposal
    });
  } catch (error: any) {
    console.error('Error linking proposal:', error);
    return NextResponse.json({ error: 'Failed to link proposal' }, { status: 500 });
  }
}
