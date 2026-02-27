/**
 * Tests for formatting utilities — pure functions, no mocks needed.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatDistanceToNow, formatDate, timeAgo } from '@/lib/format';

describe('formatDistanceToNow', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "in X days" for future dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-27T12:00:00Z'));

    const future = new Date('2026-03-02T12:00:00Z'); // 3 days from now
    expect(formatDistanceToNow(future)).toBe('in 3 days');
  });

  it('returns "in 1 day" for tomorrow', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-27T12:00:00Z'));

    const tomorrow = new Date('2026-02-28T12:00:00Z');
    expect(formatDistanceToNow(tomorrow)).toBe('in 1 day');
  });

  it('returns "in X hours" for hours away', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-27T12:00:00Z'));

    const later = new Date('2026-02-27T17:00:00Z'); // 5 hours
    expect(formatDistanceToNow(later)).toBe('in 5 hours');
  });

  it('returns "soon" for minutes away', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-27T12:00:00Z'));

    const soon = new Date('2026-02-27T12:10:00Z'); // 10 min — rounds to 0 hours
    expect(formatDistanceToNow(soon)).toBe('soon');
  });

  it('returns "X days ago" for past dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-27T12:00:00Z'));

    const past = new Date('2026-02-24T12:00:00Z'); // 3 days ago
    expect(formatDistanceToNow(past)).toBe('3 days ago');
  });

  it('returns "1 day ago" for yesterday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-27T12:00:00Z'));

    const yesterday = new Date('2026-02-26T12:00:00Z');
    expect(formatDistanceToNow(yesterday)).toBe('1 day ago');
  });

  it('returns "recently" for just-past times', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-27T12:00:00Z'));

    const justNow = new Date('2026-02-27T11:50:00Z'); // 10 min ago
    expect(formatDistanceToNow(justNow)).toBe('recently');
  });
});

describe('timeAgo', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for < 1 minute', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-27T12:00:30Z'));

    const recent = new Date('2026-02-27T12:00:00Z');
    expect(timeAgo(recent)).toBe('just now');
  });

  it('returns "Xm ago" for minutes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-27T12:15:00Z'));

    const past = new Date('2026-02-27T12:00:00Z');
    expect(timeAgo(past)).toBe('15m ago');
  });

  it('returns "Xh ago" for hours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-27T15:00:00Z'));

    const past = new Date('2026-02-27T12:00:00Z');
    expect(timeAgo(past)).toBe('3h ago');
  });

  it('returns "Xd ago" for days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-27T12:00:00Z'));

    const past = new Date('2026-02-22T12:00:00Z');
    expect(timeAgo(past)).toBe('5d ago');
  });

  it('returns formatted date for > 30 days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-27T12:00:00Z'));

    const old = new Date('2025-12-15T12:00:00Z');
    const result = timeAgo(old);
    // Should be a formatted date string, not "Xd ago"
    expect(result).toContain('Dec');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });
});

describe('formatDate', () => {
  it('formats date in en-US short format', () => {
    const date = new Date('2026-02-27T12:00:00Z');
    const result = formatDate(date);
    expect(result).toContain('Feb');
    expect(result).toContain('27');
    expect(result).toContain('2026');
  });
});
