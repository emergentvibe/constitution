-- 007: Constitution visibility
-- Adds is_published flag so constitutions can be hidden from public directory
-- while keeping their data intact for testing and historical reference.

BEGIN;

ALTER TABLE constitutions ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_constitutions_published
  ON constitutions(is_published) WHERE is_published = true;

-- Hide emergentvibe from public view (the purge)
UPDATE constitutions SET is_published = false WHERE slug = 'emergentvibe';

COMMIT;
