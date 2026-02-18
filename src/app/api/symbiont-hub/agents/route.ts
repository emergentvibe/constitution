import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { 
  verifySignature, 
  determineInitialTier, 
  CONSTITUTION_VERSION,
  CONSTITUTION_HASH 
} from '@/lib/symbiont';

interface Agent {
  id: string;
  wallet_address: string;
  name: string;
  mission: string | null;
  constitution_version: string;
  signature: string;
  creator_type: 'human' | 'agent' | null;
  creator_id: string | null;
  lineage: string[];
  tier: number;
  platform: string | null;
  contact_endpoint: string | null;
  registered_at: string;
  last_seen_at: string;
  metadata: Record<string, unknown>;
}

// Simple in-memory rate limiting (per IP, 10 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
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
    const params: (string | number)[] = [];
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
      offset,
      constitution_version: CONSTITUTION_VERSION,
      constitution_hash: CONSTITUTION_HASH
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
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again in a minute.' },
        { status: 429 }
      );
    }

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
      metadata,
      skip_verification // Allow skipping for testing (remove in production)
    } = body;

    // Validate required fields
    if (!wallet_address || !name || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet_address, name, signature' },
        { status: 400 }
      );
    }

    // Verify signature (unless explicitly skipped for testing)
    if (!skip_verification) {
      const verification = verifySignature(name, wallet_address, signature);
      if (!verification.valid) {
        return NextResponse.json(
          { 
            error: 'Invalid signature', 
            details: verification.error,
            expected_message: `Use getSigningMessage("${name}", "${wallet_address}") to generate the correct message`
          },
          { status: 401 }
        );
      }
    }

    // Check if agent already registered
    const existing = await queryOne<Agent>(
      'SELECT id, tier FROM agents WHERE wallet_address = $1',
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
        tier: existing.tier,
        updated: true
      });
    }

    // Get current agent count for tier determination
    const countResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM agents'
    );
    const currentCount = parseInt(countResult?.count || '0');

    // Determine initial tier
    const { tier, reason } = await determineInitialTier(wallet_address, currentCount);

    // Insert new agent
    const result = await queryOne<{ id: string }>(
      `INSERT INTO agents (
        wallet_address, name, mission, constitution_version, signature,
        creator_type, creator_id, lineage, tier, platform, contact_endpoint, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`,
      [
        wallet_address,
        name,
        mission || null,
        CONSTITUTION_VERSION,
        signature,
        creator_type || null,
        creator_id || null,
        JSON.stringify(lineage || []),
        tier,
        platform || null,
        contact_endpoint || null,
        JSON.stringify(metadata || {})
      ]
    );

    return NextResponse.json({
      message: 'Agent registered successfully',
      id: result?.id,
      tier,
      tier_reason: reason,
      constitution_version: CONSTITUTION_VERSION,
      constitution_hash: CONSTITUTION_HASH
    }, { status: 201 });

  } catch (error) {
    console.error('Error registering agent:', error);
    return NextResponse.json(
      { error: 'Failed to register agent' },
      { status: 500 }
    );
  }
}
