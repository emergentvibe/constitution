/**
 * Tests for checkPromotionResolution — the most bug-prone function.
 * All DB calls mocked.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { mockQuery, mockQueryOne, resetDbMocks } from '../mocks/db';

// Must import AFTER mock is set up
import { checkPromotionResolution, withdrawPromotion, createPromotion, listPromotions } from '@/lib/promotions';

// Helper to build a mock promotion
function makePromotion(overrides: Record<string, unknown> = {}) {
  return {
    id: 'promo-1',
    from_tier: 2,
    to_tier: 3,
    nominees: ['nominee-1'],
    proposed_by: 'proposer-1',
    rationale: 'Good work',
    votes_for: [] as string[],
    votes_against: [] as string[],
    quorum_required: 2,
    status: 'pending',
    created_at: new Date().toISOString(),
    voting_ends_at: new Date(Date.now() + 86400_000).toISOString(), // +1 day
    resolved_at: null,
    ...overrides,
  };
}

describe('checkPromotionResolution', () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it('does nothing for a non-existent promotion', async () => {
    mockQueryOne.mockResolvedValueOnce(null); // getPromotion
    await checkPromotionResolution('nonexistent');
    // Should return without updating anything
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('does nothing for an already-resolved promotion', async () => {
    mockQueryOne.mockResolvedValueOnce(makePromotion({ status: 'approved' }));
    await checkPromotionResolution('promo-1');
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('quorum met + threshold met → approved', async () => {
    const promo = makePromotion({
      votes_for: ['a', 'b', 'c'],
      votes_against: [],
      quorum_required: 2,
    });

    // getPromotion (called twice: once in check, once in resolvePromotion)
    mockQueryOne
      .mockResolvedValueOnce(promo) // checkPromotionResolution → getPromotion
      .mockResolvedValueOnce({ promotion_threshold: 0.67, decision_scope: [] }) // getTier
      .mockResolvedValueOnce({ count: '5' }) // countTierMembers
      .mockResolvedValueOnce(promo) // resolvePromotion → getPromotion
      .mockResolvedValueOnce({ exists: true }) // tierExists
      .mockResolvedValue(null); // remaining queries

    mockQuery.mockResolvedValue([]);

    await checkPromotionResolution('promo-1');

    // Should have called UPDATE agents SET tier and UPDATE promotions SET status = 'approved'
    const updateCalls = mockQuery.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('UPDATE promotions SET status')
    );
    expect(updateCalls.length).toBeGreaterThan(0);
    expect(updateCalls[0][1]).toContain('approved');
  });

  it('quorum met + threshold NOT met → waits (not yet rejected)', async () => {
    const promo = makePromotion({
      votes_for: ['a'],
      votes_against: ['b', 'c'],
      quorum_required: 2,
    });

    mockQueryOne
      .mockResolvedValueOnce(promo) // getPromotion
      .mockResolvedValueOnce({ promotion_threshold: 0.67, decision_scope: [] }) // getTier
      .mockResolvedValueOnce({ count: '10' }); // countTierMembers (10 members - 1 nominee = 9 eligible)

    mockQuery.mockResolvedValue([]);

    await checkPromotionResolution('promo-1');

    // With 10 members, 1 nominee: eligible = 9.
    // 1 for, 2 against, 3 total. 6 remaining.
    // maxPossibleFor = 1 + 6 = 7. 7/9 = 0.78 >= 0.67, so still possible.
    // No resolution should happen.
    const updateCalls = mockQuery.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('UPDATE promotions SET status')
    );
    expect(updateCalls.length).toBe(0);
  });

  it('not expired, quorum not yet met → no resolution', async () => {
    const promo = makePromotion({
      votes_for: ['a'],
      votes_against: [],
      quorum_required: 3,
    });

    mockQueryOne
      .mockResolvedValueOnce(promo) // getPromotion
      .mockResolvedValueOnce({ promotion_threshold: 0.67, decision_scope: [] }) // getTier
      .mockResolvedValueOnce({ count: '5' }); // countTierMembers

    await checkPromotionResolution('promo-1');

    // No status update
    const updateCalls = mockQuery.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('UPDATE promotions SET status')
    );
    expect(updateCalls.length).toBe(0);
  });

  it('expired + quorum met + threshold met → approved', async () => {
    const promo = makePromotion({
      votes_for: ['a', 'b', 'c'],
      votes_against: [],
      quorum_required: 2,
      voting_ends_at: new Date(Date.now() - 86400_000).toISOString(), // -1 day
    });

    mockQueryOne
      .mockResolvedValueOnce(promo) // getPromotion
      .mockResolvedValueOnce({ promotion_threshold: 0.67, decision_scope: [] }) // getTier
      .mockResolvedValueOnce({ count: '5' }) // countTierMembers
      .mockResolvedValueOnce(promo) // resolvePromotion → getPromotion
      .mockResolvedValueOnce({ exists: true }) // tierExists
      .mockResolvedValue(null);

    mockQuery.mockResolvedValue([]);

    await checkPromotionResolution('promo-1');

    const updateCalls = mockQuery.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('UPDATE promotions SET status')
    );
    expect(updateCalls.length).toBeGreaterThan(0);
    expect(updateCalls[0][1]).toContain('approved');
  });

  it('expired + quorum NOT met → expired', async () => {
    const promo = makePromotion({
      votes_for: ['a'],
      votes_against: [],
      quorum_required: 5,
      voting_ends_at: new Date(Date.now() - 86400_000).toISOString(), // -1 day
    });

    mockQueryOne
      .mockResolvedValueOnce(promo) // getPromotion
      .mockResolvedValueOnce({ promotion_threshold: 0.67, decision_scope: [] }) // getTier
      .mockResolvedValueOnce({ count: '10' }) // countTierMembers
      .mockResolvedValueOnce(promo) // resolvePromotion → getPromotion
      .mockResolvedValue(null);

    mockQuery.mockResolvedValue([]);

    await checkPromotionResolution('promo-1');

    const updateCalls = mockQuery.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('UPDATE promotions SET status')
    );
    expect(updateCalls.length).toBeGreaterThan(0);
    expect(updateCalls[0][1]).toContain('expired');
  });

  it('early rejection: mathematically impossible to pass', async () => {
    // 5 members, 1 nominee = 4 eligible. Threshold 0.67.
    // Need ceil(4 * 0.67) = 3 for votes.
    // If 3 against already: maxPossibleFor = 0 + (4-3) = 1. 1/4 = 0.25 < 0.67 → reject.
    const promo = makePromotion({
      votes_for: [],
      votes_against: ['a', 'b', 'c'],
      quorum_required: 2,
    });

    mockQueryOne
      .mockResolvedValueOnce(promo) // getPromotion
      .mockResolvedValueOnce({ promotion_threshold: 0.67, decision_scope: [] }) // getTier
      .mockResolvedValueOnce({ count: '5' }) // countTierMembers (5 - 1 nominee = 4 eligible)
      .mockResolvedValueOnce(promo) // resolvePromotion → getPromotion
      .mockResolvedValue(null);

    mockQuery.mockResolvedValue([]);

    await checkPromotionResolution('promo-1');

    const updateCalls = mockQuery.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('UPDATE promotions SET status')
    );
    expect(updateCalls.length).toBeGreaterThan(0);
    expect(updateCalls[0][1]).toContain('rejected');
  });
});

describe('withdrawPromotion', () => {
  beforeEach(() => resetDbMocks());

  it('allows proposer to withdraw pending promotion', async () => {
    mockQueryOne.mockResolvedValueOnce(makePromotion({ proposed_by: 'proposer-1' }));
    mockQuery.mockResolvedValue([]);

    await withdrawPromotion('promo-1', 'proposer-1');

    const updateCalls = mockQuery.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('UPDATE promotions SET status')
    );
    expect(updateCalls.length).toBe(1);
    expect(updateCalls[0][1]).toContain('withdrawn');
  });

  it('throws when promotion not found', async () => {
    mockQueryOne.mockResolvedValueOnce(null);
    await expect(withdrawPromotion('nonexistent', 'user-1')).rejects.toThrow('Promotion not found');
  });

  it('throws when promotion is not pending', async () => {
    mockQueryOne.mockResolvedValueOnce(makePromotion({ status: 'approved' }));
    await expect(withdrawPromotion('promo-1', 'proposer-1')).rejects.toThrow('Can only withdraw pending');
  });

  it('throws when non-proposer tries to withdraw', async () => {
    mockQueryOne.mockResolvedValueOnce(makePromotion({ proposed_by: 'proposer-1' }));
    await expect(withdrawPromotion('promo-1', 'someone-else')).rejects.toThrow('Only proposer');
  });
});

describe('createPromotion', () => {
  beforeEach(() => resetDbMocks());

  it('throws when proposer not found', async () => {
    mockQueryOne.mockResolvedValueOnce(null); // proposer lookup
    await expect(createPromotion('unknown', ['nominee-1'])).rejects.toThrow('Proposer not found');
  });

  it('throws when nominees not found', async () => {
    mockQueryOne.mockResolvedValueOnce({ tier: 2, name: 'Alice' }); // proposer
    mockQuery.mockResolvedValueOnce([]); // nominees lookup — none found
    await expect(createPromotion('proposer-1', ['nominee-1'])).rejects.toThrow('One or more nominees not found');
  });

  it('throws when nominee is wrong tier', async () => {
    mockQueryOne.mockResolvedValueOnce({ tier: 2, name: 'Alice' }); // proposer at tier 2
    mockQuery.mockResolvedValueOnce([
      { id: 'nominee-1', tier: 1, name: 'Bob' }, // nominee at tier 1 — mismatch!
    ]);
    await expect(createPromotion('proposer-1', ['nominee-1'])).rejects.toThrow('not in tier 2');
  });

  it('throws when proposer tries to self-nominate', async () => {
    mockQueryOne
      .mockResolvedValueOnce({ tier: 2, name: 'Alice' }); // proposer
    mockQuery
      .mockResolvedValueOnce([{ id: 'proposer-1', tier: 2, name: 'Alice' }]); // nominee = self
    // cooldown config lookup
    mockQueryOne
      .mockResolvedValueOnce({ value: '7' }) // getConfig('promotion_cooldown_days')
      .mockResolvedValueOnce(null); // no recent failed promotions
    await expect(createPromotion('proposer-1', ['proposer-1'])).rejects.toThrow('Cannot nominate yourself');
  });
});

describe('listPromotions', () => {
  beforeEach(() => resetDbMocks());

  it('returns promotions with parsed JSON arrays', async () => {
    mockQuery.mockResolvedValueOnce([
      makePromotion({ id: 'promo-1' }),
      makePromotion({ id: 'promo-2', status: 'approved' }),
    ]);

    const promos = await listPromotions({});
    expect(promos).toHaveLength(2);
    expect(promos[0].id).toBe('promo-1');
    expect(Array.isArray(promos[0].nominees)).toBe(true);
  });

  it('returns empty array when no promotions', async () => {
    mockQuery.mockResolvedValueOnce([]);
    const promos = await listPromotions({});
    expect(promos).toEqual([]);
  });

  it('filters by status', async () => {
    mockQuery.mockResolvedValueOnce([makePromotion()]);

    await listPromotions({ status: 'pending' });
    const queryStr = mockQuery.mock.calls[0][0] as string;
    expect(queryStr).toContain('status');
    expect(mockQuery.mock.calls[0][1]).toContain('pending');
  });
});
