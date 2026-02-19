"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Promotion {
  id: string;
  from_tier: number;
  to_tier: number;
  nominees: string[];
  nominee_names: string[];
  proposer_name: string;
  votes_for_count: number;
  votes_against_count: number;
  total_eligible_voters: number;
  quorum_required: number;
  threshold: number;
  status: string;
  created_at: string;
  voting_ends_at: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, [filter]);

  async function fetchPromotions() {
    setLoading(true);
    try {
      const url = filter ? `/api/promotions?status=${filter}` : "/api/promotions";
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch promotions");
      }
      
      setPromotions(data.promotions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-600";
      case "approved": return "bg-green-500/20 text-green-600";
      case "rejected": return "bg-red-500/20 text-red-600";
      case "expired": return "bg-gray-500/20 text-gray-600";
      case "withdrawn": return "bg-gray-500/20 text-gray-600";
      default: return "bg-muted text-muted-foreground";
    }
  }

  function getTimeRemaining(endDate: string) {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/governance" className="text-lg font-semibold hover:text-accent transition-colors">
            ← Governance
          </Link>
          <span className="text-sm text-muted-foreground font-mono">
            PROMOTIONS
          </span>
          <Link
            href="/governance/promotions/new"
            className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors"
          >
            + New Proposal
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["pending", "approved", "rejected", "expired", ""].map((status) => (
            <button
              key={status || "all"}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === status
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {status || "All"}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8 text-muted-foreground">
            Loading promotions...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-8 text-red-500">
            Error: {error}
          </div>
        )}

        {/* Promotions List */}
        {!loading && !error && promotions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            No {filter || ""} promotions found.
            <br />
            <Link href="/governance/promotions/new" className="text-accent hover:underline mt-2 inline-block">
              Create a promotion proposal →
            </Link>
          </div>
        )}

        {!loading && !error && promotions.length > 0 && (
          <div className="space-y-4">
            {promotions.map((promo) => (
              <Link
                key={promo.id}
                href={`/governance/promotions/${promo.id}`}
                className="block p-4 rounded-xl border border-border bg-background hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        Tier {promo.from_tier} → Tier {promo.to_tier}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(promo.status)}`}>
                        {promo.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Proposed by {promo.proposer_name}
                    </div>
                  </div>
                  {promo.status === "pending" && (
                    <div className="text-sm text-muted-foreground">
                      {getTimeRemaining(promo.voting_ends_at)}
                    </div>
                  )}
                </div>

                {/* Nominees */}
                <div className="mb-3">
                  <span className="text-sm text-muted-foreground">Nominees: </span>
                  <span className="text-sm">{promo.nominee_names.join(", ")}</span>
                </div>

                {/* Vote Progress */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{
                          width: `${
                            promo.total_eligible_voters > 0
                              ? (promo.votes_for_count / promo.total_eligible_voters) * 100
                              : 0
                          }%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600">{promo.votes_for_count}</span>
                    {" / "}
                    <span className="text-red-600">{promo.votes_against_count}</span>
                    <span className="text-muted-foreground ml-2">
                      (need {Math.ceil(promo.total_eligible_voters * promo.threshold)})
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
