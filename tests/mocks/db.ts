/**
 * Mock for @/lib/db
 * Provides controllable query/queryOne mocks for testing DB-dependent logic.
 */
import { vi } from 'vitest';

export const mockQuery = vi.fn<(text: string, params?: unknown[]) => Promise<unknown[]>>();
export const mockQueryOne = vi.fn<(text: string, params?: unknown[]) => Promise<unknown | null>>();

// Reset all mocks between tests
export function resetDbMocks() {
  mockQuery.mockReset();
  mockQueryOne.mockReset();
}

// Auto-mock the db module
vi.mock('@/lib/db', () => ({
  query: (...args: unknown[]) => mockQuery(...(args as [string, unknown[]?])),
  queryOne: (...args: unknown[]) => mockQueryOne(...(args as [string, unknown[]?])),
  getDb: vi.fn(),
}));
