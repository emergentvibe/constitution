"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/constitution", label: "Constitution" },
  { href: "/registry", label: "Registry" },
  { href: "/governance", label: "Governance" },
];

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { walletAddress, connect, connecting, disconnect } = useAuth();

  const truncatedWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="text-lg font-semibold hover:text-accent transition-colors">
            emergentvibe
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {walletAddress && (
              <Link
                href="/dashboard"
                className="text-sm text-accent hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Wallet + mobile toggle */}
          <div className="flex items-center gap-3">
            {walletAddress ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">{truncatedWallet}</span>
                <button
                  onClick={disconnect}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={connecting}
                className="hidden sm:block px-3 py-1.5 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50"
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {walletAddress && (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-accent hover:bg-muted rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            )}
            <div className="px-3 pt-2 border-t border-border">
              {walletAddress ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">{truncatedWallet}</span>
                  <button
                    onClick={() => { disconnect(); setMenuOpen(false); }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { connect(); setMenuOpen(false); }}
                  disabled={connecting}
                  className="w-full px-3 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50"
                >
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
