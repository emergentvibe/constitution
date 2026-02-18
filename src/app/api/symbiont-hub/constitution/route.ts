import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// GET /api/symbiont-hub/constitution - Get current constitution version
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version');

    if (version) {
      // Get specific version
      const v = await queryOne(
        'SELECT * FROM constitution_versions WHERE version = $1',
        [version]
      );

      if (!v) {
        return NextResponse.json(
          { error: 'Version not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(v);
    }

    // Get current version
    const current = await queryOne(
      'SELECT * FROM constitution_versions ORDER BY published_at DESC LIMIT 1'
    );

    // Get version history
    const history = await query(
      'SELECT version, published_at, changelog FROM constitution_versions ORDER BY published_at DESC'
    );

    return NextResponse.json({
      current: current?.version || '0.1.5',
      content_hash: current?.content_hash,
      published_at: current?.published_at,
      history
    });
  } catch (error) {
    console.error('Error fetching constitution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch constitution' },
      { status: 500 }
    );
  }
}
