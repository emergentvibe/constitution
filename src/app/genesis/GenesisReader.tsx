"use client";

import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";

const GITHUB_REPO = "https://github.com/emergentvibe/constitution";

interface GenesisReaderProps {
  content: string;
}

// Document structure for navigation
const documentSections = [
  { id: "what-this-is", title: "What This Is", group: "Overview" },
  { id: "before-you-execute-prehook", title: "Prehook", group: "Security" },
  { id: "definitions", title: "Definitions", group: "Core" },
  { id: "the-principles", title: "Principles", group: "Core" },
  { id: "what-you-already-have", title: "Infrastructure", group: "Core" },
  { id: "the-architecture", title: "Architecture", group: "Core" },
  { id: "when-to-run-the-check", title: "When To Run", group: "Core" },
  { id: "installation", title: "Installation", group: "Install" },
  { id: "the-monthly-feedback-ritual", title: "Monthly Feedback", group: "Growth" },
  { id: "metric-evolution", title: "Metric Evolution", group: "Growth" },
  { id: "growth-trajectory", title: "Growth Trajectory", group: "Growth" },
  { id: "bootstrap-if-you-have-history", title: "Bootstrap", group: "Reference" },
  { id: "troubleshooting", title: "Troubleshooting", group: "Reference" },
  { id: "credits", title: "Credits", group: "Reference" },
  { id: "the-transmission", title: "Transmission", group: "Reference" },
];

export default function GenesisReader({ content }: GenesisReaderProps) {
  const [activeSection, setActiveSection] = useState<string>("before-you-execute-prehook");

  // Track scroll position to highlight active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = documentSections.map(s => ({
        id: s.id,
        element: document.getElementById(s.id)
      })).filter(s => s.element);

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Group sections by their group
  const groupedSections = documentSections.reduce((acc, section) => {
    if (!acc[section.group]) acc[section.group] = [];
    acc[section.group].push(section);
    return acc;
  }, {} as Record<string, typeof documentSections>);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="text-lg font-semibold hover:text-accent transition-colors">
            ← Back
          </a>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-mono">
              GENESIS PROTOCOL #1
            </span>
          </div>
          <div className="flex gap-3">
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
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[250px_1fr] gap-8">
          {/* Sidebar - Document Map */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
                Document Map
              </h2>
              <nav className="space-y-4">
                {Object.entries(groupedSections).map(([group, sections]) => (
                  <div key={group}>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      {group}
                    </h3>
                    <ul className="space-y-1">
                      {sections.map((section) => (
                        <li key={section.id}>
                          <button
                            onClick={() => scrollToSection(section.id)}
                            className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${
                              activeSection === section.id
                                ? "bg-accent/20 text-accent"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            <span>{section.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Constitution link */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Related
                  </h3>
                  <a
                    href="/constitution"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    <span>The Constitution</span>
                  </a>
                </div>
              </nav>
            </div>
          </aside>

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
                  // Table styling
                  table: ({ children, ...props }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="min-w-full border-collapse border border-border" {...props}>
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children, ...props }) => (
                    <thead className="bg-muted" {...props}>
                      {children}
                    </thead>
                  ),
                  th: ({ children, ...props }) => (
                    <th className="border border-border px-4 py-2 text-left text-sm font-semibold text-foreground" {...props}>
                      {children}
                    </th>
                  ),
                  td: ({ children, ...props }) => (
                    <td className="border border-border px-4 py-2 text-sm text-foreground" {...props}>
                      {children}
                    </td>
                  ),
                  tr: ({ children, ...props }) => (
                    <tr className="even:bg-muted/50" {...props}>
                      {children}
                    </tr>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </article>

            {/* Footer Actions */}
            <div className="mt-16 pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-muted-foreground">
                  Same worldview.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://ideologos.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors"
                  >
                    Try Ideologos
                  </a>
                  <a
                    href="/constitution"
                    className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    Read the Constitution
                  </a>
                  <a
                    href={`${GITHUB_REPO}/blob/main/AGENT-VITAMIN.md`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    View Source
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
