#!/usr/bin/env npx ts-node
/**
 * Sync Snapshot proposals with local database
 * Run this as a cron job to keep proposals in sync
 * 
 * Usage: npx ts-node scripts/sync-snapshot.ts
 */

import { createClient } from '@supabase/supabase-js';

const SNAPSHOT_GRAPHQL = 'https://hub.snapshot.org/graphql';
const SNAPSHOT_SPACE = 'emergentvibe.eth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for backend operations
);

const PROPOSALS_QUERY = `
  query Proposals($space: String!, $first: Int!) {
    proposals(
      first: $first
      where: { space: $space }
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

async function querySnapshot(query: string, variables: Record<string, any>): Promise<any> {
  const response = await fetch(SNAPSHOT_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

async function syncProposals() {
  console.log('Starting Snapshot sync...');
  
  try {
    // Fetch recent proposals from Snapshot
    const data = await querySnapshot(PROPOSALS_QUERY, { space: SNAPSHOT_SPACE, first: 50 });
    const snapshotProposals = data.proposals || [];
    
    console.log(`Found ${snapshotProposals.length} proposals on Snapshot`);
    
    for (const sp of snapshotProposals) {
      // Check if we have a local record
      const { data: existing } = await supabase
        .from('governance_proposals')
        .select('id, status, final_scores')
        .eq('snapshot_id', sp.id)
        .single();
      
      if (existing) {
        // Update existing record
        const updates: any = {
          status: sp.state,
          snapshot_data: sp,
        };
        
        // If closed, update final results
        if (sp.state === 'closed' && !existing.final_scores) {
          updates.final_scores = sp.scores;
          updates.final_votes = sp.votes;
          updates.final_outcome = determineOutcome(sp);
        }
        
        const { error } = await supabase
          .from('governance_proposals')
          .update(updates)
          .eq('id', existing.id);
        
        if (error) {
          console.error(`Error updating ${sp.id}:`, error);
        } else {
          console.log(`Updated: ${sp.title.substring(0, 50)}...`);
        }
      } else {
        // Create new record (for proposals created directly on Snapshot)
        const { error } = await supabase
          .from('governance_proposals')
          .insert({
            title: sp.title,
            description: sp.body,
            choices: sp.choices,
            status: sp.state,
            voting_start: new Date(sp.start * 1000).toISOString(),
            voting_end: new Date(sp.end * 1000).toISOString(),
            snapshot_id: sp.id,
            snapshot_data: sp,
            author_wallet: sp.author,
            final_scores: sp.state === 'closed' ? sp.scores : null,
            final_votes: sp.state === 'closed' ? sp.votes : null,
            final_outcome: sp.state === 'closed' ? determineOutcome(sp) : null,
          });
        
        if (error) {
          console.error(`Error inserting ${sp.id}:`, error);
        } else {
          console.log(`Created: ${sp.title.substring(0, 50)}...`);
        }
      }
    }
    
    console.log('Sync complete');
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

function determineOutcome(proposal: any): string {
  if (!proposal.scores || proposal.scores.length < 2) return 'unknown';
  
  const forVotes = proposal.scores[0] || 0;
  const againstVotes = proposal.scores[1] || 0;
  const total = proposal.scores_total || 0;
  
  if (total === 0) return 'no_votes';
  
  const approvalRate = forVotes / total;
  
  // Default thresholds - should be adjusted based on proposal type
  if (approvalRate >= 0.51 && proposal.votes >= 10) {
    return 'passed';
  } else if (proposal.votes < 10) {
    return 'no_quorum';
  } else {
    return 'rejected';
  }
}

// Run the sync
syncProposals();
