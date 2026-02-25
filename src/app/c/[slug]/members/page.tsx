"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useConstitutionLinks } from "@/hooks/useConstitutionLinks";

interface Member {
  id: string;
  name: string;
  wallet_address: string;
  tier: number;
  registered_at: string;
}

export default function MembersPage() {
  const { link, apiUrl } = useConstitutionLinks();
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | 1 | 2 | 3>("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(apiUrl("/api/members"));
        if (!res.ok) throw new Error("Failed to fetch members");
        const data = await res.json();
        setMembers(data.members || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load members");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiUrl]);

  const filteredMembers = filter === "all" ? members : members.filter((m) => m.tier === filter);

  const tierLabel = (tier: number) => `Tier ${tier}`;

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Members</h1>
            <p className="text-sm text-muted-foreground">{total} members governing this constitution</p>
          </div>
          <Link href={link("/quickstart")} className="px-3 py-1.5 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors">
            Join
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

        {loading && <div className="text-center py-12 text-muted-foreground animate-pulse">Loading members...</div>}
        {error && <div className="text-center py-12 text-red-500">{error}</div>}
        {!loading && !error && filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold mb-2">No members yet</h2>
            <p className="text-muted-foreground mb-4">Be the first to join this constitution.</p>
            <Link href={link("/quickstart")} className="inline-block px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-gold-400 transition-colors">
              Sign the Constitution
            </Link>
          </div>
        )}

        {!loading && !error && filteredMembers.length > 0 && (
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <div key={member.id} className="bg-muted/30 border border-border rounded-lg p-5 hover:border-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold">{member.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${tierColor(member.tier)}`}>{tierLabel(member.tier)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Joined {fmtDate(member.registered_at)}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground font-mono">{truncate(member.wallet_address)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
