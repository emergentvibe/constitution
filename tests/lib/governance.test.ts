/**
 * Tests for governance voting eligibility.
 * All DB calls mocked via tests/mocks/db.ts.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { mockQuery, mockQueryOne, resetDbMocks } from '../mocks/db';

import { canVoteOnProposal, canVoteOnPromotion } from '@/lib/governance';

describe('canVoteOnProposal', () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it('allows Tier 2 voter with no prior vote', async () => {
    // queryOne: find voter
    mockQueryOne.mockResolvedValueOnce({
      id: 'voter-1',
      tier: 2,
      operator_address: null,
    });
    // query: check existing vote → empty
    mockQuery.mockResolvedValueOnce([]);

    const result = await canVoteOnProposal('0xvoter', 'proposal-1');
    expect(result.eligible).toBe(true);
  });

  it('blocks unregistered wallet', async () => {
    mockQueryOne.mockResolvedValueOnce(null);

    const result = await canVoteOnProposal('0xunknown', 'proposal-1');
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.error).toContain('Not a registered agent');
      expect(result.status).toBe(403);
    }
  });

  it('blocks Tier 1 voter', async () => {
    mockQueryOne.mockResolvedValueOnce({
      id: 'voter-1',
      tier: 1,
      operator_address: null,
    });

    const result = await canVoteOnProposal('0xvoter', 'proposal-1');
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.error).toContain('Tier 2+');
    }
  });

  it('blocks duplicate vote', async () => {
    mockQueryOne.mockResolvedValueOnce({
      id: 'voter-1',
      tier: 2,
      operator_address: null,
    });
    // Existing vote found
    mockQuery.mockResolvedValueOnce([{ id: 'vote-1' }]);

    const result = await canVoteOnProposal('0xvoter', 'proposal-1');
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.error).toContain('already voted');
    }
  });

  it('blocks operator dedup: same operator via different agent', async () => {
    mockQueryOne.mockResolvedValueOnce({
      id: 'voter-agent-2',
      tier: 2,
      operator_address: '0xoperator',
    });
    // No direct vote
    mockQuery.mockResolvedValueOnce([]);
    // But operator already voted via another agent
    mockQuery.mockResolvedValueOnce([{ id: 'vote-from-agent-1' }]);

    const result = await canVoteOnProposal('0xvoter', 'proposal-1');
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.error).toContain('operator has already voted');
    }
  });

  it('allows Tier 3 voter', async () => {
    mockQueryOne.mockResolvedValueOnce({
      id: 'voter-1',
      tier: 3,
      operator_address: null,
    });
    mockQuery.mockResolvedValueOnce([]);

    const result = await canVoteOnProposal('0xvoter', 'proposal-1');
    expect(result.eligible).toBe(true);
  });
});

describe('canVoteOnPromotion', () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it('allows same-tier voter who is not a nominee', async () => {
    mockQueryOne.mockResolvedValueOnce({ tier: 2, name: 'voter', operator_address: null });

    const result = await canVoteOnPromotion('voter-1', 'promo-1', 2, ['nominee-1']);
    expect(result.eligible).toBe(true);
  });

  it('blocks voter not found', async () => {
    mockQueryOne.mockResolvedValueOnce(null);

    const result = await canVoteOnPromotion('unknown', 'promo-1', 2, ['nominee-1']);
    expect(result.eligible).toBe(false);
    if (!result.eligible) expect(result.error).toContain('Voter not found');
  });

  it('blocks voter from different tier', async () => {
    mockQueryOne.mockResolvedValueOnce({ tier: 1, name: 'voter', operator_address: null });

    const result = await canVoteOnPromotion('voter-1', 'promo-1', 2, ['nominee-1']);
    expect(result.eligible).toBe(false);
    if (!result.eligible) expect(result.error).toContain('same tier');
  });

  it('blocks nominee self-vote', async () => {
    mockQueryOne.mockResolvedValueOnce({ tier: 2, name: 'nominee', operator_address: null });

    const result = await canVoteOnPromotion('nominee-1', 'promo-1', 2, ['nominee-1']);
    expect(result.eligible).toBe(false);
    if (!result.eligible) expect(result.error).toContain('Nominees cannot vote');
  });

  it('blocks operator dedup', async () => {
    mockQueryOne
      .mockResolvedValueOnce({ tier: 2, name: 'voter', operator_address: '0xop' })
      .mockResolvedValueOnce({ voter_id: 'other-agent' }); // operator already voted

    const result = await canVoteOnPromotion('voter-1', 'promo-1', 2, ['nominee-1']);
    expect(result.eligible).toBe(false);
    if (!result.eligible) expect(result.error).toContain('operator has already voted');
  });
});
