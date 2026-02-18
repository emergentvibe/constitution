'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { GovernanceHeader } from '@/components/governance/GovernanceHeader';
import { VotePanel } from '@/components/governance/VotePanel';
import { SnapshotSubmit } from '@/components/governance/SnapshotSubmit';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow, format } from 'date-fns';

interface Proposal {
  id: string;
  title: string;
  description?: string;
  body?: string;
  status?: string;
  state?: string;
  proposal_type?: string;
  category?: string;
  choices?: string[];
  scores?: number[];
  scores_total?: number;
  votes?: number;
  voting_start?: string;
  voting_end?: string;
  start?: number;
  end?: number;
  snapshot_id?: string;
  amendment_text?: string;
  impact_assessment?: string;
  quorum_threshold?: number;
  approval_threshold?: number;
  author_wallet?: string;
  created_at?: string;
}

interface Outcome {
  passed: boolean;
  quorumMet: boolean;
  approvalMet: boolean;
  details: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  constitutional_amendment: { label: 'Constitutional Amendment', color: 'bg-purple-600' },
  boundary_change: { label: 'Boundary Change', color: 'bg-orange-600' },
  policy_proposal: { label: 'Policy Proposal', color: 'bg-blue-600' },
  resource_allocation: { label: 'Resource Allocation', color: 'bg-green-600' },
  emergency_action: { label: 'Emergency Action', color: 'bg-red-600' },
};

export default function ProposalPage() {
  const params = useParams();
  const id = params.id as string;
  const { walletAddress } = useAuth();
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProposal();
  }, [id]);
  
  async function fetchProposal() {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/governance/proposals/${id}?votes=true`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch proposal');
      }
      
      setProposal(data.proposal);
      setOutcome(data.outcome || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <GovernanceHeader />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-zinc-800 rounded w-24 mb-4" />
            <div className="h-10 bg-zinc-800 rounded w-3/4 mb-4" />
            <div className="h-4 bg-zinc-800 rounded w-full mb-2" />
            <div className="h-4 bg-zinc-800 rounded w-2/3" />
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <GovernanceHeader />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-white mb-2">Proposal Not Found</h1>
            <p className="text-zinc-400 mb-4">{error || 'This proposal does not exist.'}</p>
            <Link href="/governance">
              <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg">
                Back to Governance
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  const status = proposal.state || proposal.status || 'draft';
  const type = typeLabels[proposal.proposal_type || ''] || { label: 'Proposal', color: 'bg-zinc-600' };
  const isActive = status === 'active';
  const isClosed = status === 'closed';
  const isDraft = status === 'draft';
  
  const startTime = proposal.start ? new Date(proposal.start * 1000) : 
                    proposal.voting_start ? new Date(proposal.voting_start) : null;
  const endTime = proposal.end ? new Date(proposal.end * 1000) : 
                  proposal.voting_end ? new Date(proposal.voting_end) : null;
  
  const isAuthor = walletAddress && proposal.author_wallet?.toLowerCase() === walletAddress.toLowerCase();
  const canVote = walletAddress && isActive;
  
  const scores = proposal.scores || [];
  const total = proposal.scores_total || scores.reduce((a, b) => a + b, 0);
  const choices = proposal.choices || ['For', 'Against', 'Abstain'];
  
  return (
    <div className="min-h-screen bg-zinc-950">
      <GovernanceHeader />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/governance" className="text-zinc-400 hover:text-white text-sm">
          ← Back to Governance
        </Link>
        
        {/* Header */}
        <div className="mt-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 text-sm font-medium rounded ${type.color} text-white`}>
              {type.label}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded ${
              status === 'active' ? 'bg-emerald-900/50 text-emerald-400' :
              status === 'closed' ? 'bg-zinc-800 text-zinc-400' :
              status === 'draft' ? 'bg-yellow-900/50 text-yellow-400' :
              'bg-zinc-700 text-zinc-300'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">{proposal.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
            <span>
              By {proposal.author_wallet 
                ? `${proposal.author_wallet.slice(0, 6)}...${proposal.author_wallet.slice(-4)}`
                : 'Anonymous'}
            </span>
            {startTime && <span>Started {format(startTime, 'MMM d, yyyy')}</span>}
            {endTime && isActive && (
              <span className="text-emerald-400">
                Ends {formatDistanceToNow(endTime, { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
        
        {/* Draft: Submit to Snapshot */}
        {isDraft && isAuthor && (
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-8">
            <h3 className="text-yellow-400 font-medium mb-2">Draft Proposal</h3>
            <p className="text-zinc-300 text-sm mb-4">
              This proposal is a draft. To start voting, sign and submit it to Snapshot.
            </p>
            <SnapshotSubmit proposal={proposal} onSuccess={fetchProposal} />
          </div>
        )}
        
        {/* Voting Results */}
        {(isActive || isClosed) && scores.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              {isClosed ? 'Final Results' : 'Current Results'}
            </h3>
            
            <div className="space-y-4 mb-6">
              {choices.map((choice, i) => {
                const score = scores[i] || 0;
                const percentage = total > 0 ? (score / total) * 100 : 0;
                const colors = ['bg-emerald-500', 'bg-red-500', 'bg-zinc-600'];
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">{choice}</span>
                      <span className="text-zinc-400">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[i] || 'bg-zinc-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between text-sm text-zinc-400 pt-4 border-t border-zinc-800">
              <span>{proposal.votes || 0} votes</span>
              {outcome && (
                <span className={outcome.passed ? 'text-emerald-400' : 'text-red-400'}>
                  {outcome.passed ? '✓ Passed' : '✗ Did not pass'}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Vote Panel */}
        {canVote && (
          <VotePanel 
            proposalId={id}
            snapshotId={proposal.snapshot_id}
            choices={choices}
            onVoteSuccess={fetchProposal}
          />
        )}
        
        {/* Description */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
          <p className="text-zinc-300 whitespace-pre-wrap">
            {proposal.description || proposal.body}
          </p>
        </div>
        
        {/* Amendment Text */}
        {proposal.amendment_text && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Proposed Amendment</h3>
            <pre className="bg-zinc-950 border border-zinc-700 rounded-lg p-4 text-sm text-zinc-300 overflow-x-auto">
              {proposal.amendment_text}
            </pre>
          </div>
        )}
        
        {/* Thresholds */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Voting Thresholds</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-zinc-400">Quorum Required</div>
              <div className="text-white font-medium">
                {((proposal.quorum_threshold || 0.15) * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="text-zinc-400">Approval Required</div>
              <div className="text-white font-medium">
                {((proposal.approval_threshold || 0.51) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
        
        {proposal.snapshot_id && (
          <div className="mt-8 text-center">
            <a
              href={`https://snapshot.org/#/emergentvibe.eth/proposal/${proposal.snapshot_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline text-sm"
            >
              View on Snapshot →
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
