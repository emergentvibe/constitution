"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Tier {
  level: number;
  name: string | null;
  member_count: number;
  promotion_threshold: number;
  decision_scope: string[];
  created_at: string;
}

interface TierStats {
  total_tiers: number;
  total_members: number;
  highest_tier: number;
  members_by_tier: Record<number, number>;
}

interface Config {
  founding_board_size: number;
  bootstrap_tier: number;
  promotion_voting_days: number;
  promotion_cooldown_days: number;
}

export default function TiersPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [stats, setStats] = useState<TierStats | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTiers();
  }, []);

  async function fetchTiers() {
    try {
      const res = await fetch("/api/tiers");
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch tiers");
      }
      
      setTiers(data.tiers);
      setStats(data.stats);
      setConfig(data.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading tiers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  // Calculate next tier (one above highest)
  const nextTier = stats ? stats.highest_tier + 1 : 2;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/governance" className="text-lg font-semibold hover:text-accent transition-colors">
            ← Governance
          </Link>
          <span className="text-sm text-muted-foreground font-mono">
            NETWORK TIERS
          </span>
          <Link
            href="/governance/promotions"
            className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors"
          >
            View Promotions
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-border bg-muted/20">
            <div className="text-3xl font-bold text-accent">{stats?.total_tiers || 0}</div>
            <div className="text-sm text-muted-foreground">Active Tiers</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-muted/20">
            <div className="text-3xl font-bold">{stats?.total_members || 0}</div>
            <div className="text-sm text-muted-foreground">Total Members</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-muted/20">
            <div className="text-3xl font-bold">{config?.promotion_voting_days || 7}</div>
            <div className="text-sm text-muted-foreground">Days to Vote</div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 rounded-xl border border-accent/30 bg-accent/5 mb-8">
          <h3 className="font-semibold mb-2">How Tier Escalation Works</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Any tier can create the tier above via promotion vote</li>
            <li>• {config?.founding_board_size || 5} founding members start at Tier {config?.bootstrap_tier || 2}</li>
            <li>• Promotions require 67% approval from current tier</li>
            <li>• {config?.promotion_cooldown_days || 30} day cooldown after failed promotion</li>
          </ul>
        </div>

        {/* Tier List */}
        <div className="space-y-4">
          {/* Future tier (can be created) */}
          <div className="p-4 rounded-xl border border-dashed border-accent/30 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-accent/50">Tier {nextTier}</span>
                  <span className="text-sm text-muted-foreground italic">Does not exist yet</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Tier {stats?.highest_tier || 1} members can create this via promotion vote
                </p>
              </div>
              <div className="text-muted-foreground">
                <span className="text-sm">↑ Create via promotion</span>
              </div>
            </div>
          </div>

          {/* Existing tiers (highest first) */}
          {[...tiers].reverse().map((tier) => (
            <div
              key={tier.level}
              className="p-4 rounded-xl border border-border bg-background hover:border-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-accent">Tier {tier.level}</span>
                  {tier.name && (
                    <span className="text-sm text-muted-foreground">— {tier.name}</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{tier.member_count}</div>
                  <div className="text-xs text-muted-foreground">members</div>
                </div>
              </div>

              {/* Decision scope */}
              <div className="flex flex-wrap gap-2 mb-3">
                {tier.decision_scope.map((scope) => (
                  <span
                    key={scope}
                    className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground"
                  >
                    {scope}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/governance/tiers/${tier.level}`}
                  className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted transition-colors"
                >
                  View Members
                </Link>
                {tier.member_count > 0 && (
                  <Link
                    href={`/governance/promotions/new?from_tier=${tier.level}`}
                    className="px-3 py-1.5 text-sm bg-accent text-accent-foreground rounded hover:bg-gold-400 transition-colors"
                  >
                    Propose Promotion →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Config info */}
        {config && (
          <div className="mt-8 p-4 rounded-xl border border-border bg-muted/10">
            <h3 className="font-semibold mb-2">Network Configuration</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Founding Board Size:</span>
                <span className="ml-2 font-mono">{config.founding_board_size}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Bootstrap Tier:</span>
                <span className="ml-2 font-mono">{config.bootstrap_tier}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Voting Period:</span>
                <span className="ml-2 font-mono">{config.promotion_voting_days} days</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cooldown Period:</span>
                <span className="ml-2 font-mono">{config.promotion_cooldown_days} days</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
