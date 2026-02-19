/**
 * Promotion System
 * Democratic tier advancement via voting
 */

import { query, queryOne } from './db';
import { getConfig, getTier, createTier, tierExists, countTierMembers } from './tiers';

export interface Promotion {
  id: string;
  from_tier: number;
  to_tier: number;
  nominees: string[];
  proposed_by: string;
  rationale: string | null;
  votes_for: string[];
  votes_against: string[];
  quorum_required: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'withdrawn';
  created_at: string;
  voting_ends_at: string;
  resolved_at: string | null;
}

export interface PromotionWithDetails extends Promotion {
  proposer_name: string;
  nominee_names: string[];
  votes_for_count: number;
  votes_against_count: number;
  total_eligible_voters: number;
  threshold: number;
}

export interface PromotionVote {
  id: string;
  promotion_id: string;
  voter_id: string;
  vote: boolean;
  reason: string | null;
  created_at: string;
  voter_name?: string;
}

/**
 * Create a new promotion proposal
 */
export async function createPromotion(
  proposerId: string,
  nomineeIds: string[],
  rationale?: string
): Promise<Promotion> {
  // Get proposer
  const proposer = await queryOne<{ tier: number; name: string }>(
    'SELECT tier, name FROM agents WHERE id = $1',
    [proposerId]
  );
  if (!proposer) {
    throw new Error('Proposer not found');
  }
  
  const fromTier = proposer.tier;
  const toTier = fromTier + 1;
  
  // Validate nominees exist and are same tier
  const nominees = await query<{ id: string; tier: number; name: string }>(
    'SELECT id, tier, name FROM agents WHERE id = ANY($1)',
    [nomineeIds]
  );
  
  if (nominees.length !== nomineeIds.length) {
    throw new Error('One or more nominees not found');
  }
  
  for (const nominee of nominees) {
    if (nominee.tier !== fromTier) {
      throw new Error(`Nominee ${nominee.name} is not in tier ${fromTier}`);
    }
  }
  
  // Check nominees aren't in cooldown
  const cooldownDays = await getConfig('promotion_cooldown_days');
  for (const nomineeId of nomineeIds) {
    const recentFailed = await queryOne<{ id: string }>(
      `SELECT id FROM promotions 
       WHERE $1 = ANY(SELECT jsonb_array_elements_text(nominees))
       AND status IN ('rejected', 'expired')
       AND resolved_at > NOW() - INTERVAL '1 day' * $2`,
      [nomineeId, cooldownDays]
    );
    if (recentFailed) {
      const nominee = nominees.find(n => n.id === nomineeId);
      throw new Error(`${nominee?.name} is in cooldown period (${cooldownDays} days)`);
    }
  }
  
  // Check proposer isn't nominating themselves
  if (nomineeIds.includes(proposerId)) {
    throw new Error('Cannot nominate yourself');
  }
  
  // Check no pending promotion for these nominees
  for (const nomineeId of nomineeIds) {
    const pending = await queryOne<{ id: string }>(
      `SELECT id FROM promotions 
       WHERE $1 = ANY(SELECT jsonb_array_elements_text(nominees))
       AND status = 'pending'`,
      [nomineeId]
    );
    if (pending) {
      const nominee = nominees.find(n => n.id === nomineeId);
      throw new Error(`${nominee?.name} already has a pending promotion`);
    }
  }
  
  // Calculate quorum (50% of eligible voters, minimum 1)
  // Eligible voters = tier members minus nominees (who can't vote on their own promotion)
  const tierMemberCount = await countTierMembers(fromTier);
  const eligibleVoters = tierMemberCount - nomineeIds.length;
  const quorumPercent = await getConfig('default_quorum_percent');
  const quorumRequired = Math.max(1, Math.ceil(eligibleVoters * quorumPercent));
  
  // Calculate voting end date
  const votingDays = await getConfig('promotion_voting_days');
  const votingEndsAt = new Date();
  votingEndsAt.setDate(votingEndsAt.getDate() + votingDays);
  
  // Create promotion
  const result = await queryOne<{ id: string }>(
    `INSERT INTO promotions (
      from_tier, to_tier, nominees, proposed_by, rationale,
      quorum_required, voting_ends_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id`,
    [
      fromTier,
      toTier,
      JSON.stringify(nomineeIds),
      proposerId,
      rationale || null,
      quorumRequired,
      votingEndsAt.toISOString()
    ]
  );
  
  return (await getPromotion(result!.id))!;
}

/**
 * Get promotion by ID
 */
export async function getPromotion(id: string): Promise<Promotion | null> {
  const promo = await queryOne<Promotion>(
    'SELECT * FROM promotions WHERE id = $1',
    [id]
  );
  if (!promo) return null;
  
  // Parse JSON arrays
  return {
    ...promo,
    nominees: promo.nominees as unknown as string[],
    votes_for: promo.votes_for as unknown as string[],
    votes_against: promo.votes_against as unknown as string[]
  };
}

/**
 * Get promotion with full details
 */
export async function getPromotionWithDetails(id: string): Promise<PromotionWithDetails | null> {
  const promo = await getPromotion(id);
  if (!promo) return null;
  
  // Get proposer name
  const proposer = await queryOne<{ name: string }>(
    'SELECT name FROM agents WHERE id = $1',
    [promo.proposed_by]
  );
  
  // Get nominee names
  const nominees = await query<{ name: string }>(
    'SELECT name FROM agents WHERE id = ANY($1)',
    [promo.nominees]
  );
  
  // Get tier threshold
  const tier = await getTier(promo.from_tier);
  
  // Get eligible voters count
  const eligibleVoters = await countTierMembers(promo.from_tier);
  
  return {
    ...promo,
    proposer_name: proposer?.name || 'Unknown',
    nominee_names: nominees.map(n => n.name),
    votes_for_count: promo.votes_for.length,
    votes_against_count: promo.votes_against.length,
    total_eligible_voters: eligibleVoters - promo.nominees.length, // nominees can't vote
    threshold: tier?.promotion_threshold || 0.67
  };
}

/**
 * List promotions with filters
 */
export async function listPromotions(options: {
  status?: string;
  from_tier?: number;
  limit?: number;
  offset?: number;
}): Promise<Promotion[]> {
  let sql = 'SELECT * FROM promotions WHERE 1=1';
  const params: (string | number)[] = [];
  let paramIndex = 1;
  
  if (options.status) {
    sql += ` AND status = $${paramIndex++}`;
    params.push(options.status);
  }
  
  if (options.from_tier !== undefined) {
    sql += ` AND from_tier = $${paramIndex++}`;
    params.push(options.from_tier);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  if (options.limit) {
    sql += ` LIMIT $${paramIndex++}`;
    params.push(options.limit);
  }
  
  if (options.offset) {
    sql += ` OFFSET $${paramIndex++}`;
    params.push(options.offset);
  }
  
  const promos = await query<Promotion>(sql, params);
  return promos.map(p => ({
    ...p,
    nominees: p.nominees as unknown as string[],
    votes_for: p.votes_for as unknown as string[],
    votes_against: p.votes_against as unknown as string[]
  }));
}

/**
 * Cast a vote on a promotion
 */
export async function voteOnPromotion(
  promotionId: string,
  voterId: string,
  vote: boolean,
  reason?: string
): Promise<void> {
  const promo = await getPromotion(promotionId);
  if (!promo) {
    throw new Error('Promotion not found');
  }
  
  // Check status
  if (promo.status !== 'pending') {
    throw new Error('Promotion is not open for voting');
  }
  
  // Check voting period
  if (new Date() > new Date(promo.voting_ends_at)) {
    throw new Error('Voting period has ended');
  }
  
  // Get voter
  const voter = await queryOne<{ tier: number; name: string }>(
    'SELECT tier, name FROM agents WHERE id = $1',
    [voterId]
  );
  if (!voter) {
    throw new Error('Voter not found');
  }
  
  // Must be same tier
  if (voter.tier !== promo.from_tier) {
    throw new Error('Only members of the same tier can vote');
  }
  
  // Can't vote if you're a nominee
  if (promo.nominees.includes(voterId)) {
    throw new Error('Nominees cannot vote on their own promotion');
  }
  
  // Check if already voted
  const existingVote = await queryOne<{ id: string }>(
    'SELECT id FROM promotion_votes WHERE promotion_id = $1 AND voter_id = $2',
    [promotionId, voterId]
  );
  
  if (existingVote) {
    // Update existing vote
    await query(
      'UPDATE promotion_votes SET vote = $1, reason = $2 WHERE promotion_id = $3 AND voter_id = $4',
      [vote, reason || null, promotionId, voterId]
    );
    
    // Update vote arrays
    if (vote) {
      await query(
        `UPDATE promotions 
         SET votes_for = (
           SELECT jsonb_agg(DISTINCT v) 
           FROM (
             SELECT jsonb_array_elements_text(votes_for) AS v
             UNION SELECT $2
           ) sub
           WHERE v != $2 OR $3 = true
         ),
         votes_against = votes_against - $2
         WHERE id = $1`,
        [promotionId, voterId, vote]
      );
    } else {
      await query(
        `UPDATE promotions 
         SET votes_against = (
           SELECT jsonb_agg(DISTINCT v) 
           FROM (
             SELECT jsonb_array_elements_text(votes_against) AS v
             UNION SELECT $2
           ) sub
           WHERE v != $2 OR $3 = false
         ),
         votes_for = votes_for - $2
         WHERE id = $1`,
        [promotionId, voterId, vote]
      );
    }
  } else {
    // Insert new vote
    await query(
      'INSERT INTO promotion_votes (promotion_id, voter_id, vote, reason) VALUES ($1, $2, $3, $4)',
      [promotionId, voterId, vote, reason || null]
    );
    
    // Update vote arrays
    const voteArray = vote ? 'votes_for' : 'votes_against';
    await query(
      `UPDATE promotions SET ${voteArray} = ${voteArray} || $2 WHERE id = $1`,
      [promotionId, JSON.stringify([voterId])]
    );
  }
  
  // Check if promotion should be resolved
  await checkPromotionResolution(promotionId);
}

/**
 * Check if promotion should be resolved
 */
export async function checkPromotionResolution(promotionId: string): Promise<void> {
  const promo = await getPromotion(promotionId);
  if (!promo || promo.status !== 'pending') return;
  
  const forVotes = promo.votes_for.length;
  const againstVotes = promo.votes_against.length;
  const totalVotes = forVotes + againstVotes;
  
  // Get tier config
  const tier = await getTier(promo.from_tier);
  const threshold = tier?.promotion_threshold || 0.67;
  
  // Get eligible voters (tier members minus nominees)
  const tierMembers = await countTierMembers(promo.from_tier);
  const eligibleVoters = tierMembers - promo.nominees.length;
  
  // Check if expired
  if (new Date() > new Date(promo.voting_ends_at)) {
    if (totalVotes >= promo.quorum_required && forVotes / totalVotes >= threshold) {
      await resolvePromotion(promotionId, 'approved');
    } else {
      await resolvePromotion(promotionId, 'expired');
    }
    return;
  }
  
  // Check if quorum met
  if (totalVotes < promo.quorum_required) {
    return; // Wait for more votes
  }
  
  // Check if approved (threshold met)
  if (forVotes / totalVotes >= threshold) {
    await resolvePromotion(promotionId, 'approved');
    return;
  }
  
  // Check if can't possibly pass (remaining votes can't reach threshold)
  const remainingVotes = eligibleVoters - totalVotes;
  const maxPossibleFor = forVotes + remainingVotes;
  if (maxPossibleFor / eligibleVoters < threshold) {
    await resolvePromotion(promotionId, 'rejected');
  }
}

/**
 * Resolve a promotion
 */
async function resolvePromotion(
  promotionId: string,
  status: 'approved' | 'rejected' | 'expired'
): Promise<void> {
  const promo = await getPromotion(promotionId);
  if (!promo) return;
  
  if (status === 'approved') {
    // Create tier if doesn't exist
    const exists = await tierExists(promo.to_tier);
    if (!exists) {
      await createTier(promo.to_tier, promotionId);
    }
    
    // Promote nominees
    for (const nomineeId of promo.nominees) {
      // Update tier
      await query(
        'UPDATE agents SET tier = $1 WHERE id = $2',
        [promo.to_tier, nomineeId]
      );
      
      // Add to promotion history
      await query(
        `UPDATE agents 
         SET promotion_history = promotion_history || $1
         WHERE id = $2`,
        [JSON.stringify([{
          promotion_id: promotionId,
          from_tier: promo.from_tier,
          to_tier: promo.to_tier,
          promoted_at: new Date().toISOString()
        }]), nomineeId]
      );
    }
  }
  
  // Update promotion status
  await query(
    'UPDATE promotions SET status = $1, resolved_at = NOW() WHERE id = $2',
    [status, promotionId]
  );
}

/**
 * Withdraw a promotion (proposer only)
 */
export async function withdrawPromotion(
  promotionId: string,
  withdrawerId: string
): Promise<void> {
  const promo = await getPromotion(promotionId);
  if (!promo) {
    throw new Error('Promotion not found');
  }
  
  if (promo.status !== 'pending') {
    throw new Error('Can only withdraw pending promotions');
  }
  
  if (promo.proposed_by !== withdrawerId) {
    throw new Error('Only proposer can withdraw');
  }
  
  await query(
    'UPDATE promotions SET status = $1, resolved_at = NOW() WHERE id = $2',
    ['withdrawn', promotionId]
  );
}

/**
 * Get votes for a promotion
 */
export async function getPromotionVotes(promotionId: string): Promise<PromotionVote[]> {
  return await query<PromotionVote>(
    `SELECT pv.*, a.name as voter_name
     FROM promotion_votes pv
     JOIN agents a ON pv.voter_id = a.id
     WHERE pv.promotion_id = $1
     ORDER BY pv.created_at ASC`,
    [promotionId]
  );
}

/**
 * Check and resolve expired promotions (call periodically)
 */
export async function resolveExpiredPromotions(): Promise<number> {
  const expired = await query<{ id: string }>(
    `SELECT id FROM promotions 
     WHERE status = 'pending' AND voting_ends_at < NOW()`
  );
  
  for (const promo of expired) {
    await checkPromotionResolution(promo.id);
  }
  
  return expired.length;
}
