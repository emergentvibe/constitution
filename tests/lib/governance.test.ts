/**
 * Tests for governance voting eligibility.
 * All DB calls mocked via tests/mocks/db.ts.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { mockQuery, mockQueryOne, resetDbMocks } from '../mocks/db';

import { canVoteOnProposal, canVoteOnPromotion, canCommentOnProposal } from '@/lib/governance';

describe('canVoteOnProposal', () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it('allows Tier 2 member with no prior vote', async () => {
    mockQueryOne.mockResolvedValueOnce({ id: 'voter-1', tier: 2 });
    mockQuery.mockResolvedValueOnce([]);

    const result = await canVoteOnProposal('0xvoter', 'proposal-1');
    expect(result.eligible).toBe(true);
  });

  it('blocks unregistered wallet', async () => {
    mockQueryOne.mockResolvedValueOnce(null);

    const result = await canVoteOnProposal('0xunknown', 'proposal-1');
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.error).toContain('Not a registered member');
      expect(result.status).toBe(403);
    }
  });

  it('blocks Tier 1 member', async () => {
    mockQueryOne.mockResolvedValueOnce({ id: 'voter-1', tier: 1 });

    const result = await canVoteOnProposal('0xvoter', 'proposal-1');
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.error).toContain('Tier 2+');
    }
  });

  it('blocks duplicate vote', async () => {
    mockQueryOne.mockResolvedValueOnce({ id: 'voter-1', tier: 2 });
    mockQuery.mockResolvedValueOnce([{ id: 'vote-1' }]);

    const result = await canVoteOnProposal('0xvoter', 'proposal-1');
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.error).toContain('already voted');
    }
  });

  it('allows Tier 3 member', async () => {
    mockQueryOne.mockResolvedValueOnce({ id: 'voter-1', tier: 3 });
    mockQuery.mockResolvedValueOnce([]);

    const result = await canVoteOnProposal('0xvoter', 'proposal-1');
    expect(result.eligible).toBe(true);
  });

  it('scopes to constitution when constitutionId provided', async () => {
    mockQueryOne.mockResolvedValueOnce({ id: 'voter-1', tier: 2 });
    mockQuery.mockResolvedValueOnce([]);

    const result = await canVoteOnProposal('0xvoter', 'proposal-1', 'const-123');
    expect(result.eligible).toBe(true);
    // Verify constitution-scoped query was used
    expect(mockQueryOne.mock.calls[0][1]).toEqual(['0xvoter', 'const-123']);
  });

  it('lowercases wallet address', async () => {
    mockQueryOne.mockResolvedValueOnce({ id: 'voter-1', tier: 2 });
    mockQuery.mockResolvedValueOnce([]);

    await canVoteOnProposal('0xABCDEF', 'proposal-1');
    expect(mockQueryOne.mock.calls[0][1]![0]).toBe('0xabcdef');
  });
});

describe('canVoteOnPromotion', () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it('allows same-tier member who is not a nominee', async () => {
    mockQueryOne.mockResolvedValueOnce({ tier: 2, name: 'voter' });

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
    mockQueryOne.mockResolvedValueOnce({ tier: 1, name: 'voter' });

    const result = await canVoteOnPromotion('voter-1', 'promo-1', 2, ['nominee-1']);
    expect(result.eligible).toBe(false);
    if (!result.eligible) expect(result.error).toContain('same tier');
  });

  it('blocks nominee self-vote', async () => {
    mockQueryOne.mockResolvedValueOnce({ tier: 2, name: 'nominee' });

    const result = await canVoteOnPromotion('nominee-1', 'promo-1', 2, ['nominee-1']);
    expect(result.eligible).toBe(false);
    if (!result.eligible) expect(result.error).toContain('Nominees cannot vote');
  });
});

describe('canCommentOnProposal', () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it('allows Tier 1 agent to comment', async () => {
    mockQueryOne
      .mockResolvedValueOnce({ id: 'agent-1', tier: 1 }) // agent lookup
      .mockResolvedValueOnce({ id: 'proposal-1' }); // proposal exists

    const result = await canCommentOnProposal('0xcommenter', 'proposal-1');
    expect(result.eligible).toBe(true);
    if (result.eligible) {
      expect(result.commenter.id).toBe('agent-1');
      expect(result.commenter.tier).toBe(1);
    }
  });

  it('allows Tier 2+ agent to comment', async () => {
    mockQueryOne
      .mockResolvedValueOnce({ id: 'agent-2', tier: 3 })
      .mockResolvedValueOnce({ id: 'proposal-1' });

    const result = await canCommentOnProposal('0xcommenter', 'proposal-1');
    expect(result.eligible).toBe(true);
  });

  it('blocks unregistered wallet', async () => {
    mockQueryOne.mockResolvedValueOnce(null);

    const result = await canCommentOnProposal('0xunknown', 'proposal-1');
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.error).toContain('Not a registered member');
      expect(result.status).toBe(403);
    }
  });

  it('blocks tier 0 agent', async () => {
    mockQueryOne.mockResolvedValueOnce({ id: 'agent-0', tier: 0 });

    const result = await canCommentOnProposal('0xcommenter', 'proposal-1');
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.error).toContain('registered members');
    }
  });

  it('returns not found when proposal does not exist', async () => {
    mockQueryOne
      .mockResolvedValueOnce({ id: 'agent-1', tier: 1 }) // agent exists
      .mockResolvedValueOnce(null); // proposal not found

    const result = await canCommentOnProposal('0xcommenter', 'nonexistent');
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.error).toContain('Proposal not found');
      expect(result.status).toBe(404);
    }
  });

  it('scopes to constitution when constitutionId provided', async () => {
    mockQueryOne
      .mockResolvedValueOnce({ id: 'agent-1', tier: 1 })
      .mockResolvedValueOnce({ id: 'proposal-1' });

    const result = await canCommentOnProposal('0xcommenter', 'proposal-1', 'const-123');
    expect(result.eligible).toBe(true);
    // Verify the constitution-scoped query was used (has 2 params)
    expect(mockQueryOne.mock.calls[0][1]).toEqual(['0xcommenter', 'const-123']);
  });
});
