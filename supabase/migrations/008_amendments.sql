-- 008: Amendment infrastructure
-- Adds structured diff support for constitutional amendments and
-- GitHub integration columns (used by Phase 2).

BEGIN;

-- Amendment diff columns on governance_proposals
ALTER TABLE governance_proposals
  ADD COLUMN IF NOT EXISTS amendment_diff TEXT,
  ADD COLUMN IF NOT EXISTS amendment_base_version TEXT;

-- GitHub integration columns (Phase 2 will use these)
ALTER TABLE governance_proposals
  ADD COLUMN IF NOT EXISTS github_pr_number INTEGER,
  ADD COLUMN IF NOT EXISTS github_pr_url TEXT;

ALTER TABLE constitutions
  ADD COLUMN IF NOT EXISTS github_repo_full_name TEXT;

COMMIT;
