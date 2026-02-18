'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function CreateProposalButton() {
  const { walletAddress, connect, connecting } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  
  if (!walletAddress) {
    return (
      <div className="relative">
        <button
          onClick={connect}
          disabled={connecting}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {connecting ? 'Connecting...' : 'Create Proposal'}
        </button>
        {showTooltip && !connecting && (
          <div className="absolute top-full right-0 mt-2 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 w-64 shadow-xl z-10">
            <p>Connect your wallet to create proposals.</p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <Link href="/governance/new">
      <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
        Create Proposal
      </button>
    </Link>
  );
}
