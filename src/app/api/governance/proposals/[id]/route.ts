// GET /api/governance/proposals/[id] - Get single proposal
// PUT /api/governance/proposals/[id] - Update proposal (draft only)
// DELETE /api/governance/proposals/[id] - Delete proposal (draft only)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
      
      // Check outcome
      result.outcome = checkProposalOutcome(proposal);
      
      // Optionally include votes
      if (includeVotes) {
        result.votes = await getVotes(id);
      }
      
      // Check if we have local metadata
      const supabase = await createClient();
      const { data: localData } = await supabase
        .from('governance_proposals')
        .select('*')
        .eq('snapshot_id', id)
        .single();
      
      if (localData) {
        result.localData = localData;
        result.outcome = checkProposalOutcome(proposal, localData.metadata);
      }
    } else {
      // Fetch from local DB
      const supabase = await createClient();
      const { data: proposal, error } = await supabase
        .from('governance_proposals')
        .select(`
          *,
          author:citizens!governance_proposals_author_citizen_id_fkey(
            display_name,
            wallet_address
          ),
          votes:governance_votes(*)
        `)
        .eq('id', id)
        .single();
      
      if (error || !proposal) {
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
      }
      
      result.proposal = proposal;
      result.source = 'local';
      
      // If linked to Snapshot, fetch that data too
      if (proposal.snapshot_id) {
        try {
          const snapshotData = await getProposal(proposal.snapshot_id);
          result.snapshotData = snapshotData;
          result.outcome = checkProposalOutcome(snapshotData!, proposal.metadata);
          
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
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
    
    const { id } = params;
    
    // Get the proposal
    const { data: proposal, error: fetchError } = await supabase
      .from('governance_proposals')
      .select('*, author:citizens!governance_proposals_author_citizen_id_fkey(user_id)')
      .eq('id', id)
      .single();
    
    if (fetchError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }
    
    // Check ownership
    if (proposal.author?.user_id !== user.id) {
      return NextResponse.json({ error: 'Only the author can edit this proposal' }, { status: 403 });
    }
    
    // Check status
    if (proposal.status !== 'draft') {
      return NextResponse.json({ 
        error: 'Only draft proposals can be edited' 
      }, { status: 400 });
    }
    
    const body = await request.json();
    const allowedFields = [
      'title', 'description', 'proposal_type', 'category', 
      'choices', 'related_articles', 'amendment_text', 'impact_assessment'
    ];
    
    const updates: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }
    
    const { data: updated, error: updateError } = await supabase
      .from('governance_proposals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    return NextResponse.json({ proposal: updated });
  } catch (error: any) {
    console.error('Error updating proposal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
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
    
    const { id } = params;
    
    // Get the proposal
    const { data: proposal, error: fetchError } = await supabase
      .from('governance_proposals')
      .select('*, author:citizens!governance_proposals_author_citizen_id_fkey(user_id)')
      .eq('id', id)
      .single();
    
    if (fetchError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }
    
    // Check ownership (or admin)
    if (proposal.author?.user_id !== user.id) {
      return NextResponse.json({ error: 'Only the author can delete this proposal' }, { status: 403 });
    }
    
    // Only allow deleting drafts
    if (proposal.status !== 'draft') {
      return NextResponse.json({ 
        error: 'Only draft proposals can be deleted. Active or closed proposals are permanent.' 
      }, { status: 400 });
    }
    
    const { error: deleteError } = await supabase
      .from('governance_proposals')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, deleted: id });
  } catch (error: any) {
    console.error('Error deleting proposal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
