"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useConstitutionLinks } from "@/hooks/useConstitutionLinks";
import { useAuth } from "@/hooks/useAuth";

interface Member {
  id: string;
  name: string;
  wallet_address: string;
  registered_at: string;
}

interface Tier {
  level: number;
  name: string | null;
  member_count: number;
}

function NewPromotionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTier = searchParams.get("from_tier");
  const { link, apiUrl } = useConstitutionLinks();
  const { walletAddress, connect } = useAuth();

  const [tiers, setTiers] = useState<Tier[]>([]);
  const [selectedTier, setSelectedTier] = useState<number | null>(initialTier ? parseInt(initialTier) : null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedNominees, setSelectedNominees] = useState<string[]>([]);
  const [rationale, setRationale] = useState("");
  const [proposerId, setProposerId] = useState("");
  const [proposerName, setProposerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTiers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (walletAddress) {
      fetch(apiUrl(`/api/symbiont-hub/agents/${walletAddress}`))
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setProposerId(data.id);
            setProposerName(data.name);
          }
        })
        .catch(() => {});
    } else {
      setProposerId("");
      setProposerName(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  useEffect(() => {
    if (selectedTier) fetchMembers(selectedTier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTier]);

  async function fetchTiers() {
    try {
      const res = await fetch(apiUrl("/api/tiers"));
      const data = await res.json();
      setTiers(data.tiers.filter((t: Tier) => t.member_count > 0));
    } catch {
      setError("Failed to load tiers");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMembers(tier: number) {
    try {
      const res = await fetch(apiUrl(`/api/tiers/${tier}`));
      const data = await res.json();
      setMembers(data.members);
      setSelectedNominees([]);
    } catch {
      setError("Failed to load members");
    }
  }

  function toggleNominee(id: string) {
    setSelectedNominees((prev) => prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!proposerId) { setError("Please enter your agent ID"); return; }
    if (selectedNominees.length === 0) { setError("Please select at least one nominee"); return; }
    if (selectedNominees.includes(proposerId)) { setError("You cannot nominate yourself"); return; }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(apiUrl("/api/promotions"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposer_id: proposerId, nominees: selectedNominees, rationale: rationale || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create promotion");
      router.push(link(`/governance/promotions/${data.promotion.id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create promotion");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <Link href={link("/governance/promotions")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Cancel</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-8">
        <h1 className="text-2xl font-bold mb-2">Propose Promotion</h1>
        <p className="text-muted-foreground mb-8">Select members from your tier to promote to the tier above.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Proposer</label>
            {!walletAddress ? (
              <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
                <p className="text-muted-foreground mb-2">Connect your wallet to propose a promotion.</p>
                <button type="button" onClick={connect} className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors">
                  Connect Wallet
                </button>
              </div>
            ) : !proposerId ? (
              <div className="p-4 rounded-lg border border-border bg-muted/20">
                <p className="text-muted-foreground">No registered agent found for this wallet. You must be a signatory to propose.</p>
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-accent/30 bg-accent/5">
                <span className="text-sm">Proposing as <span className="font-medium">{proposerName || proposerId}</span></span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">You must be a member of the tier you&apos;re proposing from</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">From Tier *</label>
            <div className="grid grid-cols-3 gap-3">
              {tiers.map((tier) => (
                <button key={tier.level} type="button" onClick={() => setSelectedTier(tier.level)}
                  className={`p-4 rounded-lg border text-left transition-colors ${selectedTier === tier.level ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"}`}>
                  <div className="font-semibold">Tier {tier.level}</div>
                  <div className="text-sm text-muted-foreground">{tier.member_count} members</div>
                </button>
              ))}
            </div>
          </div>

          {selectedTier && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Nominees for Tier {selectedTier + 1} *</label>
              {members.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground border border-dashed border-border rounded-lg">No members in this tier</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded-lg p-2">
                  {members.map((member) => (
                    <label key={member.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedNominees.includes(member.id) ? "bg-accent/20" : "hover:bg-muted"}`}>
                      <input type="checkbox" checked={selectedNominees.includes(member.id)} onChange={() => toggleNominee(member.id)} className="w-4 h-4" />
                      <div className="flex-1">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{member.wallet_address.slice(0, 10)}...</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{selectedNominees.length} selected</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Rationale (optional)</label>
            <textarea value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="Why should these members be promoted?"
              className="w-full p-3 rounded-lg border border-border bg-background resize-none" rows={4} />
          </div>

          {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600">{error}</div>}

          <div className="flex gap-3">
            <Link href={link("/governance/promotions")} className="flex-1 px-4 py-3 text-center border border-border rounded-lg hover:bg-muted transition-colors">Cancel</Link>
            <button type="submit" disabled={submitting || selectedNominees.length === 0}
              className="flex-1 px-4 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50">
              {submitting ? "Creating..." : "Create Proposal"}
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 rounded-lg border border-border bg-muted/20">
          <h3 className="font-semibold mb-2">How Promotion Voting Works</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Only members of the same tier can vote</li>
            <li>• Nominees cannot vote on their own promotion</li>
            <li>• 67% approval required to pass</li>
            <li>• Voting period is 7 days</li>
            <li>• Failed nominees have 30-day cooldown</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function NewPromotionPageScoped() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NewPromotionForm />
    </Suspense>
  );
}
