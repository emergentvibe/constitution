"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useConstitutionLinks } from "@/hooks/useConstitutionLinks";
import { useConstitution } from "@/contexts/ConstitutionContext";
import {
  SNAPSHOT_DOMAIN,
  createProposalPayload,
  submitProposal,
  getCurrentBlock,
  getVotingPeriod,
  ProposalType as SnapshotProposalType,
} from "@/lib/snapshot";

type ProposalType =
  | "constitutional_amendment"
  | "boundary_change"
  | "policy_proposal"
  | "resource_allocation"
  | "emergency_action";

const proposalTypes: { value: ProposalType; label: string; description: string; threshold: string }[] = [
  { value: "policy_proposal", label: "Policy Proposal", description: "Propose new policies or guidelines for the community", threshold: "Simple majority (51%)" },
  { value: "constitutional_amendment", label: "Constitutional Amendment", description: "Propose changes to the core constitution", threshold: "Supermajority (67%)" },
  { value: "boundary_change", label: "Boundary Change", description: "Changes to territory, membership criteria, or jurisdiction", threshold: "Supermajority (67%)" },
  { value: "resource_allocation", label: "Resource Allocation", description: "Budget and resource decisions", threshold: "Simple majority (51%)" },
  { value: "emergency_action", label: "Emergency Action", description: "Time-sensitive proposals requiring expedited voting", threshold: "Supermajority (67%), 3-day vote" },
];

export default function NewProposalPageScoped() {
  const router = useRouter();
  const { walletAddress, connect, connecting, signTypedData } = useAuth();
  const { link, apiUrl } = useConstitutionLinks();
  const constitution = useConstitution();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProposalType>("policy_proposal");
  const [category, setCategory] = useState("");
  const [impactAssessment, setImpactAssessment] = useState("");
  const [amendmentText, setAmendmentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittingSnapshot, setSubmittingSnapshot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<number | null>(null);

  useEffect(() => {
    if (!walletAddress) { setUserTier(null); return; }
    fetch(apiUrl("/api/symbiont-hub/agents", { wallet: walletAddress }))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const agents = data?.agents || [];
        const match = agents.find(
          (a: { wallet_address?: string; operator_address?: string }) =>
            a.wallet_address?.toLowerCase() === walletAddress.toLowerCase() ||
            a.operator_address?.toLowerCase() === walletAddress.toLowerCase()
        );
        setUserTier(match?.tier ?? null);
      })
      .catch(() => setUserTier(null));
  }, [walletAddress, apiUrl]);

  const isAmendment = type === "constitutional_amendment" || type === "boundary_change";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!walletAddress) { await connect(); return; }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(apiUrl("/api/governance/proposals"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          category,
          impact_assessment: impactAssessment,
          amendment_text: isAmendment ? amendmentText : undefined,
          author_wallet: walletAddress,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create proposal");

      setSubmitting(false);
      setSubmittingSnapshot(true);

      try {
        const currentBlock = await getCurrentBlock();
        const now = Math.floor(Date.now() / 1000);
        const votingPeriod = getVotingPeriod(type as SnapshotProposalType);
        const startTimestamp = now + 60;
        const endTimestamp = now + votingPeriod;

        const fullBody = isAmendment && amendmentText
          ? `${description}\n\n---\n\n**Proposed Amendment:**\n${amendmentText}`
          : description;

        const payload = createProposalPayload(
          walletAddress!,
          title,
          fullBody,
          type as SnapshotProposalType,
          startTimestamp,
          endTimestamp,
          currentBlock,
          constitution.snapshot_space
        );

        const signature = await signTypedData(SNAPSHOT_DOMAIN, payload.types, payload.message);

        if (signature) {
          const snapshotResult = await submitProposal(walletAddress!, signature, payload.message);
          await fetch(`/api/governance/proposals/${data.proposal.id}/link`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ snapshot_id: snapshotResult.id, author_wallet: walletAddress }),
          });
        }
      } catch (snapshotErr: any) {
        console.error("Snapshot submission failed:", snapshotErr);
      }

      router.push(link(`/governance/${data.proposal.id}`));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      setSubmittingSnapshot(false);
    }
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href={link("/governance")} className="text-muted-foreground hover:text-foreground text-sm">← Back to Governance</Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Create Proposal</h1>
          <p className="text-muted-foreground">Submit a proposal for the community to vote on.</p>
          {userTier !== null && (
            <p className="text-sm mt-2 text-muted-foreground">Your current tier: <span className="text-foreground font-medium">Tier {userTier}</span></p>
          )}
        </div>

        {!walletAddress && (
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-8">
            <p className="text-yellow-400 mb-2">Connect your wallet to create a proposal</p>
            <button onClick={connect} disabled={connecting} className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Proposal Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Proposal Type</label>
            <div className="grid gap-3">
              {proposalTypes.map((pt) => (
                <label
                  key={pt.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    type === pt.value ? "border-accent bg-accent/10" : "border-border bg-muted/30 hover:border-border/80"
                  }`}
                >
                  <input type="radio" name="type" value={pt.value} checked={type === pt.value} onChange={() => setType(pt.value)} className="mt-1" />
                  <div>
                    <div className="font-medium">{pt.label}</div>
                    <div className="text-sm text-muted-foreground">{pt.description}</div>
                    <div className="text-xs text-accent mt-1">{pt.threshold}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A clear, concise title for your proposal" required minLength={10}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-accent" />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">Category (optional)</label>
            <input id="category" type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Infrastructure, Membership, Treasury"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-accent" />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
            <p className="text-xs text-muted-foreground mb-2">Explain your proposal in detail.</p>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your proposal..." required minLength={100} rows={8}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-accent resize-y" />
            <div className="text-xs text-muted-foreground mt-1">{description.length}/100 minimum characters</div>
          </div>

          {/* Amendment Text */}
          {isAmendment && (
            <div>
              <label htmlFor="amendmentText" className="block text-sm font-medium mb-2">Proposed Amendment Text</label>
              <textarea id="amendmentText" value={amendmentText} onChange={(e) => setAmendmentText(e.target.value)} placeholder="The proposed constitutional text..." rows={6}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-accent resize-y font-mono text-sm" />
            </div>
          )}

          {/* Impact Assessment */}
          <div>
            <label htmlFor="impact" className="block text-sm font-medium mb-2">Impact Assessment (optional)</label>
            <textarea id="impact" value={impactAssessment} onChange={(e) => setImpactAssessment(e.target.value)} placeholder="Expected impact of this proposal..." rows={4}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-accent resize-y" />
          </div>

          {error && <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-red-400">{error}</div>}

          <div className="flex gap-4 pt-4">
            <Link href={link("/governance")} className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors">Cancel</Link>
            <button type="submit" disabled={submitting || !walletAddress}
              className="flex-1 bg-accent hover:bg-gold-400 disabled:bg-muted disabled:text-muted-foreground text-accent-foreground px-6 py-3 rounded-lg font-medium transition-colors">
              {submitting ? "Creating..." : submittingSnapshot ? "Submitting to Snapshot..." : "Create Draft Proposal"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
