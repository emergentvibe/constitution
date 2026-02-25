-- Migration 011: Members table
-- Splits the data model: members = humans who govern, agents = AI that complies.
-- Members table allows one wallet to join multiple constitutions (UNIQUE per constitution, not global).

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  name TEXT NOT NULL,
  constitution_id UUID NOT NULL REFERENCES constitutions(id),
  signature TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 1 CHECK (tier >= 1),
  promotion_history JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  registered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- A wallet can join many constitutions, but only once per constitution
  UNIQUE(wallet_address, constitution_id)
);

CREATE INDEX IF NOT EXISTS idx_members_wallet ON members(wallet_address);
CREATE INDEX IF NOT EXISTS idx_members_constitution ON members(constitution_id);
CREATE INDEX IF NOT EXISTS idx_members_tier ON members(tier);

COMMENT ON TABLE members IS 'Human governance participants. One wallet can join multiple constitutions.';

-- Populate from existing human-only agents (operator_address IS NULL means human-only registration).
-- IMPORTANT: Reuse the same UUIDs so existing FK references (author_agent_id, voter_agent_id, etc.)
-- continue to resolve during the transition period.
INSERT INTO members (id, wallet_address, name, constitution_id, signature, tier, promotion_history, metadata, registered_at, last_seen_at)
SELECT id, wallet_address, name, constitution_id, signature, tier,
       COALESCE(promotion_history, '[]'::jsonb),
       COALESCE(metadata, '{}'::jsonb),
       registered_at, last_seen_at
FROM agents
WHERE operator_address IS NULL
ON CONFLICT DO NOTHING;
