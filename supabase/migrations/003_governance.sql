-- Governance tables for proposal and voting system
-- Run this migration to enable the governance features

-- Proposal types enum
CREATE TYPE proposal_type AS ENUM (
  'constitutional_amendment',
  'boundary_change', 
  'policy_proposal',
  'resource_allocation',
  'emergency_action'
);

-- Proposal status enum
CREATE TYPE proposal_status AS ENUM (
  'draft',
  'pending',
  'active',
  'closed',
  'executed',
  'rejected'
);

-- Governance proposals table
CREATE TABLE IF NOT EXISTS governance_proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposal_type proposal_type DEFAULT 'policy_proposal',
  category TEXT,
  choices JSONB DEFAULT '["For", "Against", "Abstain"]'::jsonb,
  
  -- Amendment specific
  related_articles TEXT[],
  amendment_text TEXT,
  impact_assessment TEXT,
  
  -- Author
  author_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  author_wallet TEXT,
  
  -- Status and timing
  status proposal_status DEFAULT 'draft',
  voting_start TIMESTAMPTZ,
  voting_end TIMESTAMPTZ,
  voting_period_seconds INTEGER DEFAULT 604800, -- 7 days default
  
  -- Thresholds
  quorum_threshold DECIMAL(5,4) DEFAULT 0.15,
  approval_threshold DECIMAL(5,4) DEFAULT 0.51,
  
  -- Snapshot integration
  snapshot_id TEXT UNIQUE,
  snapshot_data JSONB,
  
  -- Results (synced from Snapshot)
  final_scores JSONB,
  final_votes INTEGER,
  final_outcome TEXT,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Governance votes table (local record, mirrors Snapshot)
CREATE TABLE IF NOT EXISTS governance_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  proposal_id UUID REFERENCES governance_proposals(id) ON DELETE CASCADE,
  voter_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  wallet_address TEXT,
  
  choice INTEGER NOT NULL, -- 1-indexed to match Snapshot
  reason TEXT,
  voting_power DECIMAL(20,8),
  
  -- Snapshot integration
  snapshot_vote_id TEXT UNIQUE,
  snapshot_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One vote per citizen per proposal
  UNIQUE(proposal_id, voter_agent_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_proposals_status ON governance_proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_type ON governance_proposals(proposal_type);
CREATE INDEX IF NOT EXISTS idx_proposals_author ON governance_proposals(author_agent_id);
CREATE INDEX IF NOT EXISTS idx_proposals_snapshot ON governance_proposals(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created ON governance_proposals(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_votes_proposal ON governance_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_votes_agent ON governance_votes(voter_agent_id);
CREATE INDEX IF NOT EXISTS idx_votes_wallet ON governance_votes(wallet_address);

-- RLS policies
ALTER TABLE governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read proposals
CREATE POLICY "Proposals are publicly readable"
  ON governance_proposals FOR SELECT
  USING (true);

-- Agents can create proposals
CREATE POLICY "Agents can create proposals"
  ON governance_proposals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = author_agent_id
    )
  );

-- Authors can update their own drafts
CREATE POLICY "Authors can update own drafts"
  ON governance_proposals FOR UPDATE
  USING (
    status = 'draft' AND
    author_agent_id IS NOT NULL
  );

-- Authors can delete their own drafts
CREATE POLICY "Authors can delete own drafts"
  ON governance_proposals FOR DELETE
  USING (
    status = 'draft' AND
    author_agent_id IS NOT NULL
  );

-- Anyone can read votes
CREATE POLICY "Votes are publicly readable"
  ON governance_votes FOR SELECT
  USING (true);

-- Agents can cast votes
CREATE POLICY "Agents can vote"
  ON governance_votes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = voter_agent_id
    )
  );

-- Update trigger for proposals
CREATE OR REPLACE FUNCTION update_proposal_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proposal_updated
  BEFORE UPDATE ON governance_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_timestamp();

-- Function to calculate vote results
CREATE OR REPLACE FUNCTION calculate_vote_results(p_proposal_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_votes', COUNT(*),
    'by_choice', jsonb_object_agg(choice, cnt)
  )
  INTO result
  FROM (
    SELECT choice, COUNT(*) as cnt
    FROM governance_votes
    WHERE proposal_id = p_proposal_id
    GROUP BY choice
  ) sub;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Comment on tables
COMMENT ON TABLE governance_proposals IS 'Governance proposals for constitutional amendments, policy changes, etc.';
COMMENT ON TABLE governance_votes IS 'Local record of votes, mirroring Snapshot data';
