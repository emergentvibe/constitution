/**
 * Governance logic extracted from vote route handlers.
 * Centralizes voting eligibility checks for testability.
 * Uses query/queryOne (not tagged template db) for mockability.
 *
 * All eligibility checks query the `members` table (humans who govern),
 * not the `agents` table (AI systems that comply).
 */

import { query, queryOne } from './db';

interface VoterInfo {
  id: string;
  tier: number;
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
  // Check member exists and has sufficient tier
  const voter = constitutionId
    ? await queryOne<VoterInfo>(
        'SELECT id, tier FROM members WHERE wallet_address = $1 AND constitution_id = $2',
        [walletAddress.toLowerCase(), constitutionId]
      )
    : await queryOne<VoterInfo>(
        'SELECT id, tier FROM members WHERE wallet_address = $1',
        [walletAddress.toLowerCase()]
      );

  if (!voter) {
    return { eligible: false, error: 'Not a registered member', status: 403 };
  }

  if (voter.tier < 2) {
    return { eligible: false, error: 'Only Tier 2+ members can vote on governance proposals', status: 403 };
  }

  // Check if already voted
  const existingVotes = await query<{ id: string }>(
    'SELECT id FROM governance_votes WHERE proposal_id = $1 AND wallet_address = $2',
    [proposalId, walletAddress.toLowerCase()]
  );

  if (existingVotes.length > 0) {
    return { eligible: false, error: 'You have already voted on this proposal', status: 400 };
  }

  return { eligible: true, voter };
}

/**
 * Check if a wallet can comment on a governance proposal.
 * Returns commenter info if eligible, or an error message.
 * Tier 1+ can comment (lower barrier than voting which requires Tier 2+).
 */
export async function canCommentOnProposal(
  walletAddress: string,
  proposalId: string,
  constitutionId?: string
): Promise<{ eligible: true; commenter: { id: string; tier: number } } | { eligible: false; error: string; status: number }> {
  const member = constitutionId
    ? await queryOne<{ id: string; tier: number }>(
        'SELECT id, tier FROM members WHERE wallet_address = $1 AND constitution_id = $2',
        [walletAddress.toLowerCase(), constitutionId]
      )
    : await queryOne<{ id: string; tier: number }>(
        'SELECT id, tier FROM members WHERE wallet_address = $1',
        [walletAddress.toLowerCase()]
      );

  if (!member) {
    return { eligible: false, error: 'Not a registered member', status: 403 };
  }

  if (member.tier < 1) {
    return { eligible: false, error: 'Only registered members can comment', status: 403 };
  }

  const proposal = await queryOne<{ id: string }>(
    'SELECT id FROM governance_proposals WHERE id = $1',
    [proposalId]
  );
  if (!proposal) {
    return { eligible: false, error: 'Proposal not found', status: 404 };
  }

  return { eligible: true, commenter: member };
}

/**
 * Check if a member can vote on a promotion.
 * Returns voter info if eligible, or an error message.
 * When constitutionId is provided, voter must belong to that constitution.
 */
export async function canVoteOnPromotion(
  voterId: string,
  promotionId: string,
  promotionFromTier: number,
  nominees: string[],
  constitutionId?: string
): Promise<{ eligible: true; voter: { tier: number; name: string } } | { eligible: false; error: string }> {
  const voter = constitutionId
    ? await queryOne<{ tier: number; name: string }>(
        'SELECT tier, name FROM members WHERE id = $1 AND constitution_id = $2',
        [voterId, constitutionId]
      )
    : await queryOne<{ tier: number; name: string }>(
        'SELECT tier, name FROM members WHERE id = $1',
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

  return { eligible: true, voter };
}
