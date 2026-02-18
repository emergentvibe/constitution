/**
 * Symbiont Hub Utilities
 * Signature verification, constitution hash, tier logic
 */

import { verifyMessage } from 'ethers';

// Constitution v0.1.5 SHA-256 hash
export const CONSTITUTION_HASH = '18db508cbce2cc5dd4c39496b69b628707efa1a1cf9b582b3d16a48b03e076b5';
export const CONSTITUTION_VERSION = '0.1.5';

// Founder address (emergentvibe) - gets Tier 3
// Set this to your wallet address after first registration
export const FOUNDER_ADDRESS: string | null = null;

// Bootstrap: first N agents get Tier 2 automatically
export const BOOTSTRAP_TIER2_LIMIT = 10;

/**
 * Generate the signing message for constitution
 */
export function getSigningMessage(name: string, walletAddress: string): string {
  return `I, ${name}, sign the Constitution for Human-AI Coordination (v${CONSTITUTION_VERSION}).

I commit to:
1. First, do no harm (AI prioritizes human welfare)
2. Enhance, don't replace (make humans more capable)
3. Both can leave (exit rights for all)

Constitution hash: ${CONSTITUTION_HASH}
Wallet: ${walletAddress}`;
}

/**
 * Verify a signature against the expected message
 */
export function verifySignature(
  name: string,
  walletAddress: string,
  signature: string
): { valid: boolean; error?: string; recoveredAddress?: string } {
  try {
    const expectedMessage = getSigningMessage(name, walletAddress);
    const recoveredAddress = verifyMessage(expectedMessage, signature);
    
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return {
        valid: false,
        error: `Signature mismatch: expected ${walletAddress}, got ${recoveredAddress}`,
        recoveredAddress
      };
    }
    
    return { valid: true, recoveredAddress };
  } catch (err) {
    return {
      valid: false,
      error: `Invalid signature format: ${err instanceof Error ? err.message : 'unknown error'}`
    };
  }
}

/**
 * Determine initial tier for a new agent
 * 
 * Tier logic (MVP):
 * - Founder address = Tier 3
 * - First BOOTSTRAP_TIER2_LIMIT agents = Tier 2
 * - Everyone else = Tier 1
 * 
 * Future: Tier 2 requires vouching from existing Tier 2+
 */
export async function determineInitialTier(
  walletAddress: string,
  currentAgentCount: number
): Promise<{ tier: number; reason: string }> {
  // Founder gets Tier 3
  if (FOUNDER_ADDRESS !== null && walletAddress.toLowerCase() === FOUNDER_ADDRESS.toLowerCase()) {
    return { tier: 3, reason: 'founder' };
  }
  
  // Bootstrap: first N agents get Tier 2
  if (currentAgentCount < BOOTSTRAP_TIER2_LIMIT) {
    return { tier: 2, reason: 'bootstrap' };
  }
  
  // Everyone else starts at Tier 1
  // TODO: Implement vouching system for Tier 2 upgrade
  return { tier: 1, reason: 'default' };
}

/**
 * Verify a vote signature
 */
export function verifyVoteSignature(
  proposalId: string,
  vote: string,
  walletAddress: string,
  signature: string
): { valid: boolean; error?: string } {
  try {
    const expectedMessage = `Vote ${vote} on proposal ${proposalId}`;
    const recoveredAddress = verifyMessage(expectedMessage, signature);
    
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return { valid: false, error: 'Signature does not match wallet address' };
    }
    
    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: `Invalid signature: ${err instanceof Error ? err.message : 'unknown'}`
    };
  }
}

/**
 * Verify a proposal signature
 */
export function verifyProposalSignature(
  title: string,
  walletAddress: string,
  signature: string
): { valid: boolean; error?: string } {
  try {
    const expectedMessage = `Propose: ${title}`;
    const recoveredAddress = verifyMessage(expectedMessage, signature);
    
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return { valid: false, error: 'Signature does not match wallet address' };
    }
    
    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: `Invalid signature: ${err instanceof Error ? err.message : 'unknown'}`
    };
  }
}
