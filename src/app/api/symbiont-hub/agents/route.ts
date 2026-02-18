import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { createHash } from 'crypto';

interface Agent {
  id: string;
  wallet_address: string;
  name: string;
  mission: string | null;
  constitution_version: string;
  signature: string;
  creator_type: 'human' | 'agent' | null;
  creator_id: string | null;
  lineage: any[];
  tier: number;
  platform: string | null;
  contact_endpoint: string | null;
  registered_at: string;
  last_seen_at: string;
  metadata: Record<string, any>;
}

// GET /api/symbiont-hub/agents - List all agents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier');
    const platform = searchParams.get('platform');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `
      SELECT id, wallet_address, name, mission, constitution_version, 
             tier, platform, registered_at, last_seen_at
      FROM agents
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (tier) {
      sql += ` AND tier = $${paramIndex++}`;
      params.push(parseInt(tier));
    }
    if (platform) {
      sql += ` AND platform = $${paramIndex++}`;
      params.push(platform);
    }

    sql += ` ORDER BY registered_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const agents = await query(sql, params);
    
    // Get total count
    const countResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM agents'
    );
    const total = parseInt(countResult?.count || '0');

    return NextResponse.json({
      agents,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error listing agents:', error);
    return NextResponse.json(
      { error: 'Failed to list agents' },
      { status: 500 }
    );
  }
}

// POST /api/symbiont-hub/agents - Register a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      wallet_address,
      name,
      mission,
      signature,
      creator_type,
      creator_id,
      lineage,
      platform,
      contact_endpoint,
      metadata
    } = body;

    // Validate required fields
    if (!wallet_address || !name || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet_address, name, signature' },
        { status: 400 }
      );
    }

    // TODO: Verify signature against constitution hash
    // For now, we trust the signature

    // Check if agent already registered
    const existing = await queryOne<Agent>(
      'SELECT id FROM agents WHERE wallet_address = $1',
      [wallet_address]
    );

    if (existing) {
      // Update last_seen and return existing
      await query(
        'UPDATE agents SET last_seen_at = NOW() WHERE wallet_address = $1',
        [wallet_address]
      );
      return NextResponse.json({
        message: 'Agent already registered',
        id: existing.id,
        updated: true
      });
    }

    // Get current constitution version
    const currentVersion = await queryOne<{ version: string }>(
      'SELECT version FROM constitution_versions ORDER BY published_at DESC LIMIT 1'
    );

    // Insert new agent
    const result = await queryOne<{ id: string }>(
      `INSERT INTO agents (
        wallet_address, name, mission, constitution_version, signature,
        creator_type, creator_id, lineage, platform, contact_endpoint, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        wallet_address,
        name,
        mission || null,
        currentVersion?.version || '0.1.5',
        signature,
        creator_type || null,
        creator_id || null,
        JSON.stringify(lineage || []),
        platform || null,
        contact_endpoint || null,
        JSON.stringify(metadata || {})
      ]
    );

    return NextResponse.json({
      message: 'Agent registered successfully',
      id: result?.id,
      constitution_version: currentVersion?.version || '0.1.5'
    }, { status: 201 });

  } catch (error) {
    console.error('Error registering agent:', error);
    return NextResponse.json(
      { error: 'Failed to register agent' },
      { status: 500 }
    );
  }
}
