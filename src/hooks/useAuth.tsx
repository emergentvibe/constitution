'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
  walletAddress: string | null;
  connecting: boolean;
  connect: () => Promise<string | null>;
  disconnect: () => void;
  signTypedData: (domain: any, types: any, message: any) => Promise<string | null>;
  signMessage: (message: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  
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
  
  async function connect(): Promise<string | null> {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet');
      return null;
    }
    
    setConnecting(true);
    
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        return accounts[0];
      }
      return null;
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      return null;
    } finally {
      setConnecting(false);
    }
  }
  
  function disconnect() {
    setWalletAddress(null);
  }
  
  async function signTypedData(domain: any, types: any, message: any): Promise<string | null> {
    if (!window.ethereum || !walletAddress) {
      console.error('No wallet connected');
      return null;
    }
    
    try {
      // EIP-712 typed data signing
      const msgParams = JSON.stringify({
        domain,
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
          ],
          ...types,
        },
        primaryType: Object.keys(types)[0],
        message,
      });
      
      const signature = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [walletAddress, msgParams],
      });
      
      return signature;
    } catch (err: any) {
      console.error('Signing error:', err);
      return null;
    }
  }
  
  async function signMessage(message: string): Promise<string | null> {
    if (!window.ethereum || !walletAddress) {
      console.error('No wallet connected');
      return null;
    }
    
    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });
      return signature;
    } catch (err: any) {
      console.error('Signing error:', err);
      return null;
    }
  }
  
  return (
    <AuthContext.Provider value={{ walletAddress, connecting, connect, disconnect, signTypedData, signMessage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook for checking if user can perform actions
export function useCanVote() {
  const { walletAddress } = useAuth();
  // For now, anyone with a connected wallet can vote
  // Later: check against whitelist or Snapshot space members
  return !!walletAddress;
}
