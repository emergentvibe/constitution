// GET /api/symbiont-hub/snapshot-scores
// Returns voting power in Snapshot api-v2 format: { address: score }
// Used as custom voting strategy for Snapshot.org

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Snapshot may pass addresses to check
    const addressesParam = searchParams.get('addresses');
    
    // Get all tier 2+ agents
    const agents = await query<{ wallet_address: string; tier: number }>(
      `SELECT wallet_address, tier FROM agents WHERE tier >= 2 AND wallet_address IS NOT NULL`
    );
    
    // Build scores object: { address: votingPower }
    // Voting power = tier level (tier 2 = 2 votes, tier 3 = 3 votes, etc.)
    const scores: Record<string, number> = {};
    
    for (const agent of agents) {
      if (agent.wallet_address) {
        // Normalize to lowercase for consistency
        const addr = agent.wallet_address.toLowerCase();
        scores[addr] = agent.tier;
      }
    }
    
    // If specific addresses were requested, filter to those
    if (addressesParam) {
      const requestedAddresses = addressesParam.split(',').map(a => a.toLowerCase().trim());
      const filteredScores: Record<string, number> = {};
      
      for (const addr of requestedAddresses) {
        filteredScores[addr] = scores[addr] || 0;
      }
      
      return NextResponse.json(filteredScores);
    }
    
    return NextResponse.json(scores);
  } catch (error) {
    console.error('Error fetching snapshot scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}

// POST version for api-post type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const addresses: string[] = body.addresses || [];
    
    // Get all tier 2+ agents
    const agents = await query<{ wallet_address: string; tier: number }>(
      `SELECT wallet_address, tier FROM agents WHERE tier >= 2 AND wallet_address IS NOT NULL`
    );
    
    // Build lookup
    const tierByAddress: Record<string, number> = {};
    for (const agent of agents) {
      if (agent.wallet_address) {
        tierByAddress[agent.wallet_address.toLowerCase()] = agent.tier;
      }
    }
    
    // Build scores for requested addresses
    const scores: Record<string, number> = {};
    for (const addr of addresses) {
      const normalizedAddr = addr.toLowerCase();
      scores[addr] = tierByAddress[normalizedAddr] || 0;
    }
    
    return NextResponse.json(scores);
  } catch (error) {
    console.error('Error fetching snapshot scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}
