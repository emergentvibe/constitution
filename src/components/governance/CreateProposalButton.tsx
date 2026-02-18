'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function CreateProposalButton() {
  const { user, citizen } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  
  if (!user) {
    return (
      <div className="relative">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="bg-zinc-700 text-zinc-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
        >
          Create Proposal
        </button>
        {showTooltip && (
          <div className="absolute top-full right-0 mt-2 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 w-64 shadow-xl z-10">
            <p className="mb-2">You must be a citizen to create proposals.</p>
            <Link href="/citizens/apply" className="text-emerald-400 hover:underline">
              Apply for citizenship →
            </Link>
          </div>
        )}
      </div>
    );
  }
  
  if (!citizen || citizen.status !== 'active') {
    return (
      <div className="relative">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="bg-zinc-700 text-zinc-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
        >
          Create Proposal
        </button>
        {showTooltip && (
          <div className="absolute top-full right-0 mt-2 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 w-64 shadow-xl z-10">
            <p>Your citizenship application is {citizen?.status || 'pending'}.</p>
            <p className="text-zinc-500 mt-1">You can create proposals once approved.</p>
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
