// Snapshot.org Integration Service
// Handles proposal creation, voting, and querying via Snapshot GraphQL API

const SNAPSHOT_HUB = 'https://hub.snapshot.org';
const SNAPSHOT_GRAPHQL = 'https://hub.snapshot.org/graphql';

// Space configuration - will be created on Snapshot.org
export const SNAPSHOT_SPACE = 'emergentvibe.eth';

// Proposal types matching our governance model
export type ProposalType = 
  | 'constitutional_amendment'  // Changes to core principles (supermajority)
  | 'boundary_change'           // Territory/membership changes (supermajority)
  | 'policy_proposal'           // New policies (simple majority)
  | 'resource_allocation'       // Budget decisions (simple majority)
  | 'emergency_action';         // Time-sensitive (expedited)

export interface ProposalMetadata {
  type: ProposalType;
  category: string;
  impact_assessment?: string;
  related_articles?: string[];
  amendment_text?: string;
}

export interface Proposal {
  id: string;
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  snapshot: string;
  state: 'pending' | 'active' | 'closed';
  author: string;
  space: {
    id: string;
    name: string;
  };
  scores?: number[];
  scores_total?: number;
  votes?: number;
  metadata?: ProposalMetadata;
}

export interface Vote {
  id: string;
  voter: string;
  choice: number | number[];
  vp: number;
  created: number;
  proposal: {
    id: string;
  };
}

// GraphQL queries
const PROPOSALS_QUERY = `
  query Proposals($space: String!, $first: Int!, $skip: Int!, $state: String) {
    proposals(
      first: $first
      skip: $skip
      where: { space: $space, state: $state }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      scores
      scores_total
      votes
      space {
        id
        name
      }
    }
  }
`;

const PROPOSAL_QUERY = `
  query Proposal($id: String!) {
    proposal(id: $id) {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      scores
      scores_total
      votes
      space {
        id
        name
      }
    }
  }
`;

const VOTES_QUERY = `
  query Votes($proposal: String!, $first: Int!, $skip: Int!) {
    votes(
      first: $first
      skip: $skip
      where: { proposal: $proposal }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      voter
      choice
      vp
      created
      proposal {
        id
      }
    }
  }
`;

const SPACE_QUERY = `
  query Space($id: String!) {
    space(id: $id) {
      id
      name
      about
      network
      symbol
      members
      admins
      moderators
      voting {
        delay
        period
        quorum
      }
      strategies {
        name
        params
      }
      validation {
        name
        params
      }
    }
  }
`;

// API functions
export async function querySnapshot(query: string, variables: Record<string, any>): Promise<any> {
  const response = await fetch(SNAPSHOT_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  
  if (!response.ok) {
    throw new Error(`Snapshot API error: ${response.statusText}`);
  }
  
  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL error: ${result.errors[0].message}`);
  }
  
  return result.data;
}

export async function getProposals(
  space: string = SNAPSHOT_SPACE,
  state?: 'pending' | 'active' | 'closed',
  first: number = 20,
  skip: number = 0
): Promise<Proposal[]> {
  const data = await querySnapshot(PROPOSALS_QUERY, { space, first, skip, state });
  return data.proposals;
}

export async function getProposal(id: string): Promise<Proposal | null> {
  const data = await querySnapshot(PROPOSAL_QUERY, { id });
  return data.proposal;
}

export async function getVotes(proposalId: string, first: number = 100, skip: number = 0): Promise<Vote[]> {
  const data = await querySnapshot(VOTES_QUERY, { proposal: proposalId, first, skip });
  return data.votes;
}

export async function getSpace(id: string = SNAPSHOT_SPACE): Promise<any> {
  const data = await querySnapshot(SPACE_QUERY, { id });
  return data.space;
}

// Voting thresholds based on proposal type
export function getVotingThreshold(type: ProposalType): { quorum: number; approval: number } {
  switch (type) {
    case 'constitutional_amendment':
      return { quorum: 0.33, approval: 0.67 }; // 2/3 supermajority
    case 'boundary_change':
      return { quorum: 0.25, approval: 0.67 }; // 2/3 supermajority
    case 'policy_proposal':
      return { quorum: 0.15, approval: 0.51 }; // Simple majority
    case 'resource_allocation':
      return { quorum: 0.10, approval: 0.51 }; // Simple majority
    case 'emergency_action':
      return { quorum: 0.05, approval: 0.67 }; // Lower quorum, higher approval
    default:
      return { quorum: 0.15, approval: 0.51 };
  }
}

// Voting period based on proposal type (in seconds)
export function getVotingPeriod(type: ProposalType): number {
  switch (type) {
    case 'constitutional_amendment':
      return 14 * 24 * 60 * 60; // 14 days
    case 'boundary_change':
      return 10 * 24 * 60 * 60; // 10 days
    case 'policy_proposal':
      return 7 * 24 * 60 * 60;  // 7 days
    case 'resource_allocation':
      return 5 * 24 * 60 * 60;  // 5 days
    case 'emergency_action':
      return 3 * 24 * 60 * 60;  // 3 days
    default:
      return 7 * 24 * 60 * 60;
  }
}

// Check if proposal passed based on its type and votes
export function checkProposalOutcome(proposal: Proposal, metadata?: ProposalMetadata): {
  passed: boolean;
  quorumMet: boolean;
  approvalMet: boolean;
  details: string;
} {
  const type = metadata?.type || 'policy_proposal';
  const threshold = getVotingThreshold(type);
  
  // Assuming binary choice: [For, Against]
  const forVotes = proposal.scores?.[0] || 0;
  const totalVotes = proposal.scores_total || 0;
  
  // TODO: Get total voting power from space for quorum calculation
  // For now, use votes count as proxy
  const quorumMet = (proposal.votes || 0) >= 10; // Minimum 10 voters
  const approvalRate = totalVotes > 0 ? forVotes / totalVotes : 0;
  const approvalMet = approvalRate >= threshold.approval;
  
  const passed = quorumMet && approvalMet;
  
  return {
    passed,
    quorumMet,
    approvalMet,
    details: `Quorum: ${quorumMet ? '✓' : '✗'} (${proposal.votes} voters), ` +
             `Approval: ${(approvalRate * 100).toFixed(1)}% (need ${threshold.approval * 100}%)`
  };
}

// Message signing for Snapshot (requires wallet)
export interface SignedMessage {
  address: string;
  sig: string;
  data: {
    domain: any;
    types: any;
    message: any;
  };
}

// Create proposal message structure (for signing)
export function createProposalMessage(
  space: string,
  title: string,
  body: string,
  choices: string[],
  start: number,
  end: number,
  snapshot: number,
  type: string = 'single-choice',
  metadata?: ProposalMetadata
): any {
  return {
    space,
    type,
    title,
    body: metadata ? `${body}\n\n---\n**Metadata:** ${JSON.stringify(metadata)}` : body,
    choices,
    start,
    end,
    snapshot,
    plugins: JSON.stringify({}),
    app: 'emergentvibe-constitution',
    discussion: '',
    from: '', // Will be filled by wallet
    timestamp: Math.floor(Date.now() / 1000),
  };
}

// Create vote message structure (for signing)
export function createVoteMessage(
  space: string,
  proposal: string,
  choice: number | number[],
  reason?: string
): any {
  return {
    space,
    proposal,
    type: 'single-choice',
    choice,
    reason: reason || '',
    app: 'emergentvibe-constitution',
    from: '', // Will be filled by wallet
    timestamp: Math.floor(Date.now() / 1000),
  };
}

// Submit signed message to Snapshot
export async function submitToSnapshot(signedMessage: SignedMessage): Promise<{ id: string }> {
  const response = await fetch(`${SNAPSHOT_HUB}/api/msg`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(signedMessage),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Snapshot submission failed: ${error}`);
  }
  
  return response.json();
}

// Helper to format proposal for display
export function formatProposalForDisplay(proposal: Proposal): string {
  const state = proposal.state.toUpperCase();
  const votes = proposal.votes || 0;
  const scores = proposal.scores || [];
  
  let result = `**${proposal.title}**\n`;
  result += `Status: ${state} | Votes: ${votes}\n`;
  
  if (scores.length > 0 && proposal.choices) {
    result += `Results:\n`;
    proposal.choices.forEach((choice, i) => {
      const score = scores[i] || 0;
      const percentage = proposal.scores_total ? ((score / proposal.scores_total) * 100).toFixed(1) : '0';
      result += `  • ${choice}: ${percentage}%\n`;
    });
  }
  
  return result;
}

// Snapshot domain for EIP-712
export const SNAPSHOT_DOMAIN = {
  name: 'snapshot',
  version: '0.1.4',
};

// Types for proposal creation
export const PROPOSAL_TYPES = {
  Proposal: [
    { name: 'from', type: 'address' },
    { name: 'space', type: 'string' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'type', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'body', type: 'string' },
    { name: 'discussion', type: 'string' },
    { name: 'choices', type: 'string[]' },
    { name: 'start', type: 'uint64' },
    { name: 'end', type: 'uint64' },
    { name: 'snapshot', type: 'uint64' },
    { name: 'plugins', type: 'string' },
    { name: 'app', type: 'string' },
  ],
};

// Types for voting
export const VOTE_TYPES = {
  Vote: [
    { name: 'from', type: 'address' },
    { name: 'space', type: 'string' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'proposal', type: 'bytes32' },
    { name: 'choice', type: 'uint32' },
    { name: 'reason', type: 'string' },
    { name: 'app', type: 'string' },
    { name: 'metadata', type: 'string' },
  ],
};

// Create full proposal payload for signing
export function createProposalPayload(
  from: string,
  title: string,
  body: string,
  type: ProposalType,
  startTimestamp: number,
  endTimestamp: number,
  snapshotBlock: number
): { types: typeof PROPOSAL_TYPES; message: any } {
  return {
    types: PROPOSAL_TYPES,
    message: {
      from,
      space: SNAPSHOT_SPACE,
      timestamp: Math.floor(Date.now() / 1000),
      type: 'single-choice',
      title,
      body,
      discussion: '',
      choices: ['For', 'Against', 'Abstain'],
      start: startTimestamp,
      end: endTimestamp,
      snapshot: snapshotBlock,
      plugins: '{}',
      app: 'emergentvibe',
    },
  };
}

// Create vote payload for signing
export function createVotePayload(
  from: string,
  proposalId: string,
  choice: number,
  reason: string = ''
): { types: typeof VOTE_TYPES; message: any } {
  return {
    types: VOTE_TYPES,
    message: {
      from,
      space: SNAPSHOT_SPACE,
      timestamp: Math.floor(Date.now() / 1000),
      proposal: proposalId,
      choice,
      reason,
      app: 'emergentvibe',
      metadata: '{}',
    },
  };
}

// Submit proposal to Snapshot sequencer
export async function submitProposal(
  address: string,
  signature: string,
  message: any
): Promise<{ id: string; ipfs: string }> {
  const envelope = {
    address,
    sig: signature,
    data: {
      domain: SNAPSHOT_DOMAIN,
      types: PROPOSAL_TYPES,
      message,
    },
  };
  
  const response = await fetch(`${SNAPSHOT_HUB}/api/msg`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(envelope),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Snapshot proposal failed: ${error}`);
  }
  
  return response.json();
}

// Submit vote to Snapshot sequencer
export async function submitVote(
  address: string,
  signature: string,
  message: any
): Promise<{ id: string; ipfs: string }> {
  const envelope = {
    address,
    sig: signature,
    data: {
      domain: SNAPSHOT_DOMAIN,
      types: VOTE_TYPES,
      message,
    },
  };
  
  const response = await fetch(`${SNAPSHOT_HUB}/api/msg`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(envelope),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Snapshot vote failed: ${error}`);
  }
  
  return response.json();
}

// Get current Ethereum block number (for snapshot parameter)
export async function getCurrentBlock(): Promise<number> {
  try {
    const response = await fetch('https://eth.llamarpc.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    });
    const data = await response.json();
    return parseInt(data.result, 16);
  } catch {
    // Fallback to approximate block
    return Math.floor(Date.now() / 12000) + 15000000;
  }
}
