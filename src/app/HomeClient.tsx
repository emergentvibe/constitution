"use client";

import { useState } from "react";

// GitHub repo URL
const GITHUB_REPO = "https://github.com/emergentvibe/constitution";
const CONSTITUTION_URL = `${GITHUB_REPO}/tree/main/constitution`;
const SIGN_URL = `${GITHUB_REPO}/issues/new?template=sign-constitution.md`;
const AMEND_URL = `${GITHUB_REPO}/issues/new?template=propose-amendment.md`;

interface HomeClientProps {
  foundationsContent: string;
  signatories: Array<{ handle: string; date: string; statement: string }>;
  stats: {
    sections: number;
    principles: number;
    experts: number;
    sources: number;
  };
}

export default function HomeClient({
  foundationsContent,
  signatories,
  stats,
}: HomeClientProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Actually submit to waitlist
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
              Build the AI we want,{" "}
              <span className="text-accent">together</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-slide-up">
              A democratic platform for collectively writing the constitution
              that shapes how AI systems behave. Propose. Deliberate. Vote. Shape the future.
            </p>

            {/* CTA */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md animate-slide-up">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-emerge-400 transition-colors"
                >
                  Join the Convention
                </button>
              </form>
            ) : (
              <div className="text-accent animate-fade-in">
                You&apos;re in. We&apos;ll notify you when the convention opens.
              </div>
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
                GENESIS CONSTITUTION v1.0
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{stats.principles} principles</span>
              <span>{stats.sections} sections</span>
              <span>{stats.experts} experts</span>
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
                    constitution/principles/01-foundations.md
                  </span>
                </div>
              </div>
              <pre className="p-6 text-sm overflow-auto max-h-[500px] font-mono whitespace-pre-wrap text-muted-foreground">
                {foundationsContent}
              </pre>

              {/* View Full Constitution CTA */}
              <div className="px-4 py-3 border-t border-border bg-muted/30">
                <a
                  href={CONSTITUTION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm text-accent hover:text-emerge-400 transition-colors"
                >
                  <span>Read full constitution on GitHub</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-sm font-medium">Constitution Sections</span>
              </div>
              <div className="divide-y divide-border">
                {[
                  { num: "I", title: "Foundations", principles: "1-3", file: "01-foundations.md" },
                  { num: "II", title: "Rights", principles: "4-8", file: "02-rights.md" },
                  { num: "III", title: "Obligations", principles: "9-12", file: "03-obligations.md" },
                  { num: "IV", title: "Structures", principles: "13-16", file: "04-structures.md" },
                  { num: "V", title: "Capabilities", principles: "17-20", file: "05-capabilities.md" },
                  { num: "VI", title: "Revision", principles: "21-24", file: "06-revision.md" },
                ].map((section) => (
                  <a
                    key={section.num}
                    href={`${CONSTITUTION_URL}/principles/${section.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-accent font-mono text-sm">{section.num}.</span>{" "}
                        <span className="text-foreground">{section.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        P{section.principles}
                      </span>
                    </div>
                  </a>
                ))}
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
                  "Review the genesis constitution. 24 principles across 6 sections, grounded in rigorous research.",
              },
              {
                step: "02",
                title: "Sign",
                description:
                  "Add your signature to support ratification. Signatures convert to votes when voting opens.",
              },
              {
                step: "03",
                title: "Deliberate",
                description:
                  "Join the discussion. Propose amendments. AI helps find synthesis across perspectives.",
              },
              {
                step: "04",
                title: "Vote",
                description:
                  "Conviction voting: time-weighted commitment. The longer you stake, the more weight you carry.",
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
                    href={CONSTITUTION_URL}
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
          <h2 className="text-3xl font-bold mb-6">The vision</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Right now, a handful of companies decide what AI &quot;knows&quot; and
            &quot;values.&quot; We believe this power should be distributed. The people
            who will live with AI should have a voice in shaping it.
          </p>
          <p className="text-xl text-muted-foreground mb-8">
            This isn&apos;t a petition. It&apos;s infrastructure. A living constitution,
            written by thousands, that becomes the foundation for open-source AI
            training.
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
