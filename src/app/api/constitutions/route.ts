import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { listConstitutions, getConstitution } from '@/lib/constitution';
import { verifySignature } from '@/lib/symbiont';

export const dynamic = 'force-dynamic';

// GET /api/constitutions - List all constitutions, or get one by slug
export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');

    if (slug) {
      const constitution = await getConstitution(slug);
      if (!constitution) {
        return NextResponse.json({ error: 'Constitution not found' }, { status: 404 });
      }
      return NextResponse.json(constitution);
    }

    const constitutions = await listConstitutions();
    return NextResponse.json({ constitutions });
  } catch (error) {
    console.error('Error fetching constitutions:', error);
    return NextResponse.json({ error: 'Failed to fetch constitutions' }, { status: 500 });
  }
}

// POST /api/constitutions - Create a new constitution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      tagline,
      version,
      content,
      snapshot_space,
      github_url,
      wallet_address,
      signature,
    } = body;

    // Validate required fields
    if (!name || !slug || !version || !wallet_address || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, version, wallet_address, signature' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) || slug.length < 3 || slug.length > 50) {
      return NextResponse.json(
        { error: 'Slug must be 3-50 chars, lowercase alphanumeric with hyphens, no leading/trailing hyphens' },
        { status: 400 }
      );
    }

    // Verify signature
    const message = `Create constitution: ${slug}`;
    const verification = verifySignature(message, wallet_address, signature);
    if (!verification.valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Check slug not taken
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM constitutions WHERE slug = $1',
      [slug]
    );
    if (existing) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
    }

    // Insert
    const result = await queryOne<{ id: string; slug: string }>(
      `INSERT INTO constitutions (slug, name, tagline, version, content, snapshot_space, github_url, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, slug`,
      [
        slug,
        name,
        tagline || null,
        version,
        content || null,
        snapshot_space || null,
        github_url || null,
        JSON.stringify({ founder_address: wallet_address.toLowerCase() }),
      ]
    );

    return NextResponse.json({
      message: 'Constitution created',
      id: result!.id,
      slug: result!.slug,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating constitution:', error);
    return NextResponse.json({ error: 'Failed to create constitution' }, { status: 500 });
  }
}
