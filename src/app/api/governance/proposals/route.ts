// GET /api/governance/proposals - List proposals
// POST /api/governance/proposals - Create proposal (requires auth)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  getProposals, 
  SNAPSHOT_SPACE,
  ProposalType,
  getVotingPeriod,
  getVotingThreshold 
} from '@/lib/snapshot';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') as 'pending' | 'active' | 'closed' | null;
    const source = searchParams.get('source') || 'all'; // 'snapshot', 'local', 'all'
    const first = parseInt(searchParams.get('first') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    const results: any = { proposals: [], source };
    
    // Fetch from Snapshot if requested
    if (source === 'snapshot' || source === 'all') {
      try {
        const snapshotProposals = await getProposals(SNAPSHOT_SPACE, state || undefined, first, skip);
        results.snapshot = snapshotProposals;
        results.proposals.push(...snapshotProposals.map(p => ({ ...p, source: 'snapshot' })));
      } catch (err: any) {
        // Snapshot might not have the space yet
        results.snapshotError = err.message;
      }
    }
    
    // Fetch from local DB if requested
    if (source === 'local' || source === 'all') {
      const supabase = await createClient();
      
      let query = supabase
        .from('governance_proposals')
        .select('*')
        .order('created_at', { ascending: false })
        .range(skip, skip + first - 1);
      
      if (state) {
        query = query.eq('status', state);
      }
      
      const { data: localProposals, error } = await query;
      
      if (error) {
        results.localError = error.message;
      } else {
        results.local = localProposals;
        results.proposals.push(...(localProposals || []).map(p => ({ ...p, source: 'local' })));
      }
    }
    
    // Sort combined results by date
    results.proposals.sort((a: any, b: any) => {
      const dateA = a.start || new Date(a.created_at).getTime() / 1000;
      const dateB = b.start || new Date(b.created_at).getTime() / 1000;
      return dateB - dateA;
    });
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
        error: 'Only active citizens can create proposals' 
      }, { status: 403 });
    }
    
    const body = await request.json();
    const { 
      title, 
      description, 
      type = 'policy_proposal' as ProposalType,
      category,
      choices = ['For', 'Against', 'Abstain'],
      related_articles,
      amendment_text,
      impact_assessment
    } = body;
    
    // Validation
    if (!title || title.length < 10) {
      return NextResponse.json({ error: 'Title must be at least 10 characters' }, { status: 400 });
    }
    if (!description || description.length < 100) {
      return NextResponse.json({ error: 'Description must be at least 100 characters' }, { status: 400 });
    }
    
    // Calculate voting period
    const votingPeriod = getVotingPeriod(type);
    const threshold = getVotingThreshold(type);
    
    // Store proposal locally first
    const { data: proposal, error: insertError } = await supabase
      .from('governance_proposals')
      .insert({
        title,
        description,
        proposal_type: type,
        category,
        choices,
        related_articles,
        amendment_text,
        impact_assessment,
        author_citizen_id: citizen.id,
        author_wallet: citizen.wallet_address,
        status: 'draft', // Starts as draft until submitted to Snapshot
        voting_period_seconds: votingPeriod,
        quorum_threshold: threshold.quorum,
        approval_threshold: threshold.approval,
        metadata: {
          type,
          category,
          related_articles,
          impact_assessment
        }
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    
    // Return the draft proposal with instructions for Snapshot submission
    return NextResponse.json({
      proposal,
      nextSteps: {
        message: 'Proposal created as draft. To activate voting:',
        steps: [
          '1. Connect your wallet',
          '2. Sign the proposal message',
          '3. Submit to Snapshot',
          '4. The proposal will be linked to your local draft'
        ]
      },
      snapshotMessage: {
        space: SNAPSHOT_SPACE,
        title,
        body: description,
        choices,
        type: 'single-choice',
        start: Math.floor(Date.now() / 1000) + 3600, // Start in 1 hour
        end: Math.floor(Date.now() / 1000) + 3600 + votingPeriod,
        metadata: {
          type,
          category,
          related_articles,
          amendment_text,
          impact_assessment
        }
      }
    });
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
