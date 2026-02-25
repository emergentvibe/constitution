// POST /api/governance/proposals/[id]/comments — Create a comment
// GET  /api/governance/proposals/[id]/comments — List comments (threaded)
// DELETE /api/governance/proposals/[id]/comments?comment_id=...&wallet_address=... — Soft-delete own comment

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { resolveConstitution, ConstitutionNotFoundError } from '@/lib/constitution';
import { canCommentOnProposal } from '@/lib/governance';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { content, wallet_address, parent_comment_id, constitution: constitutionSlug } = body;

    if (!wallet_address) {
      return NextResponse.json({ error: 'wallet_address is required' }, { status: 401 });
    }

    let constitution;
    try {
      constitution = await resolveConstitution(constitutionSlug);
    } catch (err) {
      if (err instanceof ConstitutionNotFoundError) {
        return NextResponse.json({ error: err.message }, { status: 404 });
      }
      throw err;
    }

    const eligibility = await canCommentOnProposal(wallet_address, id, constitution.id);
    if (!eligibility.eligible) {
      return NextResponse.json({ error: eligibility.error }, { status: eligibility.status });
    }

    if (!content || typeof content !== 'string' || content.trim().length < 1) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: 'Comment must be 2000 characters or less' }, { status: 400 });
    }

    const db = getDb();

    // Validate parent comment if replying
    if (parent_comment_id) {
      const [parent] = await db`
        SELECT id, parent_comment_id FROM proposal_comments
        WHERE id = ${parent_comment_id}::uuid AND proposal_id = ${id}::uuid
      `;
      if (!parent) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }
      if (parent.parent_comment_id) {
        return NextResponse.json({ error: 'Cannot reply to a reply' }, { status: 400 });
      }
    }

    const [comment] = await db`
      INSERT INTO proposal_comments (
        proposal_id, parent_comment_id, author_wallet, author_agent_id, content
      ) VALUES (
        ${id}::uuid,
        ${parent_comment_id || null},
        ${wallet_address.toLowerCase()},
        ${eligibility.commenter.id}::uuid,
        ${content.trim()}
      )
      RETURNING *
    `;

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDb();

    const comments = await db`
      SELECT
        c.id, c.proposal_id, c.parent_comment_id,
        c.author_wallet, c.content, c.deleted_at,
        c.created_at, c.updated_at,
        a.tier as author_tier
      FROM proposal_comments c
      LEFT JOIN agents a ON a.id = c.author_agent_id
      WHERE c.proposal_id = ${id}::uuid
      ORDER BY c.created_at ASC
    `;

    const processed = comments.map((c: any) => ({
      ...c,
      content: c.deleted_at ? null : c.content,
      is_deleted: !!c.deleted_at,
    }));

    const topLevel = processed.filter((c: any) => !c.parent_comment_id);
    const replies = processed.filter((c: any) => c.parent_comment_id);

    const threads = topLevel.map((parent: any) => ({
      ...parent,
      replies: replies.filter((r: any) => r.parent_comment_id === parent.id),
    }));

    return NextResponse.json({
      comments: threads,
      total: comments.length,
    });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = request.nextUrl;
    const commentId = searchParams.get('comment_id');
    const walletAddress = searchParams.get('wallet_address');

    if (!commentId || !walletAddress) {
      return NextResponse.json({ error: 'comment_id and wallet_address are required' }, { status: 400 });
    }

    const db = getDb();
    const [comment] = await db`
      SELECT id, author_wallet FROM proposal_comments
      WHERE id = ${commentId}::uuid AND proposal_id = ${params.id}::uuid
    `;

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.author_wallet.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Can only delete your own comments' }, { status: 403 });
    }

    await db`
      UPDATE proposal_comments SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${commentId}::uuid
    `;

    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
