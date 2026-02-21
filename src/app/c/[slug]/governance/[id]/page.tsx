"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { VotePanel } from "@/components/governance/VotePanel";
import { SnapshotSubmit } from "@/components/governance/SnapshotSubmit";
import { useAuth } from "@/hooks/useAuth";
import { useConstitutionLinks } from "@/hooks/useConstitutionLinks";
import { useConstitution } from "@/contexts/ConstitutionContext";

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

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface Proposal {
  id: string;
  title: string;
  description?: string;
  body?: string;
  status?: string;
  state?: string;
  proposal_type?: string;
  category?: string;
  choices?: string[];
  scores?: number[];
  scores_total?: number;
  votes?: number;
  voting_start?: string;
  voting_end?: string;
  start?: number;
  end?: number;
  snapshot_id?: string;
  amendment_text?: string;
  impact_assessment?: string;
  quorum_threshold?: number;
  approval_threshold?: number;
  author_wallet?: string;
  created_at?: string;
}

interface Outcome {
  passed: boolean;
  quorumMet: boolean;
  approvalMet: boolean;
  details: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  constitutional_amendment: { label: "Constitutional Amendment", color: "bg-purple-600" },
  boundary_change: { label: "Boundary Change", color: "bg-orange-600" },
  policy_proposal: { label: "Policy Proposal", color: "bg-blue-600" },
  resource_allocation: { label: "Resource Allocation", color: "bg-green-600" },
  emergency_action: { label: "Emergency Action", color: "bg-red-600" },
};

export default function ProposalPageScoped() {
  const params = useParams();
  const id = params.id as string;
  const { walletAddress } = useAuth();
  const { link, apiUrl } = useConstitutionLinks();
  const constitution = useConstitution();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProposal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchProposal() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl(`/api/governance/proposals/${id}`, { votes: "true" }));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch proposal");
      setProposal(data.proposal);
      setOutcome(data.outcome || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-24 mb-4" />
            <div className="h-10 bg-muted rounded w-3/4 mb-4" />
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen">
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-8 text-center">
            <h1 className="text-xl font-bold mb-2">Proposal Not Found</h1>
            <p className="text-muted-foreground mb-4">{error || "This proposal does not exist."}</p>
            <Link href={link("/governance")} className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              Back to Governance
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const status = proposal.state || proposal.status || "draft";
  const type = typeLabels[proposal.proposal_type || ""] || { label: "Proposal", color: "bg-zinc-600" };
  const isActive = status === "active";
  const isClosed = status === "closed";
  const isDraft = status === "draft";

  const startTime = proposal.start ? new Date(proposal.start * 1000) : proposal.voting_start ? new Date(proposal.voting_start) : null;
  const endTime = proposal.end ? new Date(proposal.end * 1000) : proposal.voting_end ? new Date(proposal.voting_end) : null;

  const isAuthor = walletAddress && proposal.author_wallet?.toLowerCase() === walletAddress.toLowerCase();
  const canVote = walletAddress && isActive;

  const scores = proposal.scores || [];
  const total = proposal.scores_total || scores.reduce((a, b) => a + b, 0);
  const choices = proposal.choices || ["For", "Against", "Abstain"];

  const snapshotSpace = constitution.snapshot_space;

  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href={link("/governance")} className="text-muted-foreground hover:text-foreground text-sm">
          ← Back to Governance
        </Link>

        {/* Header */}
        <div className="mt-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 text-sm font-medium rounded ${type.color} text-white`}>{type.label}</span>
            <span className={`px-3 py-1 text-sm font-medium rounded ${
              status === "active" ? "bg-emerald-900/50 text-emerald-400" :
              status === "closed" ? "bg-muted text-muted-foreground" :
              status === "draft" ? "bg-yellow-900/50 text-yellow-400" :
              "bg-muted text-muted-foreground"
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{proposal.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>By {proposal.author_wallet ? `${proposal.author_wallet.slice(0, 6)}...${proposal.author_wallet.slice(-4)}` : "Anonymous"}</span>
            {startTime && <span>Started {formatDate(startTime)}</span>}
            {endTime && isActive && <span className="text-accent">Ends {formatDistanceToNow(endTime)}</span>}
          </div>
        </div>

        {/* Draft: Submit to Snapshot */}
        {isDraft && isAuthor && (
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-8">
            <h3 className="text-yellow-400 font-medium mb-2">Draft Proposal</h3>
            <p className="text-sm mb-4">This proposal is a draft. To start voting, sign and submit it to Snapshot.</p>
            <SnapshotSubmit proposal={proposal} onSuccess={fetchProposal} />
          </div>
        )}

        {/* Voting Results */}
        {(isActive || isClosed) && scores.length > 0 && (
          <div className="bg-muted/30 border border-border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">{isClosed ? "Final Results" : "Current Results"}</h3>
            <div className="space-y-4 mb-6">
              {choices.map((choice, i) => {
                const score = scores[i] || 0;
                const percentage = total > 0 ? (score / total) * 100 : 0;
                const colors = ["bg-emerald-500", "bg-red-500", "bg-zinc-600"];
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{choice}</span>
                      <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${colors[i] || "bg-zinc-500"}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground pt-4 border-t border-border">
              <span>{proposal.votes || 0} votes</span>
              {outcome && (
                <span className={outcome.passed ? "text-emerald-400" : "text-red-400"}>
                  {outcome.passed ? "✓ Passed" : "✗ Did not pass"}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tier gate */}
        {walletAddress && isActive && !canVote && (
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 mb-8">
            <p className="text-amber-400 text-sm">
              <strong>You need Tier 2 to vote.</strong>{" "}
              <Link href={link("/governance/tiers")} className="underline hover:text-amber-300">Learn about tiers →</Link>
            </p>
          </div>
        )}

        {/* Vote Panel */}
        {canVote && (
          <VotePanel proposalId={id} snapshotId={proposal.snapshot_id} choices={choices} onVoteSuccess={fetchProposal} />
        )}

        {/* Description */}
        <div className="bg-muted/30 border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Description</h3>
          <p className="whitespace-pre-wrap">{proposal.description || proposal.body}</p>
        </div>

        {/* Amendment Text */}
        {proposal.amendment_text && (
          <div className="bg-muted/30 border border-border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Proposed Amendment</h3>
            <pre className="bg-background border border-border rounded-lg p-4 text-sm overflow-x-auto">{proposal.amendment_text}</pre>
          </div>
        )}

        {/* Thresholds */}
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Voting Thresholds</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Quorum Required</div>
              <div className="font-medium">{((proposal.quorum_threshold || 0.15) * 100).toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Approval Required</div>
              <div className="font-medium">{((proposal.approval_threshold || 0.51) * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>

        {proposal.snapshot_id && snapshotSpace && (
          <div className="mt-8 text-center">
            <a
              href={`https://snapshot.org/#/${snapshotSpace}/proposal/${proposal.snapshot_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline text-sm"
            >
              View on Snapshot →
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
