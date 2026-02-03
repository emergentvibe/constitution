"use client";

import { Separator } from "@/components/Separator";
import NetworkHero from "@/components/NetworkHero";

// GitHub repo URL
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

export default function HomeClient({
  signatories,
  stats,
}: HomeClientProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 overflow-hidden">
        {/* Divergence field network */}
        <NetworkHero />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
            A coordination mechanism for{" "}
            <span className="text-accent">human-AI futures</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-slide-up">
            {stats.principles} principles for democratic AI governance. A civil society contribution to the global conversation—not universal law, but a Schelling point for those who share these values.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
            <a
              href="/constitution"
              className="px-8 py-4 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-gold-400 transition-colors text-center"
            >
              Read the Constitution
            </a>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-background border border-border font-medium rounded-lg hover:bg-muted transition-colors text-center flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-8 text-sm text-muted-foreground animate-slide-up">
            <span>{stats.principles} principles</span>
            <span>{stats.sections} sections</span>
            <span>{stats.sources}+ sources</span>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="max-w-4xl mx-auto px-6">
        <Separator variant="gradient" />
      </div>

      {/* What This Is */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">What this is</h2>
          <div className="space-y-4 text-lg text-muted-foreground">
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
            <a href="https://twitter.com/emergentvibe" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
