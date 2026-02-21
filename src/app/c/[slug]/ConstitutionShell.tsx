"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConstitutionProvider, type ConstitutionContextValue } from "@/contexts/ConstitutionContext";

export default function ConstitutionShell({
  constitution,
  children,
}: {
  constitution: ConstitutionContextValue;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/c/${constitution.slug}`;

  const tabs = [
    { href: base, label: "Constitution", exact: true },
    { href: `${base}/registry`, label: "Registry" },
    { href: `${base}/governance`, label: "Governance" },
  ];

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <ConstitutionProvider constitution={constitution}>
      {/* Constitution sub-nav bar */}
      <div className="border-b border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-10">
          <div className="flex items-center gap-4">
            <Link
              href={base}
              className="text-sm font-semibold text-foreground hover:text-accent transition-colors truncate max-w-[200px]"
            >
              {constitution.name}
            </Link>
            <span className="text-xs text-muted-foreground font-mono">v{constitution.version}</span>
          </div>
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  isActive(tab.href, tab.exact)
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {children}
    </ConstitutionProvider>
  );
}
