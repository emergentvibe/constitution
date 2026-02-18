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

// Teal color for icons
const TEAL = "#4ECDC4";

// Concept box data - aligned with Constitution sections
const concepts = [
  {
    id: "collective",
    title: "Collective Governance",
    subtitle: "Democratic oversight",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke={TEAL} strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="2.5" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
        <circle cx="8" cy="19" r="2" />
        <circle cx="16" cy="19" r="2" />
        <path d="M12 7.5v2M8 12l2.5 1M16 12l-2.5 1M9.5 17l1-1.5M14.5 17l-1-1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "federated",
    title: "Federated Structure",
    subtitle: "Layered scales",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke={TEAL} strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="12" cy="4" r="2.5" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
        <circle cx="3" cy="20" r="1.5" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="15" cy="20" r="1.5" />
        <circle cx="21" cy="20" r="1.5" />
        <path d="M12 6.5v3.5M8 12v6M16 12v6M6 14v4.5M18 14v4.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "transparency",
    title: "Transparency",
    subtitle: "Right to understand",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke={TEAL} strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      </svg>
    ),
  },
  {
    id: "exit",
    title: "Exit Rights",
    subtitle: "Right to opt out",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke={TEAL} strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "mycelial",
    title: "Mycelial Design",
    subtitle: "AI as infrastructure",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke={TEAL} strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="2" />
        <circle cx="6" cy="6" r="1.5" />
        <circle cx="18" cy="6" r="1.5" />
        <circle cx="4" cy="14" r="1.5" />
        <circle cx="20" cy="14" r="1.5" />
        <circle cx="8" cy="20" r="1.5" />
        <circle cx="16" cy="20" r="1.5" />
        <path d="M7.5 7l3 3.5M16.5 7l-3 3.5M5.5 14l5 -1M18.5 14l-5 -1M9 18.5l2-5M15 18.5l-2-5" strokeLinecap="round" />
      </svg>
    ),
  },
];

// Decorative scattered elements
function ScatteredDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Golden triangles */}
      <svg className="absolute top-[15%] left-[8%] w-4 h-4 text-gold-400 opacity-60" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L22 20H2L12 2z" />
      </svg>
      <svg className="absolute top-[25%] right-[15%] w-3 h-3 text-gold-400 opacity-40 rotate-45" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L22 20H2L12 2z" />
      </svg>
      <svg className="absolute bottom-[30%] left-[20%] w-5 h-5 text-gold-400 opacity-50 -rotate-12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L22 20H2L12 2z" />
      </svg>
      <svg className="absolute top-[40%] right-[8%] w-3 h-3 text-gold-400 opacity-40 rotate-180" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L22 20H2L12 2z" />
      </svg>
      <svg className="absolute bottom-[20%] right-[25%] w-4 h-4 text-gold-400 opacity-50 rotate-90" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L22 20H2L12 2z" />
      </svg>
      
      {/* Teal magnifying glasses */}
      <svg className="absolute top-[35%] left-[5%] w-6 h-6 opacity-40" fill="none" stroke={TEAL} strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="10" cy="10" r="6" />
        <path d="M14.5 14.5L20 20" strokeLinecap="round" />
      </svg>
      <svg className="absolute bottom-[40%] left-[12%] w-5 h-5 opacity-30" fill="none" stroke={TEAL} strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="10" cy="10" r="6" />
        <path d="M14.5 14.5L20 20" strokeLinecap="round" />
      </svg>
      <svg className="absolute top-[20%] right-[30%] w-4 h-4 opacity-25" fill="none" stroke={TEAL} strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="10" cy="10" r="6" />
        <path d="M14.5 14.5L20 20" strokeLinecap="round" />
      </svg>
      
      {/* Small circles/dots */}
      <div className="absolute top-[12%] left-[35%] w-2 h-2 rounded-full bg-gold-400 opacity-40" />
      <div className="absolute top-[45%] right-[12%] w-1.5 h-1.5 rounded-full bg-teal-400 opacity-30" />
      <div className="absolute bottom-[35%] right-[18%] w-2 h-2 rounded-full bg-gold-400 opacity-35" />
      <div className="absolute bottom-[15%] left-[40%] w-1.5 h-1.5 rounded-full bg-teal-400 opacity-25" />
    </div>
  );
}

export default function HomeClient({ signatories, stats }: HomeClientProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Vignette background */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, #FAF7F2 0%, #F5F0E8 50%, #EDE6DA 100%)"
        }}
      />

      {/* Network Animation Background */}
      <div className="absolute inset-0">
        <NetworkHero />
      </div>

      {/* Scattered decorative elements */}
      <ScatteredDecorations />

      {/* Main Layout */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section - Full viewport */}
        <section className="flex-1 relative flex items-center justify-center p-4 md:p-8 min-h-screen">
          {/* Concept Boxes - Asymmetric positioning */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top Left - Federated Governance */}
            <div className="absolute top-[12%] left-[6%] md:left-[10%] pointer-events-auto">
              <ConceptBox concept={concepts[0]} />
            </div>

            {/* Left Middle - Collective Governance */}
            <div className="absolute top-[45%] left-[4%] md:left-[8%] pointer-events-auto hidden md:block">
              <ConceptBox concept={concepts[1]} />
            </div>

            {/* Top Right - Transparency */}
            <div className="absolute top-[15%] right-[8%] md:right-[12%] pointer-events-auto">
              <ConceptBox concept={concepts[2]} />
            </div>

            {/* Right Middle - Rights & Obligations */}
            <div className="absolute top-[50%] right-[5%] md:right-[10%] pointer-events-auto hidden lg:block">
              <ConceptBox concept={concepts[3]} />
            </div>

            {/* Bottom Right - Hybrid Expertise */}
            <div className="absolute bottom-[18%] right-[12%] md:right-[18%] pointer-events-auto hidden md:block">
              <ConceptBox concept={concepts[4]} />
            </div>

            {/* Bottom Left - Tagline */}
            <div className="absolute bottom-[22%] left-[6%] md:left-[12%] pointer-events-auto hidden lg:block">
              <div className="bg-white/50 backdrop-blur-md rounded-2xl px-5 py-4 max-w-[200px] shadow-sm">
                <p className="text-sm text-stone-600 leading-relaxed">
                  AI as coordination mycelium — distributed infrastructure for collective intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Central Panel with blur effect */}
          <div className="relative max-w-2xl mx-auto">
            {/* Soft glow behind panel */}
            <div 
              className="absolute inset-0 -m-8 rounded-3xl opacity-60"
              style={{
                background: "radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, transparent 70%)",
                filter: "blur(20px)"
              }}
            />
            
            {/* Frosted glass panel */}
            <div className="relative bg-white/60 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-sm">
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
                  className="px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-medium rounded-xl hover:from-gold-600 hover:to-gold-700 transition-all text-center shadow-md"
                >
                  Read the Constitution
                </a>
                <a
                  href={GITHUB_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white/80 border border-stone-200 text-stone-700 font-medium rounded-xl hover:bg-white transition-colors text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View on GitHub
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

        {/* Stats Bar - Bottom of hero */}
        <div className="relative z-20 bg-white/40 backdrop-blur-sm border-t border-gold-200/30">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-center gap-6 md:gap-12 text-sm flex-wrap">
              <div className="text-center">
                <span className="font-semibold text-stone-700">{stats.principles} principles</span>
              </div>
              <div className="w-px h-4 bg-stone-300 hidden sm:block" />
              <div className="text-center">
                <span className="text-stone-600">AI as coordination mycelium</span>
              </div>
              <div className="w-px h-4 bg-stone-300 hidden sm:block" />
              <div className="text-center">
                <span className="font-semibold text-stone-700">{stats.sources}+ sources</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section - Below the fold */}
      <div id="about" className="bg-background relative z-20">
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
                  className="relative p-4 rounded-xl border border-border bg-background overflow-hidden"
                >
                  {/* Gold/teal accent line */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{
                      background: i % 2 === 0 ? '#C9A227' : TEAL,
                      opacity: 0.6,
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

            <div className="bg-background border border-border rounded-xl overflow-hidden">
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
                      className="px-3 py-1.5 border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                    >
                      Read
                    </a>
                    <a
                      href={SIGN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors"
                    >
                      Sign via GitHub
                    </a>
                    <a
                      href={AMEND_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors"
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

// Concept Box Component - More rounded, translucent, no border
function ConceptBox({ concept }: { concept: typeof concepts[0] }) {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center gap-2 min-w-[120px] max-w-[140px] hover:bg-white/70 transition-all cursor-default shadow-sm">
      <div>
        {concept.icon}
      </div>
      <div className="text-center">
        <span className="text-xs md:text-sm font-medium text-stone-700 leading-tight block">
          {concept.title}
        </span>
        {concept.subtitle && (
          <span className="text-[10px] text-stone-500 leading-tight">
            {concept.subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
