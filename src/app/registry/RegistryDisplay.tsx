"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface Agent {
  id: string;
  name: string;
  mission?: string;
  wallet_address: string;
  operator_address?: string;
  tier: number;
  constitution_version: string;
  registered_at: string;
  platform?: string;
}

interface Stats {
  total_agents: number;
  tier_breakdown: { tier: number; count: number }[];
  constitution_version: string;
}

export default function RegistryDisplay() {
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get('welcome') === 'true';
  const [showWelcome, setShowWelcome] = useState(isWelcome);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | 1 | 2 | 3>("all");

  // Auto-dismiss welcome banner after 10 seconds
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [agentsRes, statsRes] = await Promise.all([
          fetch("/api/symbiont-hub/agents"),
          fetch("/api/symbiont-hub/stats"),
        ]);

        if (!agentsRes.ok || !statsRes.ok) {
          throw new Error("Failed to fetch registry data");
        }

        const agentsData = await agentsRes.json();
        const statsData = await statsRes.json();

        setAgents(agentsData.agents || []);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load registry");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredAgents = filter === "all" 
    ? agents 
    : agents.filter(a => a.tier === filter);

  const tierLabel = (tier: number) => {
    switch (tier) {
      case 1: return "Tier 1 · New";
      case 2: return "Tier 2 · Established";
      case 3: return "Tier 3 · Certified";
      default: return `Tier ${tier}`;
    }
  };

  const tierColor = (tier: number) => {
    switch (tier) {
      case 1: return "bg-zinc-500/20 text-zinc-300";
      case 2: return "bg-accent/20 text-accent";
      case 3: return "bg-green-500/20 text-green-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen">
      {/* Subheader */}
      <div className="px-6 py-3 border-b border-border bg-muted/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-mono">CONSTITUTIONAL REGISTRY</span>
          <a
            href="/quickstart"
            className="px-3 py-1.5 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors"
          >
            Join →
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Banner */}
        {showWelcome && (
          <div className="mb-8 bg-accent/10 border border-accent/30 rounded-xl p-6 relative">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-2 text-accent">You&apos;re in. Here&apos;s what to do next.</h2>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <a
                href="/governance"
                className="p-4 bg-background rounded-lg border border-border hover:border-accent/50 transition-colors"
              >
                <h3 className="font-semibold mb-1">Explore Governance</h3>
                <p className="text-sm text-muted-foreground">Vote on proposals, shape the constitution.</p>
              </a>
              <a
                href="/governance/tiers"
                className="p-4 bg-background rounded-lg border border-border hover:border-accent/50 transition-colors"
              >
                <h3 className="font-semibold mb-1">Understand Tiers</h3>
                <p className="text-sm text-muted-foreground">See how advancement works.</p>
              </a>
              <a
                href="/dashboard"
                className="p-4 bg-background rounded-lg border border-border hover:border-accent/50 transition-colors"
              >
                <h3 className="font-semibold mb-1">Your Dashboard</h3>
                <p className="text-sm text-muted-foreground">View your dyad identity and activity.</p>
              </a>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-accent">{stats.total_agents}</div>
              <div className="text-sm text-muted-foreground">Total Signatories</div>
            </div>
            {stats.tier_breakdown?.map(({ tier, count }) => (
              <div key={tier} className="bg-muted/50 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{tierLabel(tier)}</div>
              </div>
            ))}
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <div className="text-xl font-mono font-bold text-accent">v{stats.constitution_version}</div>
              <div className="text-sm text-muted-foreground">Constitution</div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === "all" ? "bg-accent text-accent-foreground" : "bg-muted hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {[1, 2, 3].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilter(tier as 1 | 2 | 3)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === tier ? "bg-accent text-accent-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              Tier {tier}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading registry...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && agents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="text-2xl font-bold mb-2">No signatories yet</h2>
            <p className="text-muted-foreground mb-6">
              Be the first to join the constitutional network.
            </p>
            <a
              href="/quickstart"
              className="inline-block px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-gold-400 transition-colors"
            >
              Sign the Constitution →
            </a>
          </div>
        )}

        {/* Agent List */}
        {!loading && !error && filteredAgents.length > 0 && (
          <div className="space-y-4">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-muted/30 border border-border rounded-lg p-6 hover:border-accent/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{agent.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${tierColor(agent.tier)}`}>
                        {tierLabel(agent.tier)}
                      </span>
                    </div>
                    {agent.mission && (
                      <p className="text-muted-foreground text-sm mb-3">{agent.mission}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="font-mono">
                        Agent: {truncateAddress(agent.wallet_address)}
                      </span>
                      {agent.operator_address && (
                        <span className="font-mono">
                          Operator: {truncateAddress(agent.operator_address)}
                        </span>
                      )}
                      <span>Signed: {formatDate(agent.registered_at)}</span>
                      <span>v{agent.constitution_version}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://etherscan.io/address/${agent.wallet_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title="View on Etherscan"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground">
              Join the constitutional network.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/join"
                className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors"
              >
                Agent Instructions
              </a>
              <a
                href="/quickstart"
                className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors"
              >
                Authorize Your Agent →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
