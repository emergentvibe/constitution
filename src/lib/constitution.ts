/**
 * Constitution lookup library.
 * Provides typed access to the constitutions table with fallback
 * safety — if the table doesn't exist yet (deploy before migration),
 * all functions return hardcoded emergentvibe values.
 */

import { query, queryOne } from './db';
import { CONSTITUTION_HASH, CONSTITUTION_VERSION, FOUNDER_ADDRESS, BOOTSTRAP_TIER2_LIMIT } from './symbiont';
import { SNAPSHOT_SPACE } from './snapshot';

// ── Types ────────────────────────────────────────────────────

/** Full database row from constitutions table */
export interface Constitution {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  github_url: string | null;
  github_branch: string;
  content: string | null;
  content_hash: string | null;
  version: string;
  snapshot_space: string | null;
  metadata: ConstitutionMetadata;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Typed metadata JSONB stored in constitutions.metadata */
export interface ConstitutionMetadata {
  founder_address?: string | null;
  bootstrap_tier2_limit?: number;
}

/** Flattened config for application use — no nulls, sensible defaults */
export interface ConstitutionConfig {
  id: string;
  slug: string;
  name: string;
  content_hash: string;
  version: string;
  snapshot_space: string;
  founder_address: string | null;
  bootstrap_tier2_limit: number;
}

// ── Hardcoded fallback ───────────────────────────────────────

const FALLBACK_CONFIG: ConstitutionConfig = {
  id: '00000000-0000-0000-0000-000000000000',
  slug: 'emergentvibe',
  name: 'Constitution for Human-AI Coordination',
  content_hash: CONSTITUTION_HASH,
  version: CONSTITUTION_VERSION,
  snapshot_space: SNAPSHOT_SPACE,
  founder_address: FOUNDER_ADDRESS,
  bootstrap_tier2_limit: BOOTSTRAP_TIER2_LIMIT,
};

// ── Helpers ──────────────────────────────────────────────────

function rowToConfig(row: Constitution): ConstitutionConfig {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    content_hash: row.content_hash ?? CONSTITUTION_HASH,
    version: row.version,
    snapshot_space: row.snapshot_space ?? SNAPSHOT_SPACE,
    founder_address: row.metadata?.founder_address ?? FOUNDER_ADDRESS,
    bootstrap_tier2_limit: row.metadata?.bootstrap_tier2_limit ?? BOOTSTRAP_TIER2_LIMIT,
  };
}

function isTableMissing(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes('constitutions') && (
      msg.includes('does not exist') ||
      msg.includes('relation') ||
      msg.includes('undefined')
    );
  }
  return false;
}

// ── Public API ───────────────────────────────────────────────

/**
 * Look up a constitution by slug or UUID.
 * Returns null if not found.
 */
export async function getConstitution(slugOrId: string): Promise<ConstitutionConfig | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    const row = await queryOne<Constitution>(
      isUuid
        ? 'SELECT * FROM constitutions WHERE id = $1 AND is_active = true'
        : 'SELECT * FROM constitutions WHERE slug = $1 AND is_active = true',
      [slugOrId]
    );
    return row ? rowToConfig(row) : null;
  } catch (err) {
    if (isTableMissing(err)) {
      return slugOrId === 'emergentvibe' ? { ...FALLBACK_CONFIG } : null;
    }
    throw err;
  }
}

/**
 * Get the default constitution. Always returns a config —
 * falls back to hardcoded emergentvibe values if DB is unavailable.
 */
export async function getDefaultConstitution(): Promise<ConstitutionConfig> {
  try {
    const row = await queryOne<Constitution>(
      'SELECT * FROM constitutions WHERE is_default = true AND is_active = true'
    );
    return row ? rowToConfig(row) : { ...FALLBACK_CONFIG };
  } catch (err) {
    if (isTableMissing(err)) {
      return { ...FALLBACK_CONFIG };
    }
    throw err;
  }
}

/**
 * Resolve a constitution slug or UUID to config.
 * If null/undefined, returns the default constitution.
 * Used by all API routes to scope queries.
 */
export async function resolveConstitution(slugOrId?: string | null): Promise<ConstitutionConfig> {
  if (!slugOrId) return getDefaultConstitution();
  const config = await getConstitution(slugOrId);
  if (!config) throw new ConstitutionNotFoundError(slugOrId);
  return config;
}

export class ConstitutionNotFoundError extends Error {
  constructor(slugOrId: string) {
    super(`Constitution not found: ${slugOrId}`);
    this.name = 'ConstitutionNotFoundError';
  }
}

/**
 * Look up a constitution by UUID.
 * Convenience alias for getConstitution() when you know you have a UUID.
 */
export async function getConstitutionById(id: string): Promise<ConstitutionConfig | null> {
  return getConstitution(id);
}

/**
 * List all active constitutions with member/proposal counts.
 */
export async function listConstitutions(): Promise<(ConstitutionConfig & { member_count: number; proposal_count: number })[]> {
  try {
    const rows = await query<Constitution & { member_count: string; proposal_count: string }>(
      `SELECT c.*,
              (SELECT COUNT(*) FROM agents WHERE constitution_id = c.id) as member_count,
              (SELECT COUNT(*) FROM governance_proposals WHERE constitution_id = c.id) as proposal_count
       FROM constitutions c
       WHERE c.is_active = true
       ORDER BY c.is_default DESC, c.created_at ASC`
    );
    return rows.map(row => ({
      ...rowToConfig(row),
      member_count: parseInt(row.member_count || '0'),
      proposal_count: parseInt(row.proposal_count || '0'),
    }));
  } catch (err) {
    if (isTableMissing(err)) {
      return [{
        ...FALLBACK_CONFIG,
        member_count: 0,
        proposal_count: 0,
      }];
    }
    throw err;
  }
}

/**
 * Get the full database row (for admin views).
 * Returns null if not found.
 */
export async function getConstitutionFull(slugOrId: string): Promise<Constitution | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    return await queryOne<Constitution>(
      isUuid
        ? 'SELECT * FROM constitutions WHERE id = $1'
        : 'SELECT * FROM constitutions WHERE slug = $1',
      [slugOrId]
    );
  } catch (err) {
    if (isTableMissing(err)) return null;
    throw err;
  }
}
