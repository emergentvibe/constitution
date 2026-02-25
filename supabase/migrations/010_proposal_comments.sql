-- Migration 010: Proposal comments for deliberation threads
-- Enables threaded discussion on governance proposals

CREATE TABLE proposal_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES governance_proposals(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES proposal_comments(id) ON DELETE CASCADE,
  author_wallet TEXT NOT NULL,
  author_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_content CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

CREATE INDEX idx_comments_proposal ON proposal_comments(proposal_id, created_at ASC);
CREATE INDEX idx_comments_parent ON proposal_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_comments_author ON proposal_comments(author_wallet);
