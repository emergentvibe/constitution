/**
 * Tests for amendment diff utilities (pure logic, no DB).
 */
import { describe, it, expect } from 'vitest';
import { generateDiff, applyDiff, validateDiff, parseDiffForDisplay } from '@/lib/amendment';

const original = `# Constitution

## Article 1
All members have equal voice.

## Article 2
Decisions require majority vote.
`;

const modified = `# Constitution

## Article 1
All members have equal voice and equal responsibility.

## Article 2
Decisions require supermajority (67%) vote.

## Article 3
Amendments must include impact assessments.
`;

describe('generateDiff', () => {
  it('produces a valid unified diff', () => {
    const diff = generateDiff(original, modified);
    expect(diff).toContain('@@');
    expect(diff).toContain('-All members have equal voice.');
    expect(diff).toContain('+All members have equal voice and equal responsibility.');
    expect(diff).toContain('-Decisions require majority vote.');
    expect(diff).toContain('+Decisions require supermajority (67%) vote.');
    expect(diff).toContain('+## Article 3');
  });

  it('returns a diff with no hunks when texts are identical', () => {
    const diff = generateDiff(original, original);
    expect(diff).not.toContain('@@');
  });
});

describe('applyDiff', () => {
  it('roundtrips correctly', () => {
    const diff = generateDiff(original, modified);
    const result = applyDiff(original, diff);
    expect(result).toBe(modified);
  });

  it('returns null on conflict (stale content)', () => {
    const diff = generateDiff(original, modified);
    const differentBase = '# Totally different document\nNothing in common.\n';
    const result = applyDiff(differentBase, diff);
    expect(result).toBeNull();
  });
});

describe('validateDiff', () => {
  it('returns valid with preview on good diff', () => {
    const diff = generateDiff(original, modified);
    const result = validateDiff(original, diff);
    expect(result.valid).toBe(true);
    expect(result.preview).toBe(modified);
    expect(result.error).toBeUndefined();
  });

  it('returns invalid with error on stale content', () => {
    const diff = generateDiff(original, modified);
    const staleContent = '# Different version\nContent has changed.\n';
    const result = validateDiff(staleContent, diff);
    expect(result.valid).toBe(false);
    expect(result.preview).toBeNull();
    expect(result.error).toBeDefined();
  });
});

describe('parseDiffForDisplay', () => {
  it('produces correct line types', () => {
    const diff = generateDiff(original, modified);
    const lines = parseDiffForDisplay(diff);

    expect(lines.length).toBeGreaterThan(0);

    const types = new Set(lines.map(l => l.type));
    expect(types.has('hunk')).toBe(true);
    expect(types.has('add')).toBe(true);
    expect(types.has('remove')).toBe(true);
    expect(types.has('context')).toBe(true);

    const addLines = lines.filter(l => l.type === 'add');
    expect(addLines.some(l => l.content.includes('equal responsibility'))).toBe(true);

    const removeLines = lines.filter(l => l.type === 'remove');
    expect(removeLines.some(l => l.content.includes('equal voice.'))).toBe(true);
  });

  it('handles empty diff gracefully', () => {
    const diff = generateDiff(original, original);
    const lines = parseDiffForDisplay(diff);
    expect(lines).toEqual([]);
  });
});
