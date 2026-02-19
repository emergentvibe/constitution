-- Migration: Infinite Tier Escalation
-- Transforms fixed 3-tier system into dynamic tier creation via promotion

-- 1. Remove fixed tier constraint
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_tier_check;
ALTER TABLE agents ADD CONSTRAINT agents_tier_check CHECK (tier >= 1);

-- 2. Network configuration
CREATE TABLE IF NOT EXISTS network_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO network_config (key, value) VALUES
  ('founding_board_size', '5'),
  ('bootstrap_tier', '2'),
  ('promotion_cooldown_days', '30'),
  ('promotion_voting_days', '7'),
  ('max_tier_jump', '1'),
  ('default_promotion_threshold', '0.67'),
  ('default_quorum_percent', '0.50')
ON CONFLICT (key) DO NOTHING;

-- 3. Tier registry
CREATE TABLE IF NOT EXISTS tiers (
  level INTEGER PRIMARY KEY,
  name TEXT,
  
  -- Creation metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_promotion UUID,
  
  -- Configuration
  min_members INTEGER DEFAULT 1,
  max_members INTEGER, -- NULL = unlimited
  
  -- Voting thresholds for this tier
  promotion_threshold DECIMAL(3,2) DEFAULT 0.67,
  decision_threshold DECIMAL(3,2) DEFAULT 0.51,
  
  -- What this tier can decide (JSON array)
  decision_scope JSONB DEFAULT '["operational"]'::jsonb
);

-- Seed initial tiers
INSERT INTO tiers (level, name, decision_scope) VALUES
  (1, 'Members', '["deliberation"]'::jsonb),
  (2, 'Voters', '["operational", "policy", "promotion"]'::jsonb),
  (3, 'Board', '["constitutional", "enforcement", "promotion"]'::jsonb)
ON CONFLICT (level) DO NOTHING;

-- 4. Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What's being proposed
  from_tier INTEGER NOT NULL,
  to_tier INTEGER NOT NULL,
  
  -- Who's nominated (array of agent IDs)
  nominees JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Proposal metadata
  proposed_by UUID NOT NULL REFERENCES agents(id),
  rationale TEXT,
  
  -- Voting tallies (arrays of voter IDs for easy counting)
  votes_for JSONB DEFAULT '[]'::jsonb,
  votes_against JSONB DEFAULT '[]'::jsonb,
  quorum_required INTEGER NOT NULL,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'withdrawn')) DEFAULT 'pending',
  
  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  voting_ends_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_promotion CHECK (to_tier = from_tier + 1),
  CONSTRAINT valid_nominees CHECK (jsonb_array_length(nominees) > 0)
);

CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_from_tier ON promotions(from_tier);
CREATE INDEX IF NOT EXISTS idx_promotions_proposed_by ON promotions(proposed_by);

-- 5. Detailed promotion votes (for audit trail)
CREATE TABLE IF NOT EXISTS promotion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES agents(id),
  vote BOOLEAN NOT NULL, -- true = for, false = against
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(promotion_id, voter_id)
);

CREATE INDEX IF NOT EXISTS idx_promotion_votes_promotion ON promotion_votes(promotion_id);

-- 6. Add promotion history to agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS promotion_history JSONB DEFAULT '[]'::jsonb;

-- 7. Add foreign key for tier creation
ALTER TABLE tiers ADD CONSTRAINT fk_created_by_promotion 
  FOREIGN KEY (created_by_promotion) REFERENCES promotions(id) 
  ON DELETE SET NULL;

-- 8. Helper function: get config value
CREATE OR REPLACE FUNCTION get_network_config(config_key TEXT)
RETURNS JSONB AS $$
  SELECT value FROM network_config WHERE key = config_key;
$$ LANGUAGE sql STABLE;

-- 9. Helper function: count tier members
CREATE OR REPLACE FUNCTION count_tier_members(tier_level INTEGER)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM agents WHERE tier = tier_level;
$$ LANGUAGE sql STABLE;

-- 10. Update trigger for network_config
CREATE OR REPLACE FUNCTION update_network_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS network_config_updated ON network_config;
CREATE TRIGGER network_config_updated
  BEFORE UPDATE ON network_config
  FOR EACH ROW
  EXECUTE FUNCTION update_network_config_timestamp();

-- Done
COMMENT ON TABLE tiers IS 'Dynamic tier registry - tiers created via promotion';
COMMENT ON TABLE promotions IS 'Promotion proposals for tier advancement';
COMMENT ON TABLE promotion_votes IS 'Individual votes on promotions (audit trail)';
COMMENT ON TABLE network_config IS 'Network-wide configuration';
