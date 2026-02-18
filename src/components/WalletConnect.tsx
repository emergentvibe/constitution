'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      selectedAddress: string | null;
    };
  }
}

export function WalletConnect() {
  const { user, citizen, loading } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if already connected
    if (window.ethereum?.selectedAddress) {
      setWalletAddress(window.ethereum.selectedAddress);
    }
    
    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        setWalletAddress(null);
      }
    };
    
    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);
  
  async function connectWallet() {
    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      return;
    }
    
    setConnecting(true);
    setError(null);
    
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Connection rejected');
      } else {
        setError(err.message || 'Failed to connect');
      }
    } finally {
      setConnecting(false);
    }
  }
  
  function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  
  if (loading) {
    return (
      <div className="h-10 w-32 bg-zinc-800 rounded-lg animate-pulse" />
    );
  }
  
  // Show citizen info if logged in
  if (citizen && walletAddress) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium text-white">
            {citizen.display_name || 'Citizen'}
          </div>
          <div className="text-xs text-zinc-400">
            {formatAddress(walletAddress)}
          </div>
        </div>
        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
          <span className="text-sm">🏛️</span>
        </div>
      </div>
    );
  }
  
  // Wallet connected but not a citizen
  if (walletAddress) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">{formatAddress(walletAddress)}</span>
        <a 
          href="/citizens/apply" 
          className="text-sm text-emerald-400 hover:underline"
        >
          Become a citizen
        </a>
      </div>
    );
  }
  
  // Not connected
  return (
    <div className="flex flex-col items-end">
      <button
        onClick={connectWallet}
        disabled={connecting}
        className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && (
        <span className="text-xs text-red-400 mt-1">{error}</span>
      )}
    </div>
  );
}
