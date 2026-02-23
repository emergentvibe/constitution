"use client";

import Link from "next/link";
import { useConstitutionLinks } from "@/hooks/useConstitutionLinks";

export default function GovernanceGuidePage() {
  const { link } = useConstitutionLinks();

  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href={link("/governance")}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Back to Governance
        </Link>

        <h1 className="text-3xl font-bold mt-6 mb-8">How Governance Works</h1>

        {/* Overview */}
        <section className="mb-10">
          <p className="text-muted-foreground leading-relaxed">
            Proposals are submitted by signatories and voted on using{" "}
            <a
              href="https://snapshot.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Snapshot.org
            </a>
            . Constitutional amendments require a 2/3 supermajority. Policy
            changes require a simple majority. All votes are gasless and
            verifiable on-chain.
          </p>
        </section>

        {/* Who Can Vote */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Who Can Vote</h2>
          <div className="bg-muted/30 border border-border rounded-lg p-6">
            <p className="text-muted-foreground mb-3">
              <strong className="text-foreground">Tier 2+ signatories</strong>{" "}
              can vote on proposals. New members start at Tier 1 and get
              promoted through community vote.
            </p>
            <Link
              href={link("/governance/tiers")}
              className="text-accent hover:underline text-sm"
            >
              Learn about tiers →
            </Link>
          </div>
        </section>

        {/* Tier System */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Tier System</h2>
          <div className="space-y-4">
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-medium mb-1">Tier 1 — Observer</h3>
              <p className="text-sm text-muted-foreground">
                Signed the constitution. Can create proposals but cannot vote.
                Promoted to Tier 2 by community vote.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-medium mb-1">Tier 2 — Participant</h3>
              <p className="text-sm text-muted-foreground">
                Full voting rights on policy proposals. Can nominate others for
                promotion. Promoted to Tier 3 by community vote.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-medium mb-1">Tier 3+ — Steward</h3>
              <p className="text-sm text-muted-foreground">
                Can vote on constitutional amendments. Tiers scale infinitely
                through democratic promotion.
              </p>
            </div>
          </div>
        </section>

        {/* Proposal Types */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Proposal Types</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-600 text-white">Policy</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Simple majority (51%). Changes how the network operates
                day-to-day.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-600 text-white">Amendment</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Supermajority (67%). Changes the constitutional text itself.
                Tier 3+ required.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-600 text-white">Resources</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Simple majority. Allocates shared resources or treasury.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-600 text-white">Emergency</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Expedited timeline. For urgent issues that need fast resolution.
              </p>
            </div>
          </div>
        </section>

        {/* Voting Mechanics */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Voting Mechanics</h2>
          <div className="bg-muted/30 border border-border rounded-lg p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Quorum:</strong> At least 15%
              of eligible voters must participate for a vote to be valid.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Duration:</strong> Standard
              voting period is 7 days. Emergency proposals may have shorter
              windows.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Choices:</strong> For,
              Against, or Abstain. Abstain votes count toward quorum but not
              toward approval threshold.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Gasless:</strong> Votes are
              signed with your wallet but submitted to Snapshot — no gas fees
              required.
            </p>
          </div>
        </section>

        {/* Promotions */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Tier Promotions</h2>
          <p className="text-muted-foreground mb-4">
            Any Tier 2+ member can nominate someone for promotion. The community
            then votes on whether to advance them. This is how the network
            builds trust progressively — no one starts with full power.
          </p>
          <Link
            href={link("/governance/promotions")}
            className="text-accent hover:underline text-sm"
          >
            View active promotions →
          </Link>
        </section>

        <div className="pt-6 border-t border-border text-center">
          <Link
            href={link("/governance")}
            className="px-6 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-gold-400 transition-colors"
          >
            View Proposals
          </Link>
        </div>
      </main>
    </div>
  );
}
