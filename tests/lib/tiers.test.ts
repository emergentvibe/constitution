/**
 * Tests for tier management — the backbone of governance hierarchy.
 * All DB calls mocked via tests/mocks/db.ts.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { mockQuery, mockQueryOne, resetDbMocks } from '../mocks/db';

import {
  getConfig,
  getAllConfig,
  getTiers,
  getTier,
  getHighestTier,
  createTier,
  tierExists,
  getTierMembers,
  countTierMembers,
  getTierStats,
} from '@/lib/tiers';

describe('getConfig', () => {
  beforeEach(() => resetDbMocks());

  it('returns parsed config value', async () => {
    mockQueryOne.mockResolvedValueOnce({ value: '10' });
    const result = await getConfig('founding_board_size');
    expect(result).toBe(10);
  });

  it('throws when key not found', async () => {
    mockQueryOne.mockResolvedValueOnce(null);
    await expect(getConfig('founding_board_size')).rejects.toThrow('Config key not found');
  });
});

describe('getAllConfig', () => {
  beforeEach(() => resetDbMocks());

  it('returns all config as typed object', async () => {
    mockQuery.mockResolvedValueOnce([
      { key: 'founding_board_size', value: '5' },
      { key: 'bootstrap_tier', value: '2' },
      { key: 'promotion_cooldown_days', value: '7' },
    ]);
    const config = await getAllConfig();
    expect(config.founding_board_size).toBe(5);
    expect(config.bootstrap_tier).toBe(2);
    expect(config.promotion_cooldown_days).toBe(7);
  });
});

describe('getTiers', () => {
  beforeEach(() => resetDbMocks());

  it('returns tiers with parsed member counts', async () => {
    mockQuery.mockResolvedValueOnce([
      { level: 1, name: 'Tier 1', member_count: '42', decision_scope: ['deliberation'], promotion_threshold: 0.67 },
      { level: 2, name: 'Tier 2', member_count: '8', decision_scope: ['deliberation', 'operational'], promotion_threshold: 0.67 },
    ]);

    const tiers = await getTiers();
    expect(tiers).toHaveLength(2);
    expect(tiers[0].member_count).toBe(42);
    expect(tiers[1].member_count).toBe(8);
    expect(typeof tiers[0].member_count).toBe('number');
  });

  it('returns empty array when no tiers exist', async () => {
    mockQuery.mockResolvedValueOnce([]);
    const tiers = await getTiers();
    expect(tiers).toEqual([]);
  });

  it('scopes member counts to constitution when constitutionId provided', async () => {
    mockQuery.mockResolvedValueOnce([
      { level: 1, name: 'Tier 1', member_count: '3', decision_scope: [], promotion_threshold: 0.67 },
    ]);

    await getTiers('const-123');

    // Verify the constitution-scoped query was used
    const queryArg = mockQuery.mock.calls[0][0] as string;
    expect(queryArg).toContain('constitution_id');
    expect(mockQuery.mock.calls[0][1]).toEqual(['const-123']);
  });
});

describe('getTier', () => {
  beforeEach(() => resetDbMocks());

  it('returns tier with parsed member count', async () => {
    mockQueryOne.mockResolvedValueOnce({
      level: 2, name: 'Tier 2', member_count: '5', decision_scope: ['deliberation'], promotion_threshold: 0.67,
    });

    const tier = await getTier(2);
    expect(tier).not.toBeNull();
    expect(tier!.level).toBe(2);
    expect(tier!.member_count).toBe(5);
  });

  it('returns null for nonexistent tier', async () => {
    mockQueryOne.mockResolvedValueOnce(null);
    const tier = await getTier(99);
    expect(tier).toBeNull();
  });

  it('scopes to constitution when constitutionId provided', async () => {
    mockQueryOne.mockResolvedValueOnce({
      level: 1, name: 'Tier 1', member_count: '2', decision_scope: [], promotion_threshold: 0.67,
    });

    await getTier(1, 'const-456');
    const queryArg = mockQueryOne.mock.calls[0][0] as string;
    expect(queryArg).toContain('constitution_id');
  });
});

describe('getHighestTier', () => {
  beforeEach(() => resetDbMocks());

  it('returns highest tier level', async () => {
    mockQueryOne.mockResolvedValueOnce({ max: 4 });
    const highest = await getHighestTier();
    expect(highest).toBe(4);
  });

  it('returns 1 when no tiers exist', async () => {
    mockQueryOne.mockResolvedValueOnce({ max: 1 });
    const highest = await getHighestTier();
    expect(highest).toBe(1);
  });

  it('returns 1 when query returns null', async () => {
    mockQueryOne.mockResolvedValueOnce(null);
    const highest = await getHighestTier();
    expect(highest).toBe(1);
  });
});

describe('tierExists', () => {
  beforeEach(() => resetDbMocks());

  it('returns true when tier exists', async () => {
    mockQueryOne.mockResolvedValueOnce({ exists: true });
    expect(await tierExists(2)).toBe(true);
  });

  it('returns false when tier does not exist', async () => {
    mockQueryOne.mockResolvedValueOnce({ exists: false });
    expect(await tierExists(99)).toBe(false);
  });

  it('returns false when query returns null', async () => {
    mockQueryOne.mockResolvedValueOnce(null);
    expect(await tierExists(5)).toBe(false);
  });
});

describe('countTierMembers', () => {
  beforeEach(() => resetDbMocks());

  it('returns parsed count', async () => {
    mockQueryOne.mockResolvedValueOnce({ count: '15' });
    expect(await countTierMembers(2)).toBe(15);
  });

  it('returns 0 when no members', async () => {
    mockQueryOne.mockResolvedValueOnce({ count: '0' });
    expect(await countTierMembers(3)).toBe(0);
  });

  it('returns 0 when query returns null', async () => {
    mockQueryOne.mockResolvedValueOnce(null);
    expect(await countTierMembers(5)).toBe(0);
  });

  it('scopes to constitution when constitutionId provided', async () => {
    mockQueryOne.mockResolvedValueOnce({ count: '3' });
    await countTierMembers(1, 'const-789');
    const queryArg = mockQueryOne.mock.calls[0][0] as string;
    expect(queryArg).toContain('constitution_id');
  });
});

describe('getTierMembers', () => {
  beforeEach(() => resetDbMocks());

  it('returns members list', async () => {
    mockQuery.mockResolvedValueOnce([
      { id: 'm1', name: 'Alice', wallet_address: '0xaaa', registered_at: '2026-01-01' },
      { id: 'm2', name: 'Bob', wallet_address: '0xbbb', registered_at: '2026-01-02' },
    ]);

    const members = await getTierMembers(2);
    expect(members).toHaveLength(2);
    expect(members[0].name).toBe('Alice');
  });

  it('scopes to constitution when constitutionId provided', async () => {
    mockQuery.mockResolvedValueOnce([]);
    await getTierMembers(1, 'const-123');
    const queryArg = mockQuery.mock.calls[0][0] as string;
    expect(queryArg).toContain('constitution_id');
  });
});

describe('createTier', () => {
  beforeEach(() => resetDbMocks());

  it('creates tier with default name and scope', async () => {
    // getAllConfig
    mockQuery.mockResolvedValueOnce([
      { key: 'default_promotion_threshold', value: '0.67' },
    ]);
    // INSERT
    mockQuery.mockResolvedValueOnce([]);
    // getTier (called by createTier return)
    mockQueryOne.mockResolvedValueOnce({
      level: 3, name: 'Tier 3', member_count: '0',
      decision_scope: ['deliberation', 'operational', 'policy', 'promotion', 'constitutional', 'enforcement'],
      promotion_threshold: 0.67,
    });

    const tier = await createTier(3, 'promo-123');
    expect(tier.level).toBe(3);
    expect(tier.name).toBe('Tier 3');

    // Verify INSERT was called with correct params
    const insertCall = mockQuery.mock.calls[1];
    expect(insertCall[1]).toContain(3); // level
    expect(insertCall[1]).toContain('Tier 3'); // default name
    expect(insertCall[1]).toContain('promo-123'); // promotion ID
  });

  it('uses custom name when provided', async () => {
    mockQuery.mockResolvedValueOnce([
      { key: 'default_promotion_threshold', value: '0.67' },
    ]);
    mockQuery.mockResolvedValueOnce([]);
    mockQueryOne.mockResolvedValueOnce({
      level: 4, name: 'Council', member_count: '0', decision_scope: [], promotion_threshold: 0.67,
    });

    const tier = await createTier(4, 'promo-456', 'Council');
    expect(tier.name).toBe('Council');
    const insertCall = mockQuery.mock.calls[1];
    expect(insertCall[1]).toContain('Council');
  });

  it('gives higher tiers constitutional+enforcement scope', async () => {
    mockQuery.mockResolvedValueOnce([
      { key: 'default_promotion_threshold', value: '0.67' },
    ]);
    mockQuery.mockResolvedValueOnce([]);
    mockQueryOne.mockResolvedValueOnce({
      level: 3, name: 'Tier 3', member_count: '0', decision_scope: [], promotion_threshold: 0.67,
    });

    await createTier(3, 'promo-789');
    const insertCall = mockQuery.mock.calls[1];
    const scopeJson = insertCall[1]![3] as string;
    const scope = JSON.parse(scopeJson);
    expect(scope).toContain('constitutional');
    expect(scope).toContain('enforcement');
  });

  it('gives lower tiers base scope without constitutional', async () => {
    mockQuery.mockResolvedValueOnce([
      { key: 'default_promotion_threshold', value: '0.67' },
    ]);
    mockQuery.mockResolvedValueOnce([]);
    mockQueryOne.mockResolvedValueOnce({
      level: 2, name: 'Tier 2', member_count: '0', decision_scope: [], promotion_threshold: 0.67,
    });

    await createTier(2, 'promo-abc');
    const insertCall = mockQuery.mock.calls[1];
    const scopeJson = insertCall[1]![3] as string;
    const scope = JSON.parse(scopeJson);
    expect(scope).not.toContain('constitutional');
    expect(scope).not.toContain('enforcement');
    expect(scope).toContain('deliberation');
  });
});

describe('getTierStats', () => {
  beforeEach(() => resetDbMocks());

  it('aggregates stats from all tiers', async () => {
    mockQuery.mockResolvedValueOnce([
      { level: 1, name: 'Tier 1', member_count: '20', decision_scope: [], promotion_threshold: 0.67 },
      { level: 2, name: 'Tier 2', member_count: '5', decision_scope: [], promotion_threshold: 0.67 },
      { level: 3, name: 'Tier 3', member_count: '1', decision_scope: [], promotion_threshold: 0.67 },
    ]);

    const stats = await getTierStats();
    expect(stats.total_tiers).toBe(3);
    expect(stats.total_members).toBe(26);
    expect(stats.highest_tier).toBe(3);
    expect(stats.members_by_tier[1]).toBe(20);
    expect(stats.members_by_tier[2]).toBe(5);
    expect(stats.members_by_tier[3]).toBe(1);
  });

  it('handles no tiers', async () => {
    mockQuery.mockResolvedValueOnce([]);

    const stats = await getTierStats();
    expect(stats.total_tiers).toBe(0);
    expect(stats.total_members).toBe(0);
    expect(stats.highest_tier).toBe(1); // default
  });
});
