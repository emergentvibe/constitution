'use client';

import { useAuth } from '@/hooks/useAuth';

export function WalletConnect() {
  const { walletAddress, connecting, connect, disconnect } = useAuth();
  
  function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  
  if (walletAddress) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400">{formatAddress(walletAddress)}</span>
        <button
          onClick={disconnect}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Disconnect
        </button>
      </div>
    );
  }
  
  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
    >
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
