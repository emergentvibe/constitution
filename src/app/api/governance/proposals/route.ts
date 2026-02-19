// GET /api/governance/proposals - List proposals
// POST /api/governance/proposals - Create proposal

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { 
  getProposals as getSnapshotProposals, 
  SNAPSHOT_SPACE,
  ProposalType,
  getVotingPeriod,
  getVotingThreshold 
} from '@/lib/snapshot';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const source = searchParams.get('source') || 'all';
    const first = parseInt(searchParams.get('first') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    const results: any = { proposals: [], source };
    
    // Fetch from Snapshot if requested
    if (source === 'snapshot' || source === 'all') {
      try {
        const snapshotProposals = await getSnapshotProposals(
          SNAPSHOT_SPACE, 
          state as any || undefined, 
          first, 
          skip
        );
        results.snapshot = snapshotProposals;
        results.proposals.push(...snapshotProposals.map(p => ({ ...p, source: 'snapshot' })));
      } catch (err: any) {
        results.snapshotError = err.message;
      }
    }
    
    // Fetch from local DB if requested
    if (source === 'local' || source === 'all') {
      try {
        const db = getDb();
        
        let localProposals;
        if (state) {
          localProposals = await db`
            SELECT * FROM governance_proposals 
            WHERE status = ${state}
            ORDER BY created_at DESC
            LIMIT ${first} OFFSET ${skip}
          `;
        } else {
          localProposals = await db`
            SELECT * FROM governance_proposals 
            ORDER BY created_at DESC
            LIMIT ${first} OFFSET ${skip}
          `;
        }
        
        results.local = localProposals;
        results.proposals.push(...localProposals.map(p => ({ ...p, source: 'local' })));
      } catch (err: any) {
        results.localError = err.message;
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
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      type = 'policy_proposal' as ProposalType,
      category,
      choices = ['For', 'Against', 'Abstain'],
      related_articles,
      amendment_text,
      impact_assessment,
      author_wallet // Required for now
    } = body;
    
    // Validation
    if (!title || title.length < 10) {
      return NextResponse.json({ error: 'Title must be at least 10 characters' }, { status: 400 });
    }
    if (!description || description.length < 100) {
      return NextResponse.json({ error: 'Description must be at least 100 characters' }, { status: 400 });
    }
    if (!author_wallet) {
      return NextResponse.json({ error: 'author_wallet is required' }, { status: 400 });
    }
    
    // Calculate voting period and thresholds
    const votingPeriod = getVotingPeriod(type);
    const threshold = getVotingThreshold(type);
    
    const db = getDb();
    
    const [proposal] = await db`
      INSERT INTO governance_proposals (
        title,
        description,
        proposal_type,
        category,
        choices,
        related_articles,
        amendment_text,
        impact_assessment,
        author_wallet,
        status,
        voting_period_seconds,
        quorum_threshold,
        approval_threshold,
        metadata
      ) VALUES (
        ${title},
        ${description},
        ${type},
        ${category || null},
        ${JSON.stringify(choices)},
        ${related_articles || null},
        ${amendment_text || null},
        ${impact_assessment || null},
        ${author_wallet},
        'draft',
        ${votingPeriod},
        ${threshold.quorum},
        ${threshold.approval},
        ${JSON.stringify({ type, category, related_articles, impact_assessment })}
      )
      RETURNING *
    `;
    
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
        start: Math.floor(Date.now() / 1000) + 3600,
        end: Math.floor(Date.now() / 1000) + 3600 + votingPeriod,
        metadata: { type, category, related_articles, amendment_text, impact_assessment }
      }
    });
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}
