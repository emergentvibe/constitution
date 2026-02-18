// POST /api/governance/proposals/[id]/vote - Record a vote
// This records the vote locally and provides the Snapshot message to sign

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createVoteMessage, SNAPSHOT_SPACE } from '@/lib/snapshot';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is a citizen
    const { data: citizen, error: citizenError } = await supabase
      .from('citizens')
      .select('id, status, wallet_address')
      .eq('user_id', user.id)
      .single();
    
    if (citizenError || !citizen || citizen.status !== 'active') {
      return NextResponse.json({ 
        error: 'Only active citizens can vote' 
      }, { status: 403 });
    }
    
    const { id } = params;
    const body = await request.json();
    const { choice, reason, snapshot_id } = body;
    
    // Validate choice
    if (typeof choice !== 'number' || choice < 1) {
      return NextResponse.json({ 
        error: 'Invalid choice. Must be a positive integer (1-indexed)' 
      }, { status: 400 });
    }
    
    // Get the proposal
    const { data: proposal, error: fetchError } = await supabase
      .from('governance_proposals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }
    
    // Check proposal is active
    if (proposal.status !== 'active') {
      return NextResponse.json({ 
        error: 'Can only vote on active proposals' 
      }, { status: 400 });
    }
    
    // Check choice is valid for this proposal
    if (proposal.choices && choice > proposal.choices.length) {
      return NextResponse.json({ 
        error: `Invalid choice. Must be between 1 and ${proposal.choices.length}` 
      }, { status: 400 });
    }
    
    // Check if already voted
    const { data: existingVote } = await supabase
      .from('governance_votes')
      .select('id')
      .eq('proposal_id', id)
      .eq('citizen_id', citizen.id)
      .single();
    
    if (existingVote) {
      return NextResponse.json({ 
        error: 'You have already voted on this proposal' 
      }, { status: 400 });
    }
    
    // Record vote locally
    const { data: vote, error: voteError } = await supabase
      .from('governance_votes')
      .insert({
        proposal_id: id,
        citizen_id: citizen.id,
        wallet_address: citizen.wallet_address,
        choice,
        reason,
        snapshot_vote_id: null, // Will be updated after Snapshot submission
      })
      .select()
      .single();
    
    if (voteError) {
      return NextResponse.json({ error: voteError.message }, { status: 500 });
    }
    
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

// GET votes for a proposal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    
    const { data: votes, error } = await supabase
      .from('governance_votes')
      .select(`
        *,
        citizen:citizens(
          display_name,
          wallet_address
        )
      `)
      .eq('proposal_id', id)
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Calculate vote breakdown
    const breakdown: Record<number, { count: number; voters: string[] }> = {};
    for (const vote of votes || []) {
      if (!breakdown[vote.choice]) {
        breakdown[vote.choice] = { count: 0, voters: [] };
      }
      breakdown[vote.choice].count++;
      breakdown[vote.choice].voters.push(vote.citizen?.display_name || 'Anonymous');
    }
    
    return NextResponse.json({
      votes,
      total: votes?.length || 0,
      breakdown
    });
  } catch (error: any) {
    console.error('Error fetching votes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
