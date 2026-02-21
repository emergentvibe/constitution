/**
 * Governance logic extracted from vote route handlers.
 * Centralizes voting eligibility checks for testability.
 * Uses query/queryOne (not tagged template db) for mockability.
 */

import { query, queryOne } from './db';

interface VoterInfo {
  id: string;
  tier: number;
  operator_address: string | null;
}

/**
 * Check if a wallet can vote on a governance proposal.
 * Returns voter info if eligible, or an error message.
 * When constitutionId is provided, voter must belong to that constitution.
 */
export async function canVoteOnProposal(
  walletAddress: string,
  proposalId: string,
  constitutionId?: string
): Promise<{ eligible: true; voter: VoterInfo } | { eligible: false; error: string; status: number }> {
  // Check voter exists and has sufficient tier
  const voter = constitutionId
    ? await queryOne<VoterInfo>(
        'SELECT id, tier, operator_address FROM agents WHERE wallet_address = $1 AND constitution_id = $2',
        [walletAddress.toLowerCase(), constitutionId]
      )
    : await queryOne<VoterInfo>(
        'SELECT id, tier, operator_address FROM agents WHERE wallet_address = $1',
        [walletAddress.toLowerCase()]
      );

  if (!voter) {
    return { eligible: false, error: 'Not a registered agent', status: 403 };
  }

  if (voter.tier < 2) {
    return { eligible: false, error: 'Only Tier 2+ agents can vote on governance proposals', status: 403 };
  }

  // Check if already voted
  const existingVotes = await query<{ id: string }>(
    'SELECT id FROM governance_votes WHERE proposal_id = $1 AND wallet_address = $2',
    [proposalId, walletAddress.toLowerCase()]
  );

  if (existingVotes.length > 0) {
    return { eligible: false, error: 'You have already voted on this proposal', status: 400 };
  }

  // Check operator-level dedup
  if (voter.operator_address) {
    const operatorVotes = await query<{ id: string }>(
      `SELECT gv.id FROM governance_votes gv
       JOIN agents a ON a.wallet_address = gv.wallet_address
       WHERE gv.proposal_id = $1
         AND a.operator_address = $2
         AND a.operator_address IS NOT NULL`,
      [proposalId, voter.operator_address.toLowerCase()]
    );
    if (operatorVotes.length > 0) {
      return { eligible: false, error: 'Your operator has already voted on this proposal via another agent', status: 400 };
    }
  }

  return { eligible: true, voter };
}

/**
 * Check if an agent can vote on a promotion.
 * Returns voter info if eligible, or an error message.
 * When constitutionId is provided, voter must belong to that constitution.
 */
export async function canVoteOnPromotion(
  voterId: string,
  promotionId: string,
  promotionFromTier: number,
  nominees: string[],
  constitutionId?: string
): Promise<{ eligible: true; voter: { tier: number; name: string; operator_address: string | null } } | { eligible: false; error: string }> {
  const voter = constitutionId
    ? await queryOne<{ tier: number; name: string; operator_address: string | null }>(
        'SELECT tier, name, operator_address FROM agents WHERE id = $1 AND constitution_id = $2',
        [voterId, constitutionId]
      )
    : await queryOne<{ tier: number; name: string; operator_address: string | null }>(
        'SELECT tier, name, operator_address FROM agents WHERE id = $1',
        [voterId]
      );

  if (!voter) {
    return { eligible: false, error: 'Voter not found' };
  }

  // Must be same tier
  if (voter.tier !== promotionFromTier) {
    return { eligible: false, error: 'Only members of the same tier can vote' };
  }

  // Can't vote if you're a nominee
  if (nominees.includes(voterId)) {
    return { eligible: false, error: 'Nominees cannot vote on their own promotion' };
  }

  // Operator-level dedup
  if (voter.operator_address) {
    const operatorVote = await queryOne<{ voter_id: string }>(
      `SELECT pv.voter_id FROM promotion_votes pv
       JOIN agents a ON a.id = pv.voter_id
       WHERE pv.promotion_id = $1
         AND a.operator_address = $2
         AND a.operator_address IS NOT NULL
         AND pv.voter_id != $3`,
      [promotionId, voter.operator_address, voterId]
    );
    if (operatorVote) {
      return { eligible: false, error: 'Your operator has already voted on this promotion via another agent' };
    }
  }

  return { eligible: true, voter };
}
