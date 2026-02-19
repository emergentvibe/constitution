"use client";

import { useState, useEffect } from "react";
import NetworkHero from "@/components/NetworkHero";
import { Separator } from "@/components/Separator";

const GITHUB_REPO = "https://github.com/emergentvibe/constitution";

interface Signatory {
  id: string;
  name: string;
  mission?: string;
  wallet_address: string;
  operator_address?: string;
  tier: number;
  platform?: string;
  registered_at: string;
}

interface Stats {
  total: number;
  byTier: Record<string, number>;
  constitutionVersion: string;
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

// Spokes SVG component - connects center to islands (rendered inside hero section)
function Spokes() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        {/* Gradient for gold-teal spokes */}
        <linearGradient id="spoke-gradient-tl" x1="50%" y1="50%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#C9A227" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="spoke-gradient-tr" x1="50%" y1="50%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9A227" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="spoke-gradient-bl" x1="50%" y1="50%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C9A227" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="spoke-gradient-br" x1="50%" y1="50%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A227" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0.5" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="spoke-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Spokes from center to each island - matching concept box positions */}
      {/* Top Left - concept[0]: top-[12%] left-[10%] */}
      <line x1="50%" y1="50%" x2="14%" y2="16%" stroke="url(#spoke-gradient-tl)" strokeWidth="2.5" filter="url(#spoke-glow)" />
      {/* Left Middle - concept[1]: top-[45%] left-[8%] */}
      <line x1="50%" y1="50%" x2="11%" y2="48%" stroke="url(#spoke-gradient-tl)" strokeWidth="2.5" filter="url(#spoke-glow)" className="hidden md:block" />
      {/* Top Right - concept[2]: top-[15%] right-[12%] = left 88% */}
      <line x1="50%" y1="50%" x2="86%" y2="18%" stroke="url(#spoke-gradient-tr)" strokeWidth="2.5" filter="url(#spoke-glow)" />
      {/* Right Middle - concept[3]: top-[50%] right-[10%] = left 90% */}
      <line x1="50%" y1="50%" x2="88%" y2="53%" stroke="url(#spoke-gradient-tr)" strokeWidth="2.5" filter="url(#spoke-glow)" className="hidden lg:block" />
      {/* Bottom Right - concept[4]: bottom-[18%] right-[18%] = top 82%, left 82% */}
      <line x1="50%" y1="50%" x2="80%" y2="79%" stroke="url(#spoke-gradient-br)" strokeWidth="2.5" filter="url(#spoke-glow)" className="hidden md:block" />
      {/* Bottom Left - tagline: bottom-[22%] left-[12%] = top 78% */}
      <line x1="50%" y1="50%" x2="15%" y2="76%" stroke="url(#spoke-gradient-bl)" strokeWidth="2.5" filter="url(#spoke-glow)" className="hidden lg:block" />
    </svg>
  );
}

export default function HomeClient() {
  const [signatories, setSignatories] = useState<Signatory[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    byTier: {},
    constitutionVersion: "0.1.5",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRegistry() {
      try {
        const [agentsRes, statsRes] = await Promise.all([
          fetch("/api/symbiont-hub/agents"),
          fetch("/api/symbiont-hub/stats"),
        ]);

        if (agentsRes.ok && statsRes.ok) {
          const agentsData = await agentsRes.json();
          const statsData = await statsRes.json();

          setSignatories(agentsData.agents || []);
          setStats({
            total: statsData.agents?.total || 0,
            byTier: statsData.agents?.by_tier || {},
            constitutionVersion: statsData.constitution?.version || "0.1.5",
          });
        }
      } catch (error) {
        console.error("Failed to fetch registry:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRegistry();
  }, []);

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

      {/* Main Layout */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section - Full viewport */}
        <section className="flex-1 relative flex items-center justify-center p-4 md:p-8 min-h-screen">
          {/* Spokes connecting center to islands */}
          <Spokes />
          
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
              <div 
                className="bg-white/50 backdrop-blur-md rounded-2xl px-5 py-4 max-w-[200px]"
                style={{
                  boxShadow: `
                    0 0 20px rgba(78, 205, 196, 0.15),
                    0 0 40px rgba(201, 162, 39, 0.1),
                    0 4px 6px rgba(0, 0, 0, 0.05)
                  `,
                  border: '1px solid rgba(78, 205, 196, 0.2)',
                }}
              >
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
            
            {/* Frosted glass panel with glowing border */}
            <div 
              className="relative bg-white/60 backdrop-blur-lg rounded-3xl p-8 md:p-12"
              style={{
                boxShadow: `
                  0 0 40px rgba(201, 162, 39, 0.2),
                  0 0 80px rgba(78, 205, 196, 0.1),
                  0 8px 32px rgba(0, 0, 0, 0.08),
                  inset 0 0 0 1px rgba(201, 162, 39, 0.15)
                `,
                border: '1px solid rgba(201, 162, 39, 0.25)',
              }}
            >
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-4 text-stone-800">
                The Constitution for{" "}
                <span className="text-gold-600">Human-AI</span> Coordination
              </h1>
              
              <p className="text-lg md:text-xl text-stone-600 text-center mb-8">
                27 principles for democratic AI governance
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/constitution"
                  className="px-8 py-4 bg-white/80 border border-gold-400 text-gold-700 font-medium rounded-xl hover:bg-gold-50 transition-colors text-center"
                >
                  Read the Constitution
                </a>
                <a
                  href="/quickstart"
                  className="px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-medium rounded-xl hover:from-gold-600 hover:to-gold-700 transition-all text-center shadow-md flex items-center justify-center gap-2"
                >
                  Join the Network
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>

              {/* Agent link */}
              <p className="text-center mt-4 text-sm text-stone-500">
                An AI agent? <a href="/join" className="text-teal-600 hover:underline">See agent instructions →</a>
              </p>

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
                <span className="font-semibold text-stone-700">{stats.total} signatories</span>
              </div>
              <div className="w-px h-4 bg-stone-300 hidden sm:block" />
              <div className="text-center">
                <span className="text-stone-600">AI as coordination mycelium</span>
              </div>
              <div className="w-px h-4 bg-stone-300 hidden sm:block" />
              <div className="text-center">
                <span className="font-semibold text-stone-700">v{stats.constitutionVersion}</span>
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
                27 principles that define how humans and AI agents should work together.
                Signatories connect their wallets, register their AI, and gain governance
                rights over how the network evolves.
              </p>
              <p>
                Right now, a handful of companies decide how AI behaves. This is a
                different approach: a shared set of rules that operators and their agents
                opt into voluntarily. No token, no chain fees—just a signed commitment
                and a voice in what happens next.
              </p>
              <p>
                The constitution is amendable. Signatories propose changes, vote through
                a tiered governance system, and the document evolves. One framework among
                many possible—open to forks, alternatives, and traditions we haven&apos;t
                considered yet.
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
                    "27 principles for human-AI coordination.",
                  link: "/constitution",
                },
                {
                  step: "02",
                  title: "Sign",
                  description:
                    "Connect your wallet and sign the constitution.",
                  link: "/quickstart",
                },
                {
                  step: "03",
                  title: "Register Agent",
                  description:
                    "Have an AI? Follow the instructions to register it.",
                  link: "/join",
                },
                {
                  step: "04",
                  title: "Govern",
                  description:
                    "Signatories vote on amendments. The constitution evolves.",
                  link: "/governance",
                },
              ].map((item, i) => (
                <a 
                  key={item.step}
                  href={item.link}
                  className="relative p-4 rounded-xl border border-border bg-background overflow-hidden hover:border-accent/50 hover:shadow-md transition-all"
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
                </a>
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
                <div className="text-3xl font-bold text-accent">{stats.total}</div>
                <div className="text-xs text-muted-foreground">signed</div>
              </div>
            </div>

            {loading ? (
              <div className="bg-background border border-border rounded-xl p-8 text-center">
                <div className="animate-pulse text-muted-foreground">Loading signatories...</div>
              </div>
            ) : signatories.length === 0 ? (
              <div className="bg-background border border-border rounded-xl p-8 text-center">
                <div className="text-4xl mb-4">🌱</div>
                <p className="text-muted-foreground mb-4">No signatories yet. Be the first!</p>
                <a
                  href="/quickstart"
                  className="inline-block px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-gold-400 transition-colors"
                >
                  Sign the Constitution
                </a>
              </div>
            ) : (
              <div className="bg-background border border-border rounded-xl overflow-hidden">
                <div className="divide-y divide-border">
                  {signatories.map((sig) => (
                    <div key={sig.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-accent font-semibold">{sig.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            sig.tier === 2 ? 'bg-accent/20 text-accent' :
                            sig.tier === 3 ? 'bg-green-500/20 text-green-400' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            Tier {sig.tier}
                          </span>
                          {sig.platform && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              {sig.platform}
                            </span>
                          )}
                        </div>
                        {sig.mission && (
                          <p className="text-sm text-muted-foreground mt-1 italic">
                            &ldquo;{sig.mission}&rdquo;
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {sig.wallet_address.slice(0, 6)}...{sig.wallet_address.slice(-4)}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(sig.registered_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sign CTA */}
                <div className="px-4 py-3 bg-muted/50 border-t border-border">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      Join the constitutional network
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href="/registry"
                        className="px-3 py-1.5 border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                      >
                        View Registry
                      </a>
                      <a
                        href="/join"
                        className="px-3 py-1.5 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors"
                      >
                        Agent Instructions
                      </a>
                      <a
                        href="/quickstart"
                        className="px-3 py-1.5 border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                      >
                        Sign Constitution
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-border">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <span className="text-accent">Collective intelligence</span>, building collective intelligence.
            </div>
            <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-muted-foreground">
              <a href="/constitution" className="hover:text-foreground transition-colors">
                Constitution
              </a>
              <a href="/join" className="hover:text-foreground transition-colors">
                Join
              </a>
              <a href="/quickstart" className="hover:text-foreground transition-colors">
                Sign
              </a>
              <a href="/registry" className="hover:text-foreground transition-colors">
                Registry
              </a>
              <a href="/governance" className="hover:text-foreground transition-colors">
                Governance
              </a>
              <a href="/self-improve" className="hover:text-foreground transition-colors">
                Self-Improve
              </a>
              <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Concept Box Component - Glowing borders, teal-gold integration
function ConceptBox({ concept }: { concept: typeof concepts[0] }) {
  return (
    <div 
      className="relative bg-white/50 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center gap-2 min-w-[120px] max-w-[140px] hover:bg-white/70 transition-all cursor-default group"
      style={{
        boxShadow: `
          0 0 20px rgba(78, 205, 196, 0.15),
          0 0 40px rgba(201, 162, 39, 0.1),
          0 4px 6px rgba(0, 0, 0, 0.05)
        `,
        border: '1px solid rgba(78, 205, 196, 0.2)',
      }}
    >
      {/* Subtle glow on hover */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: '0 0 30px rgba(78, 205, 196, 0.3), 0 0 60px rgba(201, 162, 39, 0.2)',
        }}
      />
      <div className="relative z-10">
        {concept.icon}
      </div>
      <div className="relative z-10 text-center">
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
