/**
 * Tier Management
 * Dynamic tier system with infinite escalation
 */

import { query, queryOne } from './db';

export interface Tier {
  level: number;
  name: string | null;
  created_at: string;
  created_by_promotion: string | null;
  min_members: number;
  max_members: number | null;
  promotion_threshold: number;
  decision_threshold: number;
  decision_scope: string[];
  member_count?: number;
}

export interface NetworkConfig {
  founding_board_size: number;
  bootstrap_tier: number;
  promotion_cooldown_days: number;
  promotion_voting_days: number;
  max_tier_jump: number;
  default_promotion_threshold: number;
  default_quorum_percent: number;
}

/**
 * Get network configuration value
 */
export async function getConfig<K extends keyof NetworkConfig>(key: K): Promise<NetworkConfig[K]> {
  const result = await queryOne<{ value: string }>(
    'SELECT value FROM network_config WHERE key = $1',
    [key]
  );
  if (!result) {
    throw new Error(`Config key not found: ${key}`);
  }
  return JSON.parse(result.value) as NetworkConfig[K];
}

/**
 * Get all network configuration
 */
export async function getAllConfig(): Promise<NetworkConfig> {
  const rows = await query<{ key: string; value: string }>(
    'SELECT key, value FROM network_config'
  );
  const config: Partial<NetworkConfig> = {};
  for (const row of rows) {
    (config as Record<string, unknown>)[row.key] = JSON.parse(row.value);
  }
  return config as NetworkConfig;
}

/**
 * Update network configuration
 */
export async function setConfig<K extends keyof NetworkConfig>(
  key: K, 
  value: NetworkConfig[K]
): Promise<void> {
  await query(
    `INSERT INTO network_config (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2`,
    [key, JSON.stringify(value)]
  );
}

/**
 * Get all tiers with member counts.
 * When constitutionId is provided, member counts are scoped to that constitution.
 */
export async function getTiers(constitutionId?: string): Promise<Tier[]> {
  const tiers = constitutionId
    ? await query<Tier & { member_count: string }>(
        `SELECT t.*,
                (SELECT COUNT(*) FROM agents WHERE tier = t.level AND constitution_id = $1) as member_count
         FROM tiers t
         ORDER BY t.level ASC`,
        [constitutionId]
      )
    : await query<Tier & { member_count: string }>(
        `SELECT t.*,
                (SELECT COUNT(*) FROM agents WHERE tier = t.level) as member_count
         FROM tiers t
         ORDER BY t.level ASC`
      );
  return tiers.map(t => ({
    ...t,
    decision_scope: t.decision_scope as unknown as string[],
    member_count: parseInt(t.member_count || '0')
  }));
}

/**
 * Get single tier.
 * When constitutionId is provided, member count is scoped to that constitution.
 */
export async function getTier(level: number, constitutionId?: string): Promise<Tier | null> {
  const tier = constitutionId
    ? await queryOne<Tier & { member_count: string }>(
        `SELECT t.*,
                (SELECT COUNT(*) FROM agents WHERE tier = t.level AND constitution_id = $2) as member_count
         FROM tiers t
         WHERE t.level = $1`,
        [level, constitutionId]
      )
    : await queryOne<Tier & { member_count: string }>(
        `SELECT t.*,
                (SELECT COUNT(*) FROM agents WHERE tier = t.level) as member_count
         FROM tiers t
         WHERE t.level = $1`,
        [level]
      );
  if (!tier) return null;
  return {
    ...tier,
    decision_scope: tier.decision_scope as unknown as string[],
    member_count: parseInt(tier.member_count || '0')
  };
}

/**
 * Get highest existing tier level
 */
export async function getHighestTier(): Promise<number> {
  const result = await queryOne<{ max: number }>(
    'SELECT COALESCE(MAX(level), 1) as max FROM tiers'
  );
  return result?.max || 1;
}

/**
 * Create a new tier (called when promotion to non-existent tier is approved)
 */
export async function createTier(
  level: number,
  promotionId: string,
  name?: string
): Promise<Tier> {
  const config = await getAllConfig();
  
  // Default name based on level
  const tierName = name || `Tier ${level}`;
  
  // Higher tiers get more decision scope
  const baseScope = ['deliberation', 'operational', 'policy', 'promotion'];
  const scope = level >= 3 
    ? [...baseScope, 'constitutional', 'enforcement']
    : baseScope;
  
  await query(
    `INSERT INTO tiers (level, name, created_by_promotion, decision_scope, promotion_threshold)
     VALUES ($1, $2, $3, $4, $5)`,
    [level, tierName, promotionId, JSON.stringify(scope), config.default_promotion_threshold]
  );
  
  return (await getTier(level))!;
}

/**
 * Check if tier exists
 */
export async function tierExists(level: number): Promise<boolean> {
  const result = await queryOne<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM tiers WHERE level = $1) as exists',
    [level]
  );
  return result?.exists || false;
}

/**
 * Get members of a tier.
 * When constitutionId is provided, only returns members of that constitution.
 */
export async function getTierMembers(level: number, constitutionId?: string): Promise<Array<{
  id: string;
  name: string;
  wallet_address: string;
  registered_at: string;
}>> {
  return constitutionId
    ? await query(
        `SELECT id, name, wallet_address, registered_at
         FROM agents
         WHERE tier = $1 AND constitution_id = $2
         ORDER BY registered_at ASC`,
        [level, constitutionId]
      )
    : await query(
        `SELECT id, name, wallet_address, registered_at
         FROM agents
         WHERE tier = $1
         ORDER BY registered_at ASC`,
        [level]
      );
}

/**
 * Count members at a tier level.
 * When constitutionId is provided, only counts members of that constitution.
 */
export async function countTierMembers(level: number, constitutionId?: string): Promise<number> {
  const result = constitutionId
    ? await queryOne<{ count: string }>(
        'SELECT COUNT(*) as count FROM agents WHERE tier = $1 AND constitution_id = $2',
        [level, constitutionId]
      )
    : await queryOne<{ count: string }>(
        'SELECT COUNT(*) as count FROM agents WHERE tier = $1',
        [level]
      );
  return parseInt(result?.count || '0');
}

/**
 * Get tier statistics.
 * When constitutionId is provided, stats are scoped to that constitution.
 */
export async function getTierStats(constitutionId?: string): Promise<{
  total_tiers: number;
  total_members: number;
  highest_tier: number;
  members_by_tier: Record<number, number>;
}> {
  const tiers = await getTiers(constitutionId);
  const membersByTier: Record<number, number> = {};
  let totalMembers = 0;
  
  for (const tier of tiers) {
    membersByTier[tier.level] = tier.member_count || 0;
    totalMembers += tier.member_count || 0;
  }
  
  return {
    total_tiers: tiers.length,
    total_members: totalMembers,
    highest_tier: tiers.length > 0 ? Math.max(...tiers.map(t => t.level)) : 1,
    members_by_tier: membersByTier
  };
}
