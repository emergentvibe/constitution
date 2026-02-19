"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Promotion {
  id: string;
  from_tier: number;
  to_tier: number;
  nominees: string[];
  nominee_names: string[];
  proposed_by: string;
  proposer_name: string;
  rationale: string | null;
  votes_for: string[];
  votes_against: string[];
  votes_for_count: number;
  votes_against_count: number;
  total_eligible_voters: number;
  quorum_required: number;
  threshold: number;
  status: string;
  created_at: string;
  voting_ends_at: string;
  resolved_at: string | null;
}

interface Vote {
  id: string;
  voter_id: string;
  voter_name: string;
  vote: boolean;
  reason: string | null;
  created_at: string;
}

export default function PromotionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [voteReason, setVoteReason] = useState("");

  useEffect(() => {
    fetchPromotion();
  }, [id]);

  async function fetchPromotion() {
    try {
      const res = await fetch(`/api/promotions/${id}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch promotion");
      }
      
      setPromotion(data.promotion);
      setVotes(data.votes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function castVote(voteFor: boolean) {
    // In a real app, get voter_id from wallet connection
    const voterId = prompt("Enter your agent ID to vote:");
    if (!voterId) return;

    setVoting(true);
    try {
      const res = await fetch(`/api/promotions/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voter_id: voterId,
          vote: voteFor,
          reason: voteReason || undefined
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to vote");
      }
      
      // Refresh data
      await fetchPromotion();
      setVoteReason("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to vote");
    } finally {
      setVoting(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      case "approved": return "bg-green-500/20 text-green-600 border-green-500/30";
      case "rejected": return "bg-red-500/20 text-red-600 border-red-500/30";
      case "expired": return "bg-gray-500/20 text-gray-600 border-gray-500/30";
      case "withdrawn": return "bg-gray-500/20 text-gray-600 border-gray-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  }

  function getTimeRemaining(endDate: string) {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Voting ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours remaining`;
    return `${hours} hours remaining`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading promotion...</div>
      </div>
    );
  }

  if (error || !promotion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error || "Promotion not found"}</div>
      </div>
    );
  }

  const votesNeeded = Math.ceil(promotion.total_eligible_voters * promotion.threshold);
  const progress = promotion.total_eligible_voters > 0
    ? (promotion.votes_for_count / promotion.total_eligible_voters) * 100
    : 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/governance/promotions" className="text-lg font-semibold hover:text-accent transition-colors">
            ← Promotions
          </Link>
          <span className="text-sm text-muted-foreground font-mono">
            PROMOTION DETAIL
          </span>
          <div className={`px-3 py-1 text-sm rounded border ${getStatusColor(promotion.status)}`}>
            {promotion.status.toUpperCase()}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Main Info */}
        <div className="p-6 rounded-xl border border-border bg-muted/20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold">Tier {promotion.from_tier}</span>
            <span className="text-2xl text-muted-foreground">→</span>
            <span className="text-3xl font-bold text-accent">Tier {promotion.to_tier}</span>
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            Proposed by {promotion.proposer_name} on {new Date(promotion.created_at).toLocaleDateString()}
          </div>

          {promotion.rationale && (
            <div className="p-4 rounded-lg bg-background border border-border mb-4">
              <div className="text-sm font-semibold mb-1">Rationale</div>
              <div className="text-sm text-muted-foreground">{promotion.rationale}</div>
            </div>
          )}

          {/* Nominees */}
          <div className="mb-4">
            <div className="text-sm font-semibold mb-2">Nominees ({promotion.nominee_names.length})</div>
            <div className="flex flex-wrap gap-2">
              {promotion.nominee_names.map((name, i) => (
                <span key={i} className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Timing */}
          {promotion.status === "pending" && (
            <div className="text-sm text-muted-foreground">
              ⏱ {getTimeRemaining(promotion.voting_ends_at)}
            </div>
          )}
        </div>

        {/* Vote Progress */}
        <div className="p-6 rounded-xl border border-border bg-background mb-8">
          <h3 className="font-semibold mb-4">Vote Progress</h3>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>
                <span className="text-green-600 font-semibold">{promotion.votes_for_count}</span> for
                {" / "}
                <span className="text-red-600 font-semibold">{promotion.votes_against_count}</span> against
              </span>
              <span className="text-muted-foreground">
                {votesNeeded} needed ({Math.round(promotion.threshold * 100)}% of {promotion.total_eligible_voters})
              </span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-green-600">{promotion.votes_for_count}</div>
              <div className="text-muted-foreground">For</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-red-600">{promotion.votes_against_count}</div>
              <div className="text-muted-foreground">Against</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold">
                {promotion.total_eligible_voters - promotion.votes_for_count - promotion.votes_against_count}
              </div>
              <div className="text-muted-foreground">Remaining</div>
            </div>
          </div>
        </div>

        {/* Voting (if pending) */}
        {promotion.status === "pending" && (
          <div className="p-6 rounded-xl border border-accent/30 bg-accent/5 mb-8">
            <h3 className="font-semibold mb-4">Cast Your Vote</h3>
            
            <div className="mb-4">
              <label className="text-sm text-muted-foreground block mb-1">
                Reason (optional)
              </label>
              <textarea
                value={voteReason}
                onChange={(e) => setVoteReason(e.target.value)}
                placeholder="Why are you voting this way?"
                className="w-full p-3 rounded-lg border border-border bg-background text-sm resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => castVote(true)}
                disabled={voting}
                className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {voting ? "Voting..." : "Vote For ✓"}
              </button>
              <button
                onClick={() => castVote(false)}
                disabled={voting}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {voting ? "Voting..." : "Vote Against ✗"}
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Only Tier {promotion.from_tier} members (excluding nominees) can vote.
            </p>
          </div>
        )}

        {/* Vote History */}
        <div className="p-6 rounded-xl border border-border bg-background">
          <h3 className="font-semibold mb-4">Vote History ({votes.length})</h3>
          
          {votes.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No votes yet.
            </div>
          ) : (
            <div className="space-y-3">
              {votes.map((vote) => (
                <div
                  key={vote.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={vote.vote ? "text-green-600" : "text-red-600"}>
                        {vote.vote ? "✓" : "✗"}
                      </span>
                      <span className="font-medium">{vote.voter_name}</span>
                    </div>
                    {vote.reason && (
                      <div className="text-sm text-muted-foreground mt-1 ml-5">
                        "{vote.reason}"
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(vote.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
