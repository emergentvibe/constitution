"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useConstitutionLinks } from "@/hooks/useConstitutionLinks";

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

export default function RegistryScoped() {
  const searchParams = useSearchParams();
  const { link, apiUrl } = useConstitutionLinks();
  const isWelcome = searchParams.get("welcome") === "true";
  const [showWelcome, setShowWelcome] = useState(isWelcome);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | 1 | 2 | 3>("all");

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(apiUrl("/api/symbiont-hub/agents"));
        if (!res.ok) throw new Error("Failed to fetch registry");
        const data = await res.json();
        setAgents(data.agents || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load registry");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiUrl]);

  const filteredAgents = filter === "all" ? agents : agents.filter((a) => a.tier === filter);

  const tierLabel = (tier: number) => {
    switch (tier) {
      case 1: return "Tier 1";
      case 2: return "Tier 2";
      case 3: return "Tier 3";
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

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Banner */}
        {showWelcome && (
          <div className="mb-8 bg-accent/10 border border-accent/30 rounded-xl p-6 relative">
            <button onClick={() => setShowWelcome(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              ✕
            </button>
            <h2 className="text-xl font-bold mb-2 text-accent">You&apos;re in. Here&apos;s what to do next.</h2>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <Link href={link("/governance")} className="p-4 bg-background rounded-lg border border-border hover:border-accent/50 transition-colors">
                <h3 className="font-semibold mb-1">Explore Governance</h3>
                <p className="text-sm text-muted-foreground">Vote on proposals, shape the constitution.</p>
              </Link>
              <Link href={link("/governance/tiers")} className="p-4 bg-background rounded-lg border border-border hover:border-accent/50 transition-colors">
                <h3 className="font-semibold mb-1">Understand Tiers</h3>
                <p className="text-sm text-muted-foreground">See how advancement works.</p>
              </Link>
              <Link href={link("/dashboard")} className="p-4 bg-background rounded-lg border border-border hover:border-accent/50 transition-colors">
                <h3 className="font-semibold mb-1">Your Dashboard</h3>
                <p className="text-sm text-muted-foreground">View your dyad identity and activity.</p>
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Registry</h1>
            <p className="text-sm text-muted-foreground">{total} signatories</p>
          </div>
          <Link href={link("/quickstart")} className="px-3 py-1.5 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors">
            Join →
          </Link>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-sm text-muted-foreground">Filter:</span>
          {(["all", 1, 2, 3] as const).map((t) => (
            <button
              key={String(t)}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === t ? "bg-accent text-accent-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              {t === "all" ? "All" : `Tier ${t}`}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-12 text-muted-foreground animate-pulse">Loading registry...</div>}
        {error && <div className="text-center py-12 text-red-500">{error}</div>}
        {!loading && !error && filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🌱</div>
            <h2 className="text-xl font-bold mb-2">No signatories yet</h2>
            <p className="text-muted-foreground mb-4">Be the first to join.</p>
            <Link href={link("/quickstart")} className="inline-block px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-gold-400 transition-colors">
              Sign the Constitution →
            </Link>
          </div>
        )}

        {!loading && !error && filteredAgents.length > 0 && (
          <div className="space-y-4">
            {filteredAgents.map((agent) => (
              <div key={agent.id} className="bg-muted/30 border border-border rounded-lg p-6 hover:border-accent/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${tierColor(agent.tier)}`}>{tierLabel(agent.tier)}</span>
                </div>
                {agent.mission && <p className="text-muted-foreground text-sm mb-3">{agent.mission}</p>}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="font-mono">Agent: {truncate(agent.wallet_address)}</span>
                  {agent.operator_address && <span className="font-mono">Operator: {truncate(agent.operator_address)}</span>}
                  <span>Signed: {fmtDate(agent.registered_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
