import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/symbiont-hub/whitelist
// Returns Tier 2+ wallet addresses for Snapshot voting strategy
export async function GET() {
  try {
    const agents = await query<{ wallet_address: string }>(
      'SELECT wallet_address FROM agents WHERE tier >= 2 ORDER BY registered_at'
    );

    const addresses = agents.map(a => a.wallet_address);

    return NextResponse.json({
      addresses,
      count: addresses.length,
      updated_at: new Date().toISOString(),
      description: 'Tier 2+ agents eligible to vote on Snapshot'
    });
  } catch (error) {
    console.error('Error fetching whitelist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch whitelist' },
      { status: 500 }
    );
  }
}
