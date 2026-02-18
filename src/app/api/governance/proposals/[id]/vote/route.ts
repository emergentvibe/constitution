// POST /api/governance/proposals/[id]/vote - Record a vote
// GET /api/governance/proposals/[id]/vote - Get votes for a proposal

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createVoteMessage, SNAPSHOT_SPACE } from '@/lib/snapshot';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { choice, reason, snapshot_id, wallet_address } = body;
    
    if (!wallet_address) {
      return NextResponse.json({ error: 'wallet_address is required' }, { status: 401 });
    }
    
    // Validate choice
    if (typeof choice !== 'number' || choice < 1) {
      return NextResponse.json({ 
        error: 'Invalid choice. Must be a positive integer (1-indexed)' 
      }, { status: 400 });
    }
    
    const db = getDb();
    
    // Get the proposal
    const [proposal] = await db`
      SELECT * FROM governance_proposals WHERE id = ${id}::uuid
    `;
    
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }
    
    // Check proposal is active
    if (proposal.status !== 'active' && proposal.status !== 'draft') {
      return NextResponse.json({ 
        error: 'Can only vote on active proposals' 
      }, { status: 400 });
    }
    
    // Check choice is valid for this proposal
    const choices = proposal.choices || ['For', 'Against', 'Abstain'];
    if (choice > choices.length) {
      return NextResponse.json({ 
        error: `Invalid choice. Must be between 1 and ${choices.length}` 
      }, { status: 400 });
    }
    
    // Check if already voted
    const [existingVote] = await db`
      SELECT id FROM governance_votes 
      WHERE proposal_id = ${id}::uuid AND wallet_address = ${wallet_address.toLowerCase()}
    `;
    
    if (existingVote) {
      return NextResponse.json({ 
        error: 'You have already voted on this proposal' 
      }, { status: 400 });
    }
    
    // Record vote
    const [vote] = await db`
      INSERT INTO governance_votes (
        proposal_id,
        wallet_address,
        choice,
        reason
      ) VALUES (
        ${id}::uuid,
        ${wallet_address.toLowerCase()},
        ${choice},
        ${reason || null}
      )
      RETURNING *
    `;
    
    // Prepare Snapshot vote message for signing
    const snapshotProposalId = snapshot_id || proposal.snapshot_id;
    let snapshotMessage = null;
    
    if (snapshotProposalId) {
      snapshotMessage = createVoteMessage(
        SNAPSHOT_SPACE,
        snapshotProposalId,
        choice,
        reason
      );
    }
    
    return NextResponse.json({
      vote,
      message: 'Vote recorded locally',
      snapshotMessage: snapshotMessage ? {
        message: snapshotMessage,
        instructions: 'Sign this message with your wallet and submit to Snapshot to finalize your vote on-chain'
      } : null
    });
  } catch (error: any) {
    console.error('Error recording vote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDb();
    
    const votes = await db`
      SELECT * FROM governance_votes 
      WHERE proposal_id = ${id}::uuid
      ORDER BY created_at DESC
    `;
    
    // Calculate vote breakdown
    const breakdown: Record<number, { count: number; voters: string[] }> = {};
    for (const vote of votes) {
      if (!breakdown[vote.choice]) {
        breakdown[vote.choice] = { count: 0, voters: [] };
      }
      breakdown[vote.choice].count++;
      breakdown[vote.choice].voters.push(
        `${vote.wallet_address?.slice(0, 6)}...${vote.wallet_address?.slice(-4)}`
      );
    }
    
    return NextResponse.json({
      votes,
      total: votes.length,
      breakdown
    });
  } catch (error: any) {
    console.error('Error fetching votes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
