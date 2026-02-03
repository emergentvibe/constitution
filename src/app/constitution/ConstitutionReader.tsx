"use client";

import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";

const GITHUB_REPO = "https://github.com/emergentvibe/constitution";
const SIGN_URL = `${GITHUB_REPO}/issues/new?template=sign-constitution.md`;
const AMEND_URL = `${GITHUB_REPO}/issues/new?template=propose-amendment.md`;

interface ConstitutionReaderProps {
  content: string;
}

// Document structure for navigation
const documentSections = [
  { id: "preamble", title: "Preamble", group: "Overview" },
  { id: "scope-and-status", title: "Scope and Status", group: "Overview" },
  { id: "i-foundations", title: "I. Foundations", group: "Principles", detail: "P1-3" },
  { id: "ii-rights", title: "II. Rights", group: "Principles", detail: "P4-8" },
  { id: "iii-obligations", title: "III. Obligations", group: "Principles", detail: "P9-12" },
  { id: "iv-structures", title: "IV. Structures", group: "Principles", detail: "P13-16" },
  { id: "v-capabilities", title: "V. Capabilities", group: "Principles", detail: "P17-20" },
  { id: "vi-revision", title: "VI. Revision", group: "Principles", detail: "P21-24" },
  { id: "amendment-process", title: "Amendment Process", group: "Governance" },
  { id: "implementation-paths", title: "Implementation Paths", group: "Governance" },
  { id: "why-sign", title: "Why Sign?", group: "Governance" },
  { id: "signatories", title: "Signatories", group: "Governance" },
  { id: "research-grounding", title: "Research Grounding", group: "Reference" },
];

export default function ConstitutionReader({ content }: ConstitutionReaderProps) {
  const [activeSection, setActiveSection] = useState<string>("preamble");

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
              CONSTITUTION v1.2-draft
            </span>
          </div>
          <div className="flex gap-3">
            <a
              href={SIGN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors"
            >
              Sign via GitHub
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
                            {section.detail && (
                              <span className="ml-2 text-xs opacity-60">{section.detail}</span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Appendix link */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Appendix
                  </h3>
                  <a
                    href={`${GITHUB_REPO}/tree/main/appendix`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    <span>View on GitHub</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0">
            <article className="prose prose-stone max-w-none prose-headings:scroll-mt-24 prose-headings:text-foreground prose-p:text-foreground prose-a:text-accent prose-strong:text-foreground prose-li:text-foreground">
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
                  // Transform relative links to GitHub
                  a: ({ href, children, ...props }) => {
                    let finalHref = href || "";
                    
                    // Transform relative links to GitHub
                    if (href && !href.startsWith("http") && !href.startsWith("#")) {
                      // Remove leading ./ if present
                      const cleanPath = href.replace(/^\.\//, "");
                      finalHref = `${GITHUB_REPO}/blob/main/${cleanPath}`;
                    }
                    
                    // External links open in new tab
                    const isExternal = finalHref.startsWith("http");
                    
                    return (
                      <a
                        href={finalHref}
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

            {/* Footer Actions */}
            <div className="mt-16 pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-muted-foreground">
                  Ready to participate?
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={SIGN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors"
                  >
                    Sign via GitHub
                  </a>
                  <a
                    href={AMEND_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    Propose Edit
                  </a>
                  <a
                    href={`${GITHUB_REPO}/blob/main/CONSTITUTION.md`}
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
