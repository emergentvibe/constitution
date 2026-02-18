'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface VotePanelProps {
  proposalId: string;
  snapshotId?: string;
  choices: string[];
  onVoteSuccess?: () => void;
}

export function VotePanel({ proposalId, snapshotId, choices, onVoteSuccess }: VotePanelProps) {
  const { citizen } = useAuth();
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [snapshotMessage, setSnapshotMessage] = useState<any>(null);
  
  async function handleVote() {
    if (selectedChoice === null) {
      setError('Please select an option');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/governance/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choice: selectedChoice + 1, // Convert to 1-indexed
          reason,
          snapshot_id: snapshotId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit vote');
      }
      
      setSuccess(true);
      
      // If there's a Snapshot message to sign, show it
      if (data.snapshotMessage) {
        setSnapshotMessage(data.snapshotMessage);
      }
      
      onVoteSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }
  
  async function signSnapshotVote() {
    if (!window.ethereum || !snapshotMessage) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Sign the message
      const message = JSON.stringify(snapshotMessage.message);
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });
      
      // Submit to Snapshot
      const submitResponse = await fetch('https://hub.snapshot.org/api/msg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          sig: signature,
          data: snapshotMessage.message,
        }),
      });
      
      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        throw new Error(`Snapshot error: ${errorText}`);
      }
      
      setSnapshotMessage(null);
      setError(null);
      alert('Vote submitted to Snapshot!');
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Signature rejected');
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }
  
  if (success && !snapshotMessage) {
    return (
      <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-6 mb-8">
        <div className="text-center">
          <div className="text-4xl mb-2">✓</div>
          <h3 className="text-lg font-semibold text-emerald-400 mb-2">Vote Recorded</h3>
          <p className="text-zinc-300 text-sm">
            Your vote has been recorded locally.
          </p>
        </div>
      </div>
    );
  }
  
  if (snapshotMessage) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Sign Your Vote</h3>
        <p className="text-zinc-300 text-sm mb-4">
          Your vote was recorded locally. To finalize it on-chain, sign the message with your wallet.
        </p>
        
        {error && (
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={signSnapshotVote}
            disabled={submitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            {submitting ? 'Signing...' : 'Sign & Submit to Snapshot'}
          </button>
          <button
            onClick={() => setSnapshotMessage(null)}
            className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition-colors"
          >
            Skip
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Signing is optional but makes your vote verifiable on-chain.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Cast Your Vote</h3>
      
      {/* Choices */}
      <div className="space-y-3 mb-6">
        {choices.map((choice, i) => (
          <label
            key={i}
            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedChoice === i
                ? 'border-emerald-500 bg-emerald-900/20'
                : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
            }`}
          >
            <input
              type="radio"
              name="choice"
              checked={selectedChoice === i}
              onChange={() => setSelectedChoice(i)}
              className="w-4 h-4"
            />
            <span className="text-white font-medium">{choice}</span>
          </label>
        ))}
      </div>
      
      {/* Reason (optional) */}
      <div className="mb-6">
        <label htmlFor="reason" className="block text-sm text-zinc-400 mb-2">
          Reason (optional)
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Share why you're voting this way..."
          rows={3}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
        />
      </div>
      
      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {/* Submit */}
      <button
        onClick={handleVote}
        disabled={submitting || selectedChoice === null}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Vote'}
      </button>
      
      <p className="text-xs text-zinc-500 text-center mt-3">
        Voting as {citizen?.display_name || 'Citizen'}
      </p>
    </div>
  );
}
