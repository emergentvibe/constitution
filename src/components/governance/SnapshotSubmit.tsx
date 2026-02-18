'use client';

import { useState } from 'react';

interface Proposal {
  id: string;
  title: string;
  description?: string;
  choices?: string[];
  voting_period_seconds?: number;
  metadata?: any;
}

interface SnapshotSubmitProps {
  proposal: Proposal;
  onSuccess?: () => void;
}

const SNAPSHOT_SPACE = 'emergentvibe.eth';

export function SnapshotSubmit({ proposal, onSuccess }: SnapshotSubmitProps) {
  const [step, setStep] = useState<'ready' | 'connecting' | 'signing' | 'submitting' | 'linking' | 'done'>('ready');
  const [error, setError] = useState<string | null>(null);
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  
  async function handleSubmit() {
    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      return;
    }
    
    setError(null);
    
    try {
      // Step 1: Connect wallet
      setStep('connecting');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Step 2: Get current block for snapshot
      const provider = window.ethereum;
      const blockNumber = await provider.request({ 
        method: 'eth_blockNumber' 
      });
      const snapshot = parseInt(blockNumber, 16);
      
      // Step 3: Create proposal message
      const now = Math.floor(Date.now() / 1000);
      const votingPeriod = proposal.voting_period_seconds || 604800; // 7 days default
      
      const proposalMessage = {
        space: SNAPSHOT_SPACE,
        type: 'single-choice',
        title: proposal.title,
        body: proposal.description || '',
        choices: proposal.choices || ['For', 'Against', 'Abstain'],
        start: now + 3600, // Start in 1 hour
        end: now + 3600 + votingPeriod,
        snapshot,
        plugins: '{}',
        app: 'emergentvibe-constitution',
        discussion: '',
        metadata: proposal.metadata ? JSON.stringify(proposal.metadata) : '{}',
      };
      
      // Step 4: Sign the message
      setStep('signing');
      
      // Snapshot uses EIP-712 typed data
      const domain = {
        name: 'snapshot',
        version: '0.1.4',
      };
      
      const types = {
        Proposal: [
          { name: 'from', type: 'address' },
          { name: 'space', type: 'string' },
          { name: 'timestamp', type: 'uint64' },
          { name: 'type', type: 'string' },
          { name: 'title', type: 'string' },
          { name: 'body', type: 'string' },
          { name: 'discussion', type: 'string' },
          { name: 'choices', type: 'string[]' },
          { name: 'start', type: 'uint64' },
          { name: 'end', type: 'uint64' },
          { name: 'snapshot', type: 'uint64' },
          { name: 'plugins', type: 'string' },
          { name: 'app', type: 'string' },
        ],
      };
      
      const message = {
        from: address,
        space: proposalMessage.space,
        timestamp: now,
        type: proposalMessage.type,
        title: proposalMessage.title,
        body: proposalMessage.body,
        discussion: proposalMessage.discussion,
        choices: proposalMessage.choices,
        start: proposalMessage.start,
        end: proposalMessage.end,
        snapshot: proposalMessage.snapshot,
        plugins: proposalMessage.plugins,
        app: proposalMessage.app,
      };
      
      const signature = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [address, JSON.stringify({ domain, types, message, primaryType: 'Proposal' })],
      });
      
      // Step 5: Submit to Snapshot
      setStep('submitting');
      
      const submitResponse = await fetch('https://hub.snapshot.org/api/msg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          sig: signature,
          data: {
            domain,
            types,
            message,
          },
        }),
      });
      
      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.error?.message || errorData.error || 'Snapshot submission failed');
      }
      
      const submitResult = await submitResponse.json();
      const newSnapshotId = submitResult.id;
      setSnapshotId(newSnapshotId);
      
      // Step 6: Link to local proposal
      setStep('linking');
      
      const linkResponse = await fetch(`/api/governance/proposals/${proposal.id}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot_id: newSnapshotId }),
      });
      
      if (!linkResponse.ok) {
        const linkError = await linkResponse.json();
        console.error('Link error:', linkError);
        // Don't fail completely - the Snapshot proposal is created
      }
      
      setStep('done');
      onSuccess?.();
      
    } catch (err: any) {
      console.error('Snapshot submit error:', err);
      if (err.code === 4001) {
        setError('Signature rejected');
      } else {
        setError(err.message || 'Failed to submit proposal');
      }
      setStep('ready');
    }
  }
  
  if (step === 'done') {
    return (
      <div className="text-center">
        <div className="text-emerald-400 text-lg font-medium mb-2">✓ Submitted to Snapshot</div>
        <p className="text-zinc-300 text-sm mb-4">
          Your proposal is now live and voting will begin soon.
        </p>
        {snapshotId && (
          <a
            href={`https://snapshot.org/#/${SNAPSHOT_SPACE}/proposal/${snapshotId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline text-sm"
          >
            View on Snapshot →
          </a>
        )}
      </div>
    );
  }
  
  const stepLabels: Record<string, string> = {
    connecting: 'Connecting wallet...',
    signing: 'Please sign the message in your wallet...',
    submitting: 'Submitting to Snapshot...',
    linking: 'Linking proposal...',
  };
  
  return (
    <div>
      {error && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {step !== 'ready' && (
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-400" />
          <span className="text-zinc-300">{stepLabels[step]}</span>
        </div>
      )}
      
      <button
        onClick={handleSubmit}
        disabled={step !== 'ready'}
        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        {step === 'ready' ? 'Sign & Submit to Snapshot' : 'Processing...'}
      </button>
      
      <p className="text-xs text-zinc-500 mt-3">
        This will create the proposal on Snapshot.org where citizens can vote.
        You&apos;ll need to sign a message with your wallet (no gas fees).
      </p>
    </div>
  );
}
