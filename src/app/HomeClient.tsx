"use client";

import NetworkHero from "@/components/NetworkHero";
import { Separator } from "@/components/Separator";

const GITHUB_REPO = "https://github.com/emergentvibe/constitution";
const SIGN_URL = `${GITHUB_REPO}/issues/new?template=sign-constitution.md`;
const AMEND_URL = `${GITHUB_REPO}/issues/new?template=propose-amendment.md`;
const DISCUSSIONS_URL = `${GITHUB_REPO}/discussions`;

interface HomeClientProps {
  signatories: Array<{ handle: string; type: string; date: string; statement: string }>;
  stats: {
    sections: number;
    principles: number;
    sources: number;
  };
}

// Concept box data
const concepts = [
  {
    id: "federated",
    title: "Federated Governance",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="3" strokeWidth={1.5} />
        <circle cx="5" cy="19" r="3" strokeWidth={1.5} />
        <circle cx="19" cy="19" r="3" strokeWidth={1.5} />
        <path strokeWidth={1.5} d="M12 8v4m-4 4l4-4m4 4l-4-4" />
      </svg>
    ),
    position: "top-left",
  },
  {
    id: "collective",
    title: "Collective Governance",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="3" strokeWidth={1.5} />
        <circle cx="6" cy="16" r="3" strokeWidth={1.5} />
        <circle cx="18" cy="16" r="3" strokeWidth={1.5} />
        <path strokeWidth={1.5} d="M9 10.5l-1.5 3M15 10.5l1.5 3M9 16h6" />
      </svg>
    ),
    position: "top-right",
  },
  {
    id: "rights",
    title: "Rights & Obligations",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    position: "right",
  },
  {
    id: "hybrid",
    title: "Hybrid Expertise",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    position: "bottom-right",
  },
  {
    id: "transparency",
    title: "Transparency",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    position: "bottom-left",
  },
];

export default function HomeClient({ signatories, stats }: HomeClientProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FAF7F2]">
      {/* Network Animation Background */}
      <div className="absolute inset-0">
        <NetworkHero />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section - Full viewport */}
        <section className="flex-1 relative flex items-center justify-center p-4 md:p-8">
          {/* Concept Boxes - Positioned around edges */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top Left - Federated Governance */}
            <div className="absolute top-8 left-8 md:top-16 md:left-16 pointer-events-auto">
              <ConceptBox concept={concepts[0]} />
            </div>

            {/* Top Right - Collective Governance */}
            <div className="absolute top-8 right-8 md:top-16 md:right-16 pointer-events-auto">
              <ConceptBox concept={concepts[1]} />
            </div>

            {/* Right - Rights & Obligations */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-12 pointer-events-auto hidden lg:block">
              <ConceptBox concept={concepts[2]} />
            </div>

            {/* Bottom Right - Hybrid Expertise */}
            <div className="absolute bottom-24 right-8 md:bottom-32 md:right-16 pointer-events-auto">
              <ConceptBox concept={concepts[3]} />
            </div>

            {/* Bottom Left - Transparency */}
            <div className="absolute bottom-24 left-8 md:bottom-32 md:left-16 pointer-events-auto">
              <ConceptBox concept={concepts[4]} />
            </div>

            {/* Left - Tagline */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-12 pointer-events-auto hidden lg:block">
              <div className="bg-white/60 backdrop-blur-sm border border-gold-200/50 rounded-lg px-4 py-3 max-w-[180px]">
                <p className="text-sm text-stone-600 leading-relaxed">
                  A coordination mechanism for human-AI futures
                </p>
              </div>
            </div>
          </div>

          {/* Central Panel */}
          <div className="relative max-w-2xl mx-auto">
            {/* Frosted glass panel */}
            <div className="bg-white/70 backdrop-blur-md border border-gold-200/50 rounded-2xl p-8 md:p-12 shadow-lg">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-4 text-stone-800">
                The Constitution for{" "}
                <span className="text-gold-600">Human-AI</span> Coordination
              </h1>
              
              <p className="text-lg md:text-xl text-stone-600 text-center mb-8">
                {stats.principles} principles for democratic AI governance
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/constitution"
                  className="px-8 py-4 bg-gold-500 text-white font-medium rounded-lg hover:bg-gold-600 transition-colors text-center shadow-md"
                >
                  Read the Constitution
                </a>
                <a
                  href={SIGN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-50 transition-colors text-center"
                >
                  Sign It
                </a>
              </div>

              {/* Scroll down button */}
              <button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-8 mx-auto flex flex-col items-center text-stone-400 hover:text-stone-600 transition-colors"
              >
                <span className="text-sm mb-2">Learn more</span>
                <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Stats Bar - Bottom */}
        <div className="relative z-20 bg-white/50 backdrop-blur-sm border-t border-gold-200/30">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-center gap-8 md:gap-16 text-sm">
              <div className="text-center">
                <span className="font-semibold text-stone-700">{stats.principles} principles</span>
              </div>
              <div className="w-px h-4 bg-stone-300" />
              <div className="text-center">
                <span className="text-stone-600">AI as coordination mycelium</span>
              </div>
              <div className="w-px h-4 bg-stone-300" />
              <div className="text-center">
                <span className="font-semibold text-stone-700">{stats.sources}+ sections</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signatories count - subtle */}
        <div className="relative z-20 bg-stone-100/80 border-t border-stone-200/50">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <span className="text-sm text-stone-500">
              {signatories.length} signatories have joined
            </span>
            <div className="flex gap-4 text-sm">
              <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700 transition-colors">
                GitHub
              </a>
              <a href="/genesis" className="text-gold-600 hover:text-gold-700 transition-colors font-medium">
                Genesis Protocol
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="bg-background">
        {/* What This Is */}
        <section className="px-6 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">What this is</h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                A civil society contribution to the global conversation—not universal law, 
                but a Schelling point for those who share these values.
              </p>
              <p>
                Right now, a handful of companies decide how AI develops.
                We believe civil society should have a voice—not the only voice,
                but a voice alongside governments, corporations, and international bodies.
              </p>
              <p>
                This constitution is one framework among possible many. We acknowledge
                our Western origins and welcome alternatives from different traditions.
                We&apos;re running an experiment in coordination, not implementing a proven solution.
              </p>
            </div>
          </div>
        </section>

        {/* Separator */}
        <div className="max-w-4xl mx-auto px-6">
          <Separator variant="gradient" />
        </div>

        {/* How It Works */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">How it works</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "Read",
                  description:
                    "24 principles across 6 sections, grounded in 75+ academic sources.",
                },
                {
                  step: "02",
                  title: "Deliberate",
                  description:
                    "Anyone can participate in discussion and propose ideas (Tier 1).",
                },
                {
                  step: "03",
                  title: "Sign",
                  description:
                    "Individuals or organizations can sign. Orgs gain voting rights (Tier 2).",
                },
                {
                  step: "04",
                  title: "Govern",
                  description:
                    "Signatories shape amendments. The constitution evolves democratically.",
                },
              ].map((item, i) => (
                <div 
                  key={item.step} 
                  className="relative p-4 rounded-lg border border-border bg-background overflow-hidden"
                >
                  {/* Gold/silver accent line */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{
                      background: i % 2 === 0 ? '#C9A227' : '#7B9BAD',
                      opacity: 0.4,
                    }}
                  />
                  <div className="text-accent font-mono text-sm mb-2">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Separator */}
        <div className="max-w-4xl mx-auto px-6">
          <Separator variant="gradient" />
        </div>

        {/* Signatories */}
        <section className="px-6 py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Signatories</h2>
                <p className="text-sm text-muted-foreground">
                  Those who have signed the constitution
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-accent">{signatories.length}</div>
                <div className="text-xs text-muted-foreground">signed</div>
              </div>
            </div>

            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="divide-y divide-border">
                {signatories.map((sig, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <span className="text-accent font-mono text-sm">{sig.handle}</span>
                      <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {sig.type}
                      </span>
                      {sig.statement && (
                        <p className="text-sm text-muted-foreground mt-1 italic">
                          &ldquo;{sig.statement}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sig.date}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sign CTA */}
              <div className="px-4 py-3 bg-muted/50 border-t border-border">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Read the constitution and add your signature
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="/constitution"
                      className="px-3 py-1.5 border border-border text-sm font-medium rounded hover:bg-muted transition-colors"
                    >
                      Read
                    </a>
                    <a
                      href={SIGN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-accent text-accent-foreground text-sm font-medium rounded hover:bg-gold-400 transition-colors"
                    >
                      Sign via GitHub
                    </a>
                    <a
                      href={AMEND_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border border-border text-sm font-medium rounded hover:bg-muted transition-colors"
                    >
                      Propose Edit
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-border">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <span className="text-accent">Collective intelligence</span>, building collective intelligence.
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                GitHub
              </a>
              <a href={DISCUSSIONS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Discussions
              </a>
              <a href="/genesis" className="hover:text-foreground transition-colors">
                Genesis Protocol
              </a>
              <a href="https://twitter.com/emergentvibe" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Twitter
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Concept Box Component
function ConceptBox({ concept }: { concept: typeof concepts[0] }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-gold-200/50 rounded-lg p-4 flex flex-col items-center gap-2 min-w-[120px] hover:bg-white/80 transition-colors cursor-default">
      <div className="text-gold-600">
        {concept.icon}
      </div>
      <span className="text-xs md:text-sm font-medium text-stone-700 text-center leading-tight">
        {concept.title}
      </span>
    </div>
  );
}
