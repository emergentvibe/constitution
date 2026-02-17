"use client";

import ReactMarkdown from "react-markdown";

interface VitaminReaderProps {
  content: string;
}

export default function VitaminReader({ content }: VitaminReaderProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="text-lg font-semibold hover:text-accent transition-colors">
            ← emergentvibe
          </a>
          <span className="text-sm text-muted-foreground font-mono">
            AGENT VITAMIN
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Main Content */}
        <main className="min-w-0">
          <article className="prose prose-stone max-w-none prose-headings:scroll-mt-24 prose-headings:text-foreground prose-p:text-foreground prose-a:text-accent prose-strong:text-foreground prose-li:text-foreground prose-code:text-foreground prose-pre:bg-muted">
            <ReactMarkdown
              components={{
                // Add IDs to headings for scroll navigation
                h2: ({ children, ...props }) => {
                  const text = String(children);
                  const id = text
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-");
                  return <h2 id={id} {...props}>{children}</h2>;
                },
                h3: ({ children, ...props }) => {
                  const text = String(children);
                  const id = text
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-");
                  return <h3 id={id} {...props}>{children}</h3>;
                },
                // External links open in new tab
                a: ({ href, children, ...props }) => {
                  const isExternal = href?.startsWith("http");
                  return (
                    <a
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </article>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">
                Built by emergentvibe
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/constitution"
                  className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                >
                  Read the Constitution
                </a>
                <a
                  href="https://ideologos.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors"
                >
                  Try Ideologos
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
