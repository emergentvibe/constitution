import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyVoteSignature } from '@/lib/symbiont';

// POST /api/symbiont-hub/proposals/[id]/vote - Cast vote
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposalId = params.id;
    const body = await request.json();
    
    const { voter_id, vote, reasoning, signature, skip_verification } = body;

    // Validate
    if (!voter_id || !vote || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: voter_id, vote, signature' },
        { status: 400 }
      );
    }

    if (!['for', 'against', 'abstain'].includes(vote)) {
      return NextResponse.json(
        { error: 'Vote must be: for, against, or abstain' },
        { status: 400 }
      );
    }

    // Get voter info for signature verification
    const voter = await queryOne<{ tier: number; wallet_address: string }>(
      'SELECT tier, wallet_address FROM agents WHERE id = $1',
      [voter_id]
    );

    if (!voter) {
      return NextResponse.json(
        { error: 'Voter not found' },
        { status: 404 }
      );
    }

    // Verify signature
    if (!skip_verification) {
      const verification = verifyVoteSignature(proposalId, vote, voter.wallet_address, signature);
      if (!verification.valid) {
        return NextResponse.json(
          { error: 'Invalid signature', details: verification.error },
          { status: 401 }
        );
      }
    }

    if (voter.tier < 2) {
      return NextResponse.json(
        { error: 'Only Tier 2+ agents can vote', your_tier: voter.tier },
        { status: 403 }
      );
    }

    // Check proposal exists and is in voting phase
    const proposal = await queryOne<{
      status: string;
      type: string;
      deliberation_ends_at: string;
      voting_ends_at: string;
    }>(
      'SELECT status, type, deliberation_ends_at, voting_ends_at FROM proposals WHERE id = $1',
      [proposalId]
    );

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const deliberationEnds = new Date(proposal.deliberation_ends_at);
    const votingEnds = new Date(proposal.voting_ends_at);

    // Update status if needed
    if (proposal.status === 'deliberation' && now >= deliberationEnds) {
      await query(
        "UPDATE proposals SET status = 'voting' WHERE id = $1",
        [proposalId]
      );
    }

    if (now < deliberationEnds) {
      return NextResponse.json(
        { error: 'Voting has not started yet', deliberation_ends_at: proposal.deliberation_ends_at },
        { status: 400 }
      );
    }

    if (now > votingEnds) {
      return NextResponse.json(
        { error: 'Voting has ended', voting_ends_at: proposal.voting_ends_at },
        { status: 400 }
      );
    }

    // Check if already voted
    const existingVote = await queryOne<{ id: string; vote: string }>(
      'SELECT id, vote FROM votes WHERE proposal_id = $1 AND voter_id = $2',
      [proposalId, voter_id]
    );

    if (existingVote) {
      return NextResponse.json(
        { error: 'Already voted on this proposal', previous_vote: existingVote.vote },
        { status: 409 }
      );
    }

    // Cast vote
    await query(
      `INSERT INTO votes (proposal_id, voter_id, vote, reasoning, signature)
       VALUES ($1, $2, $3, $4, $5)`,
      [proposalId, voter_id, vote, reasoning || null, signature]
    );

    // Update vote counts
    const voteColumn = vote === 'for' ? 'votes_for' : vote === 'against' ? 'votes_against' : 'votes_abstain';
    await query(
      `UPDATE proposals SET ${voteColumn} = ${voteColumn} + 1 WHERE id = $1`,
      [proposalId]
    );

    // Check if proposal should be resolved
    const updatedProposal = await queryOne<{
      votes_for: number;
      votes_against: number;
      votes_abstain: number;
      quorum_required: number;
      type: string;
    }>(
      'SELECT votes_for, votes_against, votes_abstain, quorum_required, type FROM proposals WHERE id = $1',
      [proposalId]
    );

    if (updatedProposal) {
      const totalVotes = updatedProposal.votes_for + updatedProposal.votes_against + updatedProposal.votes_abstain;
      const threshold = updatedProposal.type === 'emergency' ? 0.75 : 0.67;
      
      if (totalVotes >= updatedProposal.quorum_required) {
        const forRatio = updatedProposal.votes_for / (updatedProposal.votes_for + updatedProposal.votes_against);
        
        if (forRatio >= threshold) {
          await query("UPDATE proposals SET status = 'passed' WHERE id = $1", [proposalId]);
        } else if ((1 - forRatio) > (1 - threshold)) {
          await query("UPDATE proposals SET status = 'rejected' WHERE id = $1", [proposalId]);
        }
      }
    }

    return NextResponse.json({
      message: 'Vote cast successfully',
      vote,
      proposal_id: proposalId
    }, { status: 201 });

  } catch (error) {
    console.error('Error casting vote:', error);
    return NextResponse.json(
      { error: 'Failed to cast vote' },
      { status: 500 }
    );
  }
}
