// POST /api/governance/proposals/[id]/link - Link local proposal to Snapshot
// Called after the proposal is successfully submitted to Snapshot

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProposal } from '@/lib/snapshot';

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
    
    const { id } = params;
    const body = await request.json();
    const { snapshot_id } = body;
    
    if (!snapshot_id) {
      return NextResponse.json({ error: 'snapshot_id is required' }, { status: 400 });
    }
    
    // Verify the Snapshot proposal exists
    const snapshotProposal = await getProposal(snapshot_id);
    if (!snapshotProposal) {
      return NextResponse.json({ 
        error: 'Snapshot proposal not found. Make sure it was submitted successfully.' 
      }, { status: 404 });
    }
    
    // Get local proposal
    const { data: proposal, error: fetchError } = await supabase
      .from('governance_proposals')
      .select('*, author:citizens!governance_proposals_author_citizen_id_fkey(user_id)')
      .eq('id', id)
      .single();
    
    if (fetchError || !proposal) {
      return NextResponse.json({ error: 'Local proposal not found' }, { status: 404 });
    }
    
    // Verify ownership
    if (proposal.author?.user_id !== user.id) {
      return NextResponse.json({ 
        error: 'Only the author can link this proposal' 
      }, { status: 403 });
    }
    
    // Check not already linked
    if (proposal.snapshot_id) {
      return NextResponse.json({ 
        error: 'Proposal is already linked to Snapshot',
        snapshot_id: proposal.snapshot_id
      }, { status: 400 });
    }
    
    // Update with Snapshot data
    const { data: updated, error: updateError } = await supabase
      .from('governance_proposals')
      .update({
        snapshot_id,
        status: snapshotProposal.state,
        voting_start: new Date(snapshotProposal.start * 1000).toISOString(),
        voting_end: new Date(snapshotProposal.end * 1000).toISOString(),
        snapshot_data: snapshotProposal
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    return NextResponse.json({
      proposal: updated,
      message: 'Successfully linked to Snapshot',
      snapshotProposal
    });
  } catch (error: any) {
    console.error('Error linking proposal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
