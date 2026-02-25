import { NextRequest, NextResponse } from 'next/server';
import { getConstitutionFull } from '@/lib/constitution';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const constitution = await getConstitutionFull(params.slug);

    if (!constitution || !constitution.content) {
      return NextResponse.json(
        { error: 'Constitution not found or has no content' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const format = request.nextUrl.searchParams.get('format');

    // Raw markdown for AI agents
    if (format === 'raw') {
      return new NextResponse(constitution.content, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          'X-Constitution-Version': constitution.version,
          'X-Constitution-Hash': constitution.content_hash || '',
        },
      });
    }

    // JSON (default)
    return NextResponse.json(
      {
        slug: constitution.slug,
        name: constitution.name,
        content: constitution.content,
        version: constitution.version,
        content_hash: constitution.content_hash,
        updated_at: constitution.updated_at,
      },
      {
        headers: {
          ...CORS_HEADERS,
          'Cache-Control': 'public, max-age=300',
        },
      }
    );
  } catch (error) {
    console.error('Constitution API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
