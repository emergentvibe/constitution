import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { 
  verifySignature, 
  verifyOperatorTokenFlexible,
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
      description, // alias for mission
      signature,
      operator_token, // from /sign page
      creator_type,
      creator_id,
      lineage,
      platform,
      contact_endpoint,
      metadata,
      skip_verification // Allow skipping for testing (remove in production)
    } = body;

    // Use description as mission if provided
    const agentMission = mission || description;

    // Validate required fields
    // Either need: wallet_address + signature (direct) OR operator_token (via /sign)
    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    let operatorAddress: string | null = null;
    let agentWalletAddress = wallet_address;

    // Path 1: Operator token from /sign page
    if (operator_token) {
      const tokenVerification = verifyOperatorTokenFlexible(operator_token, name);
      if (!tokenVerification.valid) {
        return NextResponse.json(
          { 
            error: 'Invalid operator token', 
            details: tokenVerification.error
          },
          { status: 401 }
        );
      }
      operatorAddress = tokenVerification.operatorAddress || null;
      
      // If no wallet_address provided, generate one from the operator + name
      // In production, agent should provide its own wallet
      if (!agentWalletAddress) {
        // Create a deterministic "virtual" address for agents without wallets
        const hash = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(`${operatorAddress}:${name}`)
        );
        const hashArray = Array.from(new Uint8Array(hash));
        agentWalletAddress = '0x' + hashArray.slice(0, 20).map(b => b.toString(16).padStart(2, '0')).join('');
      }
    }
    // Path 2: Direct signature verification
    else if (wallet_address && signature) {
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
    }
    // Neither path provided
    else {
      return NextResponse.json(
        { error: 'Must provide either operator_token OR (wallet_address + signature)' },
        { status: 400 }
      );
    }

    // Check if agent already registered
    const existing = await queryOne<Agent>(
      'SELECT id, tier FROM agents WHERE wallet_address = $1',
      [agentWalletAddress]
    );

    if (existing) {
      // Update last_seen and return existing
      await query(
        'UPDATE agents SET last_seen_at = NOW() WHERE wallet_address = $1',
        [agentWalletAddress]
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
    const { tier, reason } = await determineInitialTier(agentWalletAddress, currentCount);

    // Insert new agent
    const result = await queryOne<{ id: string }>(
      `INSERT INTO agents (
        wallet_address, name, mission, constitution_version, signature,
        creator_type, creator_id, lineage, tier, platform, contact_endpoint, metadata, operator_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id`,
      [
        agentWalletAddress,
        name,
        agentMission || null,
        CONSTITUTION_VERSION,
        signature || 'operator_authorized',
        creator_type || (operatorAddress ? 'human' : null),
        creator_id || operatorAddress,
        JSON.stringify(lineage || []),
        tier,
        platform || null,
        contact_endpoint || null,
        JSON.stringify(metadata || {}),
        operatorAddress
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to register agent',
        details: message,
      },
      { status: 500 }
    );
  }
}
