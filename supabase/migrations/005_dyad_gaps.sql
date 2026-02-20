-- Migration 005: Dyad Gaps
-- 1. Index on operator_address for operator-based vote dedup
-- 2. No schema changes needed — operator dedup done via JOIN at application level

-- Partial index: only index non-null operator addresses (what we actually query against)
CREATE INDEX IF NOT EXISTS idx_agents_operator ON agents(operator_address) WHERE operator_address IS NOT NULL;
