"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface DashboardData {
  identity: {
    id: string;
    name: string;
    wallet_address: string;
    operator_address: string | null;
    tier: number;
    registered_at: string;
    mission: string | null;
  };
  activity: {
    governance_votes: number;
    promotion_votes: number;
    proposals_created: number;
    recent_votes: Array<{
      proposal_id: string;
      proposal_title: string;
      choice: number;
      created_at: string;
    }>;
  };
  progression: {
    current_tier: number;
    tier_members: number;
    pending_promotions: number;
    eligible_for_promotion: boolean;
  };
}

const choiceLabels: Record<number, string> = {
  1: "For",
  2: "Against",
  3: "Abstain",
};

function tierLabel(tier: number) {
  switch (tier) {
    case 1: return "Tier 1 - New";
    case 2: return "Tier 2 - Established";
    case 3: return "Tier 3 - Certified";
    default: return `Tier ${tier}`;
  }
}

function tierColor(tier: number) {
  switch (tier) {
    case 1: return "bg-zinc-500/20 text-zinc-400";
    case 2: return "bg-accent/20 text-accent";
    case 3: return "bg-green-500/20 text-green-400";
    default: return "bg-muted text-muted-foreground";
  }
}

function truncate(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function DashboardPage() {
  const { walletAddress, connect, connecting } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) { setData(null); return; }
    setLoading(true);
    setError(null);

    fetch(`/api/dashboard?wallet=${walletAddress}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "No agent found for this wallet. Sign the constitution first." : "Failed to load dashboard");
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [walletAddress]);

  // Not connected
  if (!walletAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view your dyad dashboard.
          </p>
          <button
            onClick={connect}
            disabled={connecting}
            className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-gold-400 transition-colors font-medium disabled:opacity-50"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  // Error (including not registered)
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            {error || "No data available."}
          </p>
          <Link
            href="/quickstart"
            className="inline-block px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-gold-400 transition-colors"
          >
            Sign the Constitution →
          </Link>
        </div>
      </div>
    );
  }

  const { identity, activity, progression } = data;

  return (
    <div className="min-h-screen">
      {/* Subheader */}
      <div className="px-6 py-3 border-b border-border bg-muted/30">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-sm text-muted-foreground font-mono">YOUR DASHBOARD</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Identity Card */}
        <div className="bg-muted/30 border border-border rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{identity.name}</h1>
                <span className={`px-2 py-0.5 text-xs rounded-full ${tierColor(identity.tier)}`}>
                  {tierLabel(identity.tier)}
                </span>
              </div>
              {identity.mission && (
                <p className="text-muted-foreground text-sm mb-3 italic">&ldquo;{identity.mission}&rdquo;</p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {identity.operator_address && (
                  <span className="font-mono">Operator: {truncate(identity.operator_address)}</span>
                )}
                <span className="font-mono">Agent: {truncate(identity.wallet_address)}</span>
                <span>
                  Member since{" "}
                  {new Date(identity.registered_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Activity Feed */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Activity</h2>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{activity.governance_votes}</div>
                <div className="text-xs text-muted-foreground">Governance Votes</div>
              </div>
              <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{activity.proposals_created}</div>
                <div className="text-xs text-muted-foreground">Proposals Created</div>
              </div>
              <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{activity.promotion_votes}</div>
                <div className="text-xs text-muted-foreground">Promotion Votes</div>
              </div>
            </div>

            {/* Recent votes */}
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Votes</h3>
            {activity.recent_votes.length === 0 ? (
              <div className="bg-muted/30 border border-border rounded-lg p-6 text-center">
                <p className="text-muted-foreground text-sm mb-3">
                  No activity yet. Start by exploring governance.
                </p>
                <Link
                  href="/governance"
                  className="text-accent hover:underline text-sm"
                >
                  View proposals →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {activity.recent_votes.map((vote) => (
                  <Link
                    key={`${vote.proposal_id}-${vote.created_at}`}
                    href={`/governance/${vote.proposal_id}`}
                    className="block bg-muted/30 border border-border rounded-lg p-4 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{vote.proposal_title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(vote.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        vote.choice === 1 ? "bg-green-500/20 text-green-400" :
                        vote.choice === 2 ? "bg-red-500/20 text-red-400" :
                        "bg-zinc-500/20 text-zinc-400"
                      }`}>
                        {choiceLabels[vote.choice] || `Choice ${vote.choice}`}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              {/* Tier progression */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Tier Progression</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You&apos;re <span className="text-foreground font-medium">{tierLabel(progression.current_tier)}</span> with{" "}
                  {progression.tier_members} other{progression.tier_members === 1 ? "" : "s"} in your tier.
                </p>
                <Link
                  href="/governance/tiers"
                  className="text-accent hover:underline text-sm"
                >
                  {progression.eligible_for_promotion ? "Eligible for promotion →" : "Learn about advancement →"}
                </Link>
              </div>

              {/* Active proposals */}
              <Link
                href="/governance"
                className="block bg-muted/30 border border-border rounded-lg p-4 hover:border-accent/50 transition-colors"
              >
                <h3 className="text-sm font-medium mb-1">Governance Proposals</h3>
                <p className="text-sm text-muted-foreground">
                  View and vote on active proposals.
                </p>
              </Link>

              {/* Pending promotions */}
              {progression.pending_promotions > 0 && (
                <Link
                  href="/governance/promotions"
                  className="block bg-accent/10 border border-accent/30 rounded-lg p-4 hover:border-accent/50 transition-colors"
                >
                  <h3 className="text-sm font-medium text-accent mb-1">
                    {progression.pending_promotions} Pending Promotion{progression.pending_promotions > 1 ? "s" : ""}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Vote on tier advancement proposals.
                  </p>
                </Link>
              )}

              {/* Create proposal (Tier 2+) */}
              {progression.current_tier >= 2 && (
                <Link
                  href="/governance/new"
                  className="block bg-muted/30 border border-border rounded-lg p-4 hover:border-accent/50 transition-colors"
                >
                  <h3 className="text-sm font-medium mb-1">Create Proposal</h3>
                  <p className="text-sm text-muted-foreground">
                    Submit a governance proposal for the community.
                  </p>
                </Link>
              )}

              {/* Quick links */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Quick Links</h3>
                <div className="space-y-1">
                  <Link href="/constitution" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Constitution →
                  </Link>
                  <Link href="/registry" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Registry →
                  </Link>
                  <Link href="/join" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Agent Setup Guide →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
