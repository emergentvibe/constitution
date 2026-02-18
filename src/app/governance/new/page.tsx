'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GovernanceHeader } from '@/components/governance/GovernanceHeader';
import { useAuth } from '@/hooks/useAuth';

type ProposalType = 
  | 'constitutional_amendment'
  | 'boundary_change'
  | 'policy_proposal'
  | 'resource_allocation'
  | 'emergency_action';

const proposalTypes: { value: ProposalType; label: string; description: string; threshold: string }[] = [
  {
    value: 'policy_proposal',
    label: 'Policy Proposal',
    description: 'Propose new policies or guidelines for the community',
    threshold: 'Simple majority (51%)',
  },
  {
    value: 'constitutional_amendment',
    label: 'Constitutional Amendment',
    description: 'Propose changes to the core constitution',
    threshold: 'Supermajority (67%)',
  },
  {
    value: 'boundary_change',
    label: 'Boundary Change',
    description: 'Changes to territory, membership criteria, or jurisdiction',
    threshold: 'Supermajority (67%)',
  },
  {
    value: 'resource_allocation',
    label: 'Resource Allocation',
    description: 'Budget and resource decisions',
    threshold: 'Simple majority (51%)',
  },
  {
    value: 'emergency_action',
    label: 'Emergency Action',
    description: 'Time-sensitive proposals requiring expedited voting',
    threshold: 'Supermajority (67%), 3-day vote',
  },
];

export default function NewProposalPage() {
  const router = useRouter();
  const { user, citizen, loading } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProposalType>('policy_proposal');
  const [category, setCategory] = useState('');
  const [impactAssessment, setImpactAssessment] = useState('');
  const [amendmentText, setAmendmentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isAmendment = type === 'constitutional_amendment' || type === 'boundary_change';
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/governance/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          type,
          category,
          impact_assessment: impactAssessment,
          amendment_text: isAmendment ? amendmentText : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create proposal');
      }
      
      // Redirect to the new proposal
      router.push(`/governance/${data.proposal.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <GovernanceHeader />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-800 rounded w-48 mb-4" />
            <div className="h-4 bg-zinc-800 rounded w-96 mb-8" />
            <div className="space-y-4">
              <div className="h-12 bg-zinc-800 rounded" />
              <div className="h-32 bg-zinc-800 rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!user || !citizen || citizen.status !== 'active') {
    return (
      <div className="min-h-screen bg-zinc-950">
        <GovernanceHeader />
        <main className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <div className="text-4xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-2">Citizenship Required</h1>
            <p className="text-zinc-400 mb-6">
              Only active citizens can create governance proposals.
            </p>
            <Link href="/citizens/apply">
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Apply for Citizenship
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-zinc-950">
      <GovernanceHeader />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/governance" className="text-zinc-400 hover:text-white text-sm">
            ← Back to Governance
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4 mb-2">Create Proposal</h1>
          <p className="text-zinc-400">
            Submit a proposal for the community to vote on.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Proposal Type */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Proposal Type
            </label>
            <div className="grid gap-3">
              {proposalTypes.map(pt => (
                <label
                  key={pt.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    type === pt.value
                      ? 'border-emerald-500 bg-emerald-900/20'
                      : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={pt.value}
                    checked={type === pt.value}
                    onChange={() => setType(pt.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-white">{pt.label}</div>
                    <div className="text-sm text-zinc-400">{pt.description}</div>
                    <div className="text-xs text-emerald-400 mt-1">{pt.threshold}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="A clear, concise title for your proposal"
              required
              minLength={10}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
              Category (optional)
            </label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g., Infrastructure, Membership, Treasury"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <p className="text-xs text-zinc-400 mb-2">
              Explain your proposal in detail. Include motivation, proposed changes, and expected outcomes.
              Markdown is supported.
            </p>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your proposal..."
              required
              minLength={100}
              rows={8}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-y"
            />
            <div className="text-xs text-zinc-500 mt-1">
              {description.length}/100 minimum characters
            </div>
          </div>
          
          {/* Amendment Text (for constitutional amendments) */}
          {isAmendment && (
            <div>
              <label htmlFor="amendmentText" className="block text-sm font-medium text-white mb-2">
                Proposed Amendment Text
              </label>
              <p className="text-xs text-zinc-400 mb-2">
                Provide the exact text to be added, modified, or removed from the constitution.
              </p>
              <textarea
                id="amendmentText"
                value={amendmentText}
                onChange={e => setAmendmentText(e.target.value)}
                placeholder="The proposed constitutional text..."
                rows={6}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-y font-mono text-sm"
              />
            </div>
          )}
          
          {/* Impact Assessment */}
          <div>
            <label htmlFor="impact" className="block text-sm font-medium text-white mb-2">
              Impact Assessment (optional)
            </label>
            <p className="text-xs text-zinc-400 mb-2">
              Describe how this proposal will affect citizens, resources, or governance.
            </p>
            <textarea
              id="impact"
              value={impactAssessment}
              onChange={e => setImpactAssessment(e.target.value)}
              placeholder="Expected impact of this proposal..."
              rows={4}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-y"
            />
          </div>
          
          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}
          
          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Link href="/governance">
              <button
                type="button"
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Draft Proposal'}
            </button>
          </div>
          
          <p className="text-xs text-zinc-500 text-center">
            Your proposal will be created as a draft. You&apos;ll need to sign and submit it to Snapshot to start voting.
          </p>
        </form>
      </main>
    </div>
  );
}
