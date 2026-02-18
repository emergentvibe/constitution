'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GovernanceHeader } from '@/components/governance/GovernanceHeader';
import { ProposalCard } from '@/components/governance/ProposalCard';
import { CreateProposalButton } from '@/components/governance/CreateProposalButton';

type ProposalFilter = 'all' | 'active' | 'pending' | 'closed';

interface Proposal {
  id: string;
  title: string;
  description?: string;
  body?: string;
  status?: string;
  state?: string;
  proposal_type?: string;
  choices?: string[];
  scores?: number[];
  scores_total?: number;
  votes?: number;
  voting_start?: string;
  voting_end?: string;
  start?: number;
  end?: number;
  source: 'local' | 'snapshot';
  author?: {
    display_name?: string;
  };
  author_wallet?: string;
}

export default function GovernancePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProposalFilter>('all');
  
  useEffect(() => {
    fetchProposals();
  }, [filter]);
  
  async function fetchProposals() {
    setLoading(true);
    setError(null);
    
    try {
      const state = filter === 'all' ? '' : `&state=${filter}`;
      const response = await fetch(`/api/governance/proposals?source=all${state}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch proposals');
      }
      
      setProposals(data.proposals || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  const filterTabs: { key: ProposalFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'closed', label: 'Closed' },
  ];
  
  return (
    <div className="min-h-screen bg-zinc-950">
      <GovernanceHeader />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Governance</h1>
            <p className="text-zinc-400">
              Participate in shaping the constitution through democratic proposals and voting.
            </p>
          </div>
          <CreateProposalButton />
        </div>
        
        {/* Info Box */}
        <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-4 mb-8">
          <div className="flex gap-3">
            <div className="text-emerald-400 text-xl">ℹ️</div>
            <div>
              <h3 className="text-emerald-400 font-medium mb-1">How Governance Works</h3>
              <p className="text-zinc-300 text-sm">
                Proposals are submitted by citizens and voted on using{' '}
                <a 
                  href="https://snapshot.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  Snapshot.org
                </a>
                . Constitutional amendments require a 2/3 supermajority.
                Policy changes require a simple majority. All votes are gasless and verifiable on-chain.
              </p>
            </div>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-4">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Proposals List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4" />
            <p className="text-zinc-400">Loading proposals...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-center">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchProposals}
              className="mt-2 text-sm text-zinc-400 hover:text-white"
            >
              Try again
            </button>
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <div className="text-4xl mb-4">📜</div>
            <h3 className="text-lg font-medium text-white mb-2">No proposals yet</h3>
            <p className="text-zinc-400 mb-4">
              Be the first to submit a proposal for the community to vote on.
            </p>
            <CreateProposalButton />
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map(proposal => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}
        
        {/* Stats Footer */}
        {!loading && proposals.length > 0 && (
          <div className="mt-8 pt-8 border-t border-zinc-800 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{proposals.length}</div>
              <div className="text-sm text-zinc-400">Total Proposals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">
                {proposals.filter(p => (p.state || p.status) === 'active').length}
              </div>
              <div className="text-sm text-zinc-400">Active Now</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-400">
                {proposals.filter(p => (p.state || p.status) === 'closed').length}
              </div>
              <div className="text-sm text-zinc-400">Completed</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
