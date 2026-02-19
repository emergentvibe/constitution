// GET /api/governance/proposals/[id] - Get single proposal
// PUT /api/governance/proposals/[id] - Update proposal (draft only)
// DELETE /api/governance/proposals/[id] - Delete proposal (draft only)

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getProposal, getVotes, checkProposalOutcome } from '@/lib/snapshot';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeVotes = searchParams.get('votes') === 'true';
    
    // Check if it's a Snapshot ID (starts with 0x) or local UUID
    const isSnapshotId = id.startsWith('0x');
    
    let result: any = {};
    
    if (isSnapshotId) {
      // Fetch from Snapshot
      const proposal = await getProposal(id);
      if (!proposal) {
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
      }
      
      result.proposal = proposal;
      result.source = 'snapshot';
      result.outcome = checkProposalOutcome(proposal);
      
      if (includeVotes) {
        result.votes = await getVotes(id);
      }
      
      // Check if we have local metadata
      const db = getDb();
      const [localData] = await db`
        SELECT * FROM governance_proposals WHERE snapshot_id = ${id}
      `;
      
      if (localData) {
        result.localData = localData;
        result.outcome = checkProposalOutcome(proposal, localData.metadata);
      }
    } else {
      // Fetch from local DB
      const db = getDb();
      const [proposal] = await db`
        SELECT * FROM governance_proposals WHERE id = ${id}::uuid
      `;
      
      if (!proposal) {
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
      }
      
      result.proposal = proposal;
      result.source = 'local';
      
      // Get local votes
      const votes = await db`
        SELECT * FROM governance_votes 
        WHERE proposal_id = ${id}::uuid
        ORDER BY created_at DESC
      `;
      result.votes = votes;
      
      // If linked to Snapshot, fetch that data too
      if (proposal.snapshot_id) {
        try {
          const snapshotData = await getProposal(proposal.snapshot_id);
          result.snapshotData = snapshotData;
          if (snapshotData) {
            result.outcome = checkProposalOutcome(snapshotData, proposal.metadata);
          }
          
          if (includeVotes) {
            result.snapshotVotes = await getVotes(proposal.snapshot_id);
          }
        } catch (err) {
          // Snapshot data unavailable
        }
      }
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json({ error: 'Failed to fetch proposal' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { author_wallet } = body; // For auth
    
    if (!author_wallet) {
      return NextResponse.json({ error: 'author_wallet required for auth' }, { status: 401 });
    }
    
    const db = getDb();
    
    // Get the proposal
    const [proposal] = await db`
      SELECT * FROM governance_proposals WHERE id = ${id}::uuid
    `;
    
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }
    
    // Check ownership
    if (proposal.author_wallet?.toLowerCase() !== author_wallet.toLowerCase()) {
      return NextResponse.json({ error: 'Only the author can edit this proposal' }, { status: 403 });
    }
    
    // Check status
    if (proposal.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft proposals can be edited' }, { status: 400 });
    }
    
    const allowedFields = [
      'title', 'description', 'proposal_type', 'category', 
      'choices', 'related_articles', 'amendment_text', 'impact_assessment'
    ];
    
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }
    
    // Build dynamic update
    const setClauses = Object.entries(updates)
      .map(([key, _], i) => `${key} = $${i + 2}`)
      .join(', ');
    const values = [id, ...Object.values(updates)];
    
    const [updated] = await db.unsafe(
      `UPDATE governance_proposals SET ${setClauses}, updated_at = NOW() WHERE id = $1::uuid RETURNING *`,
      values
    );
    
    return NextResponse.json({ proposal: updated });
  } catch (error: any) {
    console.error('Error updating proposal:', error);
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const author_wallet = searchParams.get('author_wallet');
    
    if (!author_wallet) {
      return NextResponse.json({ error: 'author_wallet required for auth' }, { status: 401 });
    }
    
    const db = getDb();
    
    // Get the proposal
    const [proposal] = await db`
      SELECT * FROM governance_proposals WHERE id = ${id}::uuid
    `;
    
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }
    
    // Check ownership
    if (proposal.author_wallet?.toLowerCase() !== author_wallet.toLowerCase()) {
      return NextResponse.json({ error: 'Only the author can delete this proposal' }, { status: 403 });
    }
    
    // Only allow deleting drafts
    if (proposal.status !== 'draft') {
      return NextResponse.json({ 
        error: 'Only draft proposals can be deleted. Active or closed proposals are permanent.' 
      }, { status: 400 });
    }
    
    await db`DELETE FROM governance_proposals WHERE id = ${id}::uuid`;
    
    return NextResponse.json({ success: true, deleted: id });
  } catch (error: any) {
    console.error('Error deleting proposal:', error);
    return NextResponse.json({ error: 'Failed to delete proposal' }, { status: 500 });
  }
}
