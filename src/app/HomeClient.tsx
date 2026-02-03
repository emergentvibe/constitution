"use client";

import { useState } from "react";

// GitHub repo URL
const GITHUB_REPO = "https://github.com/emergentvibe/constitution";
const SIGN_URL = `${GITHUB_REPO}/issues/new?template=sign-constitution.md`;
const AMEND_URL = `${GITHUB_REPO}/issues/new?template=propose-amendment.md`;

interface HomeClientProps {
  constitutionContent: string;
  signatories: Array<{ handle: string; type: string; date: string; statement: string }>;
  stats: {
    sections: number;
    principles: number;
    experts: number;
    sources: number;
  };
}

export default function HomeClient({
  constitutionContent,
  signatories,
  stats,
}: HomeClientProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
              A coordination mechanism for{" "}
              <span className="text-accent">human-AI futures</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-slide-up">
              24 principles for democratic AI governance. A civil society contribution to the global conversation—not universal law, but a Schelling point for those who share these values.
            </p>

            {/* CTA */}
            {status === "success" ? (
              <div className="text-accent animate-fade-in">
                You&apos;re in. We&apos;ll notify you when the convention opens.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md animate-slide-up">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
                  required
                  disabled={status === "loading"}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-6 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-emerge-400 transition-colors disabled:opacity-50"
                >
                  {status === "loading" ? "..." : "Join the Convention"}
                </button>
              </form>
            )}
            {status === "error" && (
              <p className="text-red-400 text-sm mt-2">Something went wrong. Try again.</p>
            )}
          </div>
        </div>
      </section>

      {/* Constitution Preview */}
      <section className="px-6 py-16 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground font-mono">
                CONSTITUTION v1.2-draft
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{stats.principles} principles</span>
              <span>{stats.sections} sections</span>
              <span>{stats.sources} sources</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Constitution Document */}
            <div className="md:col-span-2 bg-background border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  <span className="ml-2 text-sm text-muted-foreground font-mono">
                    CONSTITUTION.md
                  </span>
                </div>
              </div>
              <pre className="p-6 text-sm overflow-auto max-h-[600px] font-mono whitespace-pre-wrap text-muted-foreground">
                {constitutionContent}
              </pre>

              {/* View Full Constitution CTA */}
              <div className="px-4 py-3 border-t border-border bg-muted/30">
                <a
                  href={`${GITHUB_REPO}/blob/main/CONSTITUTION.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm text-accent hover:text-emerge-400 transition-colors"
                >
                  <span>View on GitHub</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Document Map */}
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-sm font-medium">Document Map</span>
              </div>
              <div className="divide-y divide-border text-sm">
                {/* Overview */}
                <div className="px-4 py-2 bg-muted/30">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Overview</span>
                </div>
                {[
                  { title: "Preamble", anchor: "preamble" },
                  { title: "Scope and Status", anchor: "scope-and-status" },
                ].map((item) => (
                  <a
                    key={item.anchor}
                    href={`${GITHUB_REPO}/blob/main/CONSTITUTION.md#${item.anchor}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-foreground">{item.title}</span>
                  </a>
                ))}

                {/* Principles */}
                <div className="px-4 py-2 bg-muted/30">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Principles</span>
                </div>
                {[
                  { num: "I", title: "Foundations", principles: "1-3", anchor: "i-foundations" },
                  { num: "II", title: "Rights", principles: "4-8", anchor: "ii-rights" },
                  { num: "III", title: "Obligations", principles: "9-12", anchor: "iii-obligations" },
                  { num: "IV", title: "Structures", principles: "13-16", anchor: "iv-structures" },
                  { num: "V", title: "Capabilities", principles: "17-20", anchor: "v-capabilities" },
                  { num: "VI", title: "Revision", principles: "21-24", anchor: "vi-revision" },
                ].map((section) => (
                  <a
                    key={section.num}
                    href={`${GITHUB_REPO}/blob/main/CONSTITUTION.md#${section.anchor}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-accent font-mono text-xs">{section.num}.</span>{" "}
                        <span className="text-foreground">{section.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        P{section.principles}
                      </span>
                    </div>
                  </a>
                ))}

                {/* Governance */}
                <div className="px-4 py-2 bg-muted/30">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Governance</span>
                </div>
                {[
                  { title: "Amendment Process", anchor: "amendment-process" },
                  { title: "Implementation Paths", anchor: "implementation-paths" },
                  { title: "Why Sign?", anchor: "why-sign" },
                  { title: "Signatories", anchor: "signatories" },
                ].map((item) => (
                  <a
                    key={item.anchor}
                    href={`${GITHUB_REPO}/blob/main/CONSTITUTION.md#${item.anchor}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-foreground">{item.title}</span>
                  </a>
                ))}

                {/* Reference */}
                <div className="px-4 py-2 bg-muted/30">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Reference</span>
                </div>
                <a
                  href={`${GITHUB_REPO}/blob/main/CONSTITUTION.md#research-grounding`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-foreground">Research Grounding</span>
                </a>
                <a
                  href={`${GITHUB_REPO}/tree/main/appendix`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Appendix</span>
                    <span className="text-xs text-muted-foreground">→</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">How it works</h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Read",
                description:
                  "Review the constitution. 24 principles across 6 sections, grounded in 75+ academic sources.",
              },
              {
                step: "02",
                title: "Deliberate",
                description:
                  "Anyone can participate in discussion and propose ideas. This is Tier 1—open to all.",
              },
              {
                step: "03",
                title: "Sign",
                description:
                  "Individuals or organizations can sign. Organizational signatories gain voting rights (Tier 2).",
              },
              {
                step: "04",
                title: "Govern",
                description:
                  "Signatories shape amendments and enforcement. The constitution evolves through democratic process.",
              },
            ].map((item) => (
              <div key={item.step}>
                <div className="text-accent font-mono text-sm mb-2">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signatories */}
      <section className="px-6 py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Signatories</h2>
              <p className="text-muted-foreground">
                Those who have signed the genesis constitution
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-accent">{signatories.length}</div>
              <div className="text-sm text-muted-foreground">signed</div>
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <div className="divide-y divide-border">
              {signatories.map((sig, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <span className="text-accent font-mono">{sig.handle}</span>
                    <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {sig.type}
                    </span>
                    {sig.statement && (
                      <p className="text-sm text-muted-foreground mt-1 italic">
                        &ldquo;{sig.statement}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {sig.date}
                  </div>
                </div>
              ))}
            </div>

            {/* Sign CTA */}
            <div className="px-6 py-4 bg-muted/50 border-t border-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Read the constitution and add your signature
                </p>
                <div className="flex gap-3">
                  <a
                    href={`${GITHUB_REPO}/blob/main/CONSTITUTION.md`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    Read First
                  </a>
                  <a
                    href={SIGN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-emerge-400 transition-colors"
                  >
                    Sign the Constitution
                  </a>
                  <a
                    href={AMEND_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    Propose Edit
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Vision */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">What this is</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Right now, a handful of companies decide how AI develops.
            We believe civil society should have a voice—not the only voice,
            but a voice alongside governments, corporations, and international bodies.
          </p>
          <p className="text-xl text-muted-foreground mb-8">
            This constitution is one framework among possible many. We acknowledge
            our Western origins and welcome alternatives from different traditions.
            We seek interoperability with other governance efforts, not supremacy.
          </p>
          <p className="text-xl text-muted-foreground mb-8">
            We&apos;re running an experiment in coordination, not implementing a
            proven solution. The constitution is designed to evolve—if we&apos;re
            wrong about something, we can amend it.
          </p>
          <p className="text-lg text-accent font-medium">
            Collective intelligence, building collective intelligence.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-muted-foreground text-sm">
            Emergent Vibe
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href={GITHUB_REPO} className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="https://twitter.com/emergentvibe" className="hover:text-foreground transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
