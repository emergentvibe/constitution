"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Tier {
  level: number;
  name: string | null;
  member_count: number;
  promotion_threshold: number;
  decision_scope: string[];
  created_at: string;
}

interface Member {
  id: string;
  name: string;
  wallet_address: string;
  registered_at: string;
}

export default function TierDetailPage() {
  const params = useParams();
  const level = parseInt(params.level as string);
  
  const [tier, setTier] = useState<Tier | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTier();
  }, [level]);

  async function fetchTier() {
    try {
      const res = await fetch(`/api/tiers/${level}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch tier");
      }
      
      setTier(data.tier);
      setMembers(data.members);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading tier...</div>
      </div>
    );
  }

  if (error || !tier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error || "Tier not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/governance/tiers" className="text-lg font-semibold hover:text-accent transition-colors">
            ← All Tiers
          </Link>
          <span className="text-sm text-muted-foreground font-mono">
            TIER {level} {tier.name ? `— ${tier.name}` : ""}
          </span>
          <Link
            href={`/governance/promotions/new?from_tier=${level}`}
            className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors"
          >
            Propose Promotion
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tier Info */}
        <div className="p-6 rounded-xl border border-border bg-muted/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">
                Tier {tier.level}
                {tier.name && <span className="text-muted-foreground ml-2">— {tier.name}</span>}
              </h1>
              <p className="text-muted-foreground mt-1">
                Created {new Date(tier.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-accent">{tier.member_count}</div>
              <div className="text-sm text-muted-foreground">members</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Promotion Threshold:</span>
              <span className="ml-2 font-mono">{Math.round(tier.promotion_threshold * 100)}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Decision Scope:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {tier.decision_scope.map((scope) => (
                  <span
                    key={scope}
                    className="px-2 py-0.5 text-xs rounded bg-accent/20 text-accent"
                  >
                    {scope}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Members */}
        <h2 className="text-xl font-bold mb-4">Members ({members.length})</h2>
        
        {members.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-lg font-medium mb-2">No members at this tier yet</h3>
            <p className="text-muted-foreground mb-4">
              {level === 1
                ? "Sign the constitution to become a Tier 1 member."
                : `Members are promoted from Tier ${level - 1} through community governance.`}
            </p>
            {level === 1 ? (
              <Link
                href="/quickstart"
                className="inline-block px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors"
              >
                Sign the Constitution →
              </Link>
            ) : (
              <Link
                href="/governance/promotions/new"
                className="inline-block px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors"
              >
                Propose a Promotion →
              </Link>
            )}
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            {members.map((member, i) => (
              <div
                key={member.id}
                className={`p-4 flex items-center justify-between ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div>
                  <div className="font-semibold">{member.name}</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {member.wallet_address.slice(0, 6)}...{member.wallet_address.slice(-4)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Joined {new Date(member.registered_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tier Navigation */}
        <div className="flex justify-between mt-8 pt-8 border-t border-border">
          {level > 1 ? (
            <Link
              href={`/governance/tiers/${level - 1}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Tier {level - 1}
            </Link>
          ) : (
            <div />
          )}
          <Link
            href={`/governance/tiers/${level + 1}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Tier {level + 1} →
          </Link>
        </div>
      </div>
    </div>
  );
}
