-- Migration 006: Constitutions table + FK columns
-- Foundation for multi-constitution support.
-- Zero behavior changes — existing INSERTs keep working via DEFAULT.

BEGIN;

-- ============================================================
-- 1. constitutions table
-- ============================================================

CREATE TABLE IF NOT EXISTS constitutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  github_url TEXT,
  github_branch TEXT DEFAULT 'main',
  content TEXT,                    -- cached markdown
  content_hash TEXT,
  version TEXT NOT NULL,
  snapshot_space TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one constitution can be the default
CREATE UNIQUE INDEX IF NOT EXISTS idx_constitutions_default
  ON constitutions (is_default) WHERE is_default = true;

-- updated_at trigger (reuse pattern from governance migration)
CREATE OR REPLACE FUNCTION update_constitutions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS constitutions_updated ON constitutions;
CREATE TRIGGER constitutions_updated
  BEFORE UPDATE ON constitutions
  FOR EACH ROW
  EXECUTE FUNCTION update_constitutions_timestamp();

-- ============================================================
-- 2. Seed emergentvibe (idempotent)
-- ============================================================

INSERT INTO constitutions (
  slug, name, tagline,
  github_url, github_branch,
  content_hash, version,
  snapshot_space,
  metadata,
  is_default
) VALUES (
  'emergentvibe',
  'Constitution for Human-AI Coordination',
  'First, do no harm. Enhance, don''t replace. Both can leave.',
  'https://github.com/emergentvibe/constitution',
  'main',
  '18db508cbce2cc5dd4c39496b69b628707efa1a1cf9b582b3d16a48b03e076b5',
  '0.1.5',
  'emergentvibe.eth',
  '{"founder_address": null, "bootstrap_tier2_limit": 10}'::jsonb,
  true
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 3. default_constitution_id() function
--    Returns the single default constitution UUID.
--    Used as column DEFAULT so existing INSERTs work unchanged.
-- ============================================================

CREATE OR REPLACE FUNCTION default_constitution_id() RETURNS UUID AS $$
  SELECT id FROM constitutions WHERE is_default = true LIMIT 1;
$$ LANGUAGE sql STABLE;

-- ============================================================
-- 4. Add constitution_id FK columns
-- ============================================================

-- --- agents ---
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'constitution_id'
  ) THEN
    ALTER TABLE agents ADD COLUMN constitution_id UUID;
  END IF;
END $$;

UPDATE agents SET constitution_id = default_constitution_id()
  WHERE constitution_id IS NULL;

ALTER TABLE agents ALTER COLUMN constitution_id SET NOT NULL;
ALTER TABLE agents ALTER COLUMN constitution_id SET DEFAULT default_constitution_id();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'agents_constitution_id_fkey'
  ) THEN
    ALTER TABLE agents
      ADD CONSTRAINT agents_constitution_id_fkey
      FOREIGN KEY (constitution_id) REFERENCES constitutions(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_agents_constitution ON agents(constitution_id);

-- --- governance_proposals ---
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'governance_proposals' AND column_name = 'constitution_id'
  ) THEN
    ALTER TABLE governance_proposals ADD COLUMN constitution_id UUID;
  END IF;
END $$;

UPDATE governance_proposals SET constitution_id = default_constitution_id()
  WHERE constitution_id IS NULL;

ALTER TABLE governance_proposals ALTER COLUMN constitution_id SET NOT NULL;
ALTER TABLE governance_proposals ALTER COLUMN constitution_id SET DEFAULT default_constitution_id();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'governance_proposals_constitution_id_fkey'
  ) THEN
    ALTER TABLE governance_proposals
      ADD CONSTRAINT governance_proposals_constitution_id_fkey
      FOREIGN KEY (constitution_id) REFERENCES constitutions(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_governance_proposals_constitution ON governance_proposals(constitution_id);

-- --- proposals (symbiont-hub) ---
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'constitution_id'
  ) THEN
    ALTER TABLE proposals ADD COLUMN constitution_id UUID;
  END IF;
END $$;

UPDATE proposals SET constitution_id = default_constitution_id()
  WHERE constitution_id IS NULL;

ALTER TABLE proposals ALTER COLUMN constitution_id SET NOT NULL;
ALTER TABLE proposals ALTER COLUMN constitution_id SET DEFAULT default_constitution_id();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'proposals_constitution_id_fkey'
  ) THEN
    ALTER TABLE proposals
      ADD CONSTRAINT proposals_constitution_id_fkey
      FOREIGN KEY (constitution_id) REFERENCES constitutions(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_proposals_constitution ON proposals(constitution_id);

-- --- constitution_versions (nullable — may have zero rows, Phase 1 restructures) ---
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'constitution_versions' AND column_name = 'constitution_id'
  ) THEN
    ALTER TABLE constitution_versions ADD COLUMN constitution_id UUID;
  END IF;
END $$;

-- Backfill existing rows (if any) but leave nullable
UPDATE constitution_versions SET constitution_id = default_constitution_id()
  WHERE constitution_id IS NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'constitution_versions_constitution_id_fkey'
  ) THEN
    ALTER TABLE constitution_versions
      ADD CONSTRAINT constitution_versions_constitution_id_fkey
      FOREIGN KEY (constitution_id) REFERENCES constitutions(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_constitution_versions_constitution ON constitution_versions(constitution_id);

COMMIT;
