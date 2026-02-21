/**
 * Tests for checkPromotionResolution — the most bug-prone function.
 * All DB calls mocked.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { mockQuery, mockQueryOne, resetDbMocks } from '../mocks/db';

// Must import AFTER mock is set up
import { checkPromotionResolution } from '@/lib/promotions';

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
