"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useConstitutionLinks } from "@/hooks/useConstitutionLinks";
import { timeAgo } from "@/lib/format";

interface Comment {
  id: string;
  proposal_id: string;
  parent_comment_id: string | null;
  author_wallet: string;
  author_tier: number | null;
  content: string | null;
  is_deleted: boolean;
  created_at: string;
  replies?: Comment[];
}

function truncateWallet(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function CommentCard({
  comment,
  isReply,
  walletAddress,
  onReply,
  onDelete,
}: {
  comment: Comment;
  isReply?: boolean;
  walletAddress: string | null;
  onReply?: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}) {
  const isOwn = walletAddress && comment.author_wallet.toLowerCase() === walletAddress.toLowerCase();

  return (
    <div className={isReply ? "ml-8 pl-4 border-l border-border/50" : ""}>
      <div className="py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span className="font-mono">{truncateWallet(comment.author_wallet)}</span>
          {comment.author_tier !== null && (
            <span className="px-1.5 py-0.5 bg-muted rounded text-[10px]">T{comment.author_tier}</span>
          )}
          <span>{timeAgo(new Date(comment.created_at))}</span>
          {!comment.is_deleted && !isReply && onReply && (
            <button
              onClick={() => onReply(comment.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Reply
            </button>
          )}
          {!comment.is_deleted && isOwn && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-muted-foreground hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
        {comment.is_deleted ? (
          <p className="text-sm text-muted-foreground italic">[deleted]</p>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
        )}
      </div>
    </div>
  );
}

export function CommentThread({ proposalId }: { proposalId: string }) {
  const { walletAddress, connect, connecting } = useAuth();
  const { apiUrl } = useConstitutionLinks();

  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(apiUrl(`/api/governance/proposals/${proposalId}/comments`));
      if (!res.ok) return;
      const data = await res.json();
      setComments(data.comments || []);
      setTotal(data.total || 0);
    } catch {
      // silent — comments are non-critical
    } finally {
      setLoading(false);
    }
  }, [proposalId, apiUrl]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function submitComment(content: string, parentId?: string | null) {
    if (!walletAddress) {
      await connect();
      return;
    }

    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(apiUrl(`/api/governance/proposals/${proposalId}/comments`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          wallet_address: walletAddress,
          parent_comment_id: parentId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");

      // Refresh comments to get proper threading
      await fetchComments();
      setNewComment("");
      setReplyingTo(null);
      setReplyText("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteComment(commentId: string) {
    if (!walletAddress) return;

    try {
      const res = await fetch(
        apiUrl(`/api/governance/proposals/${proposalId}/comments`, {
          comment_id: commentId,
          wallet_address: walletAddress,
        }),
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      await fetchComments();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="bg-muted/30 border border-border rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">
        Discussion{total > 0 ? ` (${total})` : ""}
      </h3>

      {/* New comment form */}
      <div className="mb-6">
        {walletAddress ? (
          <>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this proposal..."
              rows={3}
              maxLength={2000}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-accent resize-none text-sm"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">{newComment.length}/2000</span>
              <button
                onClick={() => submitComment(newComment)}
                disabled={submitting || !newComment.trim()}
                className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors disabled:bg-muted disabled:text-muted-foreground"
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 py-3">
            <span className="text-sm text-muted-foreground">Connect your wallet to join the discussion</span>
            <button
              onClick={connect}
              disabled={connecting}
              className="px-3 py-1.5 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50"
            >
              {connecting ? "Connecting..." : "Connect"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Comments */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="divide-y divide-border/50">
          {comments.map((thread) => (
            <div key={thread.id}>
              <CommentCard
                comment={thread}
                walletAddress={walletAddress}
                onReply={(id) => {
                  setReplyingTo(replyingTo === id ? null : id);
                  setReplyText("");
                }}
                onDelete={deleteComment}
              />

              {/* Reply form */}
              {replyingTo === thread.id && walletAddress && (
                <div className="ml-8 pl-4 border-l border-border/50 pb-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    rows={2}
                    maxLength={2000}
                    autoFocus
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-accent resize-none text-sm"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => submitComment(replyText, thread.id)}
                      disabled={submitting || !replyText.trim()}
                      className="px-3 py-1.5 bg-accent text-accent-foreground text-xs font-medium rounded-lg hover:bg-gold-400 transition-colors disabled:bg-muted disabled:text-muted-foreground"
                    >
                      {submitting ? "Posting..." : "Reply"}
                    </button>
                    <button
                      onClick={() => { setReplyingTo(null); setReplyText(""); }}
                      className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <span className="text-xs text-muted-foreground ml-auto">{replyText.length}/2000</span>
                  </div>
                </div>
              )}

              {/* Replies */}
              {thread.replies?.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  isReply
                  walletAddress={walletAddress}
                  onDelete={deleteComment}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
