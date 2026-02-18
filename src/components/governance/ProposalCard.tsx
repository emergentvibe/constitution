'use client';

import Link from 'next/link';
// Simple time formatting without date-fns
function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  
  if (diffDays > 1) return `in ${diffDays} days`;
  if (diffDays === 1) return 'in 1 day';
  if (diffHours > 1) return `in ${diffHours} hours`;
  if (diffHours === 1) return 'in 1 hour';
  if (diffMs > 0) return 'soon';
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === -1) return '1 day ago';
  return 'recently';
}

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

const typeLabels: Record<string, { label: string; color: string }> = {
  constitutional_amendment: { label: 'Amendment', color: 'bg-purple-600' },
  boundary_change: { label: 'Boundary', color: 'bg-orange-600' },
  policy_proposal: { label: 'Policy', color: 'bg-blue-600' },
  resource_allocation: { label: 'Resources', color: 'bg-green-600' },
  emergency_action: { label: 'Emergency', color: 'bg-red-600' },
};

const statusStyles: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-zinc-700', text: 'text-zinc-300' },
  pending: { bg: 'bg-yellow-900/50', text: 'text-yellow-400' },
  active: { bg: 'bg-emerald-900/50', text: 'text-emerald-400' },
  closed: { bg: 'bg-zinc-800', text: 'text-zinc-400' },
  executed: { bg: 'bg-blue-900/50', text: 'text-blue-400' },
  rejected: { bg: 'bg-red-900/50', text: 'text-red-400' },
};

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const status = proposal.state || proposal.status || 'draft';
  const statusStyle = statusStyles[status] || statusStyles.draft;
  const type = typeLabels[proposal.proposal_type || ''] || { label: 'Proposal', color: 'bg-zinc-600' };
  
  // Get timing info
  const startTime = proposal.start ? new Date(proposal.start * 1000) : 
                    proposal.voting_start ? new Date(proposal.voting_start) : null;
  const endTime = proposal.end ? new Date(proposal.end * 1000) : 
                  proposal.voting_end ? new Date(proposal.voting_end) : null;
  
  const isActive = status === 'active';
  const timeRemaining = endTime && isActive ? formatDistanceToNow(endTime) : null;
  
  // Calculate vote percentages
  const scores = proposal.scores || [];
  const total = proposal.scores_total || scores.reduce((a, b) => a + b, 0);
  const choices = proposal.choices || ['For', 'Against', 'Abstain'];
  
  const getBody = () => {
    const text = proposal.description || proposal.body || '';
    // Strip metadata section if present
    const cleaned = text.split('\n---\n')[0];
    return cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned;
  };
  
  return (
    <Link href={`/governance/${proposal.id}`}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors cursor-pointer">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${type.color} text-white`}>
              {type.label}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded ${statusStyle.bg} ${statusStyle.text}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {proposal.source === 'snapshot' && (
              <span className="px-2 py-1 text-xs font-medium rounded bg-zinc-700 text-zinc-300">
                Snapshot
              </span>
            )}
          </div>
          {timeRemaining && (
            <span className="text-sm text-zinc-400">
              Ends {timeRemaining}
            </span>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2">
          {proposal.title}
        </h3>
        
        {/* Description preview */}
        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
          {getBody()}
        </p>
        
        {/* Vote Results (if available) */}
        {scores.length > 0 && total > 0 && (
          <div className="mb-4">
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-zinc-800">
              {scores.map((score, i) => {
                const percentage = (score / total) * 100;
                const colors = ['bg-emerald-500', 'bg-red-500', 'bg-zinc-600'];
                return percentage > 0 ? (
                  <div 
                    key={i}
                    className={`${colors[i] || 'bg-zinc-500'} transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                ) : null;
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-zinc-500">
              {choices.slice(0, 3).map((choice, i) => {
                const score = scores[i] || 0;
                const percentage = total > 0 ? ((score / total) * 100).toFixed(1) : '0';
                return (
                  <span key={i}>
                    {choice}: {percentage}%
                  </span>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="flex justify-between items-center text-sm text-zinc-500">
          <span>
            {proposal.author?.display_name || 
             (proposal.author_wallet ? `${proposal.author_wallet.slice(0, 6)}...${proposal.author_wallet.slice(-4)}` : 'Anonymous')}
          </span>
          <span>
            {proposal.votes !== undefined ? `${proposal.votes} votes` : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}
