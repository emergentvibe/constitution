-- Migration 001: Agents table (core registry)
-- This is the foundation table - all other tables reference it.
-- Originally created directly in Supabase, captured retroactively.

CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identity
  wallet_address TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  mission TEXT,

  -- Registration
  constitution_version TEXT NOT NULL,
  signature TEXT NOT NULL,

  -- Lineage
  creator_type TEXT CHECK (creator_type IN ('human', 'agent')),
  creator_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  lineage JSONB,

  -- Governance
  tier INTEGER NOT NULL DEFAULT 1 CHECK (tier >= 1),

  -- Metadata
  platform TEXT,
  contact_endpoint TEXT,
  metadata JSONB,
  operator_address TEXT,

  -- Timestamps
  registered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agents_wallet ON agents(wallet_address);
CREATE INDEX IF NOT EXISTS idx_agents_tier ON agents(tier);
CREATE INDEX IF NOT EXISTS idx_agents_registered ON agents(registered_at DESC);

COMMENT ON TABLE agents IS 'Core registry of all participants (human operators and AI agents)';
