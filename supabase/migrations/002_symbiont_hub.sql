-- Migration 002: Symbiont Hub tables
-- Proposals, votes, constitution versions, email subscribers.
-- Originally created directly in Supabase, captured retroactively.

-- Proposals (symbiont-hub governance - separate from governance_proposals)
CREATE TABLE IF NOT EXISTS proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposer_id UUID NOT NULL REFERENCES agents(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  diff TEXT NOT NULL,
  affected_principles JSONB,
  status TEXT NOT NULL DEFAULT 'deliberation'
    CHECK (status IN ('deliberation', 'voting', 'passed', 'rejected')),
  deliberation_ends_at TIMESTAMPTZ NOT NULL,
  voting_ends_at TIMESTAMPTZ NOT NULL,
  quorum_required INTEGER NOT NULL,
  votes_for INTEGER NOT NULL DEFAULT 0,
  votes_against INTEGER NOT NULL DEFAULT 0,
  votes_abstain INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Votes on symbiont-hub proposals
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES agents(id),
  vote TEXT NOT NULL CHECK (vote IN ('for', 'against', 'abstain')),
  reasoning TEXT,
  signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(proposal_id, voter_id)
);

-- Constitution version history
CREATE TABLE IF NOT EXISTS constitution_versions (
  version TEXT PRIMARY KEY,
  content_hash TEXT,
  published_at TIMESTAMPTZ,
  changelog TEXT
);

-- Email subscribers
CREATE TABLE IF NOT EXISTS email_subscribers (
  email TEXT PRIMARY KEY,
  subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE proposals IS 'Symbiont hub proposals for network governance';
COMMENT ON TABLE votes IS 'Votes on symbiont hub proposals';
COMMENT ON TABLE constitution_versions IS 'Constitution version history';
COMMENT ON TABLE email_subscribers IS 'Newsletter email subscribers';
