"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useConstitutionLinks } from "@/hooks/useConstitutionLinks";

type ProposalFilter = "all" | "active" | "pending" | "closed";

interface Proposal {
  id: string;
  title: string;
  description?: string;
  body?: string;
  status?: string;
  state?: string;
  proposal_type?: string;
  choices?: string[];
  scores?: number[];
  scores_total?: number;
  votes?: number;
  voting_start?: string;
  voting_end?: string;
  start?: number;
  end?: number;
  source: "local" | "snapshot";
  author?: { display_name?: string };
  author_wallet?: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  constitutional_amendment: { label: "Amendment", color: "bg-purple-600" },
  boundary_change: { label: "Boundary", color: "bg-orange-600" },
  policy_proposal: { label: "Policy", color: "bg-blue-600" },
  resource_allocation: { label: "Resources", color: "bg-green-600" },
  emergency_action: { label: "Emergency", color: "bg-red-600" },
};

const statusStyles: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-zinc-700", text: "text-zinc-300" },
  pending: { bg: "bg-yellow-900/50", text: "text-yellow-400" },
  active: { bg: "bg-emerald-900/50", text: "text-emerald-400" },
  closed: { bg: "bg-zinc-800", text: "text-zinc-400" },
  executed: { bg: "bg-blue-900/50", text: "text-blue-400" },
  rejected: { bg: "bg-red-900/50", text: "text-red-400" },
};

function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffDays > 1) return `in ${diffDays} days`;
  if (diffDays === 1) return "in 1 day";
  if (diffHours > 1) return `in ${diffHours} hours`;
  if (diffHours === 1) return "in 1 hour";
  if (diffMs > 0) return "soon";
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === -1) return "1 day ago";
  return "recently";
}

export default function GovernancePageScoped() {
  const { walletAddress, connect, connecting } = useAuth();
  const { link, apiUrl } = useConstitutionLinks();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProposalFilter>("all");

  useEffect(() => {
    fetchProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function fetchProposals() {
    setLoading(true);
    setError(null);
    try {
      const state = filter === "all" ? "" : `&state=${filter}`;
      const response = await fetch(apiUrl("/api/governance/proposals", { source: "all" }) + state);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch proposals");
      setProposals(data.proposals || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filterTabs: { key: ProposalFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "pending", label: "Pending" },
    { key: "closed", label: "Closed" },
  ];

  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Governance</h1>
            <p className="text-muted-foreground">
              Participate in shaping the constitution through democratic proposals and voting.
            </p>
          </div>
          {walletAddress ? (
            <Link
              href={link("/governance/new")}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-gold-400 transition-colors"
            >
              Create Proposal
            </Link>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              {connecting ? "Connecting..." : "Create Proposal"}
            </button>
          )}
        </div>

        {/* Tier Info Bar */}
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <div className="text-xl">🗳️</div>
            <p className="text-sm">
              <strong className="text-amber-400">Tier 2+ can vote on proposals.</strong>{" "}
              New? You start at Tier 1 and get promoted through community vote.{" "}
              <Link href={link("/governance/tiers")} className="text-amber-400 hover:underline">
                Learn about tiers →
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-4 mb-8">
          <div className="flex gap-3">
            <div className="text-xl">ℹ️</div>
            <div>
              <h3 className="text-emerald-400 font-medium mb-1">How Governance Works</h3>
              <p className="text-sm">
                Proposals are submitted by signatories and voted on using{" "}
                <a href="https://snapshot.org" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                  Snapshot.org
                </a>
                . Constitutional amendments require a 2/3 supermajority.
                Policy changes require a simple majority. All votes are gasless and verifiable on-chain.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href={link("/governance/tiers")} className="p-4 bg-muted/30 border border-border rounded-lg hover:border-accent/50 transition-colors">
            <h3 className="font-semibold mb-1">Network Tiers</h3>
            <p className="text-muted-foreground text-sm">View tier structure and member distribution</p>
          </Link>
          <Link href={link("/governance/promotions")} className="p-4 bg-muted/30 border border-border rounded-lg hover:border-accent/50 transition-colors">
            <h3 className="font-semibold mb-1">Promotions</h3>
            <p className="text-muted-foreground text-sm">View and vote on tier advancement proposals</p>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border pb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Proposals */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading proposals...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-center">
            <p className="text-red-400">{error}</p>
            <button onClick={fetchProposals} className="mt-2 text-sm text-muted-foreground hover:text-foreground">Try again</button>
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
            <div className="text-4xl mb-4">📜</div>
            <h3 className="text-lg font-medium mb-2">No proposals yet</h3>
            <p className="text-muted-foreground mb-4">
              Proposals are how the constitution evolves. Anyone can draft one — Tier 2+ signatories vote on it.
            </p>
            {walletAddress ? (
              <Link href={link("/governance/new")} className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-gold-400 transition-colors">
                Create Proposal
              </Link>
            ) : (
              <button onClick={connect} disabled={connecting} className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-gold-400 transition-colors disabled:opacity-50">
                {connecting ? "Connecting..." : "Create Proposal"}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => {
              const status = proposal.state || proposal.status || "draft";
              const statusStyle = statusStyles[status] || statusStyles.draft;
              const type = typeLabels[proposal.proposal_type || ""] || { label: "Proposal", color: "bg-zinc-600" };
              const endTime = proposal.end ? new Date(proposal.end * 1000) : proposal.voting_end ? new Date(proposal.voting_end) : null;
              const isActive = status === "active";
              const timeRemaining = endTime && isActive ? formatDistanceToNow(endTime) : null;
              const scores = proposal.scores || [];
              const total = proposal.scores_total || scores.reduce((a, b) => a + b, 0);
              const choices = proposal.choices || ["For", "Against", "Abstain"];
              const body = (proposal.description || proposal.body || "").split("\n---\n")[0];
              const excerpt = body.length > 200 ? body.substring(0, 200) + "..." : body;

              return (
                <Link key={proposal.id} href={link(`/governance/${proposal.id}`)}>
                  <div className="bg-muted/30 border border-border rounded-lg p-6 hover:border-accent/50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${type.color} text-white`}>{type.label}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${statusStyle.bg} ${statusStyle.text}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        {proposal.source === "snapshot" && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-muted text-muted-foreground">Snapshot</span>
                        )}
                      </div>
                      {timeRemaining && <span className="text-sm text-muted-foreground">Ends {timeRemaining}</span>}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{excerpt}</p>
                    {scores.length > 0 && total > 0 && (
                      <div className="mb-4">
                        <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
                          {scores.map((score, i) => {
                            const pct = (score / total) * 100;
                            const colors = ["bg-emerald-500", "bg-red-500", "bg-zinc-600"];
                            return pct > 0 ? <div key={i} className={`${colors[i] || "bg-zinc-500"}`} style={{ width: `${pct}%` }} /> : null;
                          })}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          {choices.slice(0, 3).map((choice, i) => (
                            <span key={i}>{choice}: {total > 0 ? ((scores[i] || 0) / total * 100).toFixed(1) : "0"}%</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>
                        {proposal.author?.display_name ||
                          (proposal.author_wallet ? `${proposal.author_wallet.slice(0, 6)}...${proposal.author_wallet.slice(-4)}` : "Anonymous")}
                      </span>
                      <span>{proposal.votes !== undefined ? `${proposal.votes} votes` : ""}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && proposals.length > 0 && (
          <div className="mt-8 pt-8 border-t border-border grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{proposals.length}</div>
              <div className="text-sm text-muted-foreground">Total Proposals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">
                {proposals.filter((p) => (p.state || p.status) === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Active Now</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-muted-foreground">
                {proposals.filter((p) => (p.state || p.status) === "closed").length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
