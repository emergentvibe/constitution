'use client';

import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';

export function GovernanceHeader() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
            ⚖️ Constitution
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link 
              href="/constitution" 
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Read
            </Link>
            <Link 
              href="/governance" 
              className="text-sm text-emerald-400 font-medium"
            >
              Governance
            </Link>
            <Link
              href="/registry"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Registry
            </Link>
          </nav>
        </div>
        <WalletConnect />
      </div>
    </header>
  );
}
