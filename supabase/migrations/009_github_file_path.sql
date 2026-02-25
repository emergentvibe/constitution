-- Migration 009: Add github_file_path to constitutions
-- Allows customizing which file in the repo holds the constitution (default: CONSTITUTION.md)

BEGIN;

ALTER TABLE constitutions
  ADD COLUMN IF NOT EXISTS github_file_path TEXT DEFAULT 'CONSTITUTION.md';

COMMIT;
