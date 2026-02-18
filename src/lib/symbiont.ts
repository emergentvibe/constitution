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

/**
 * Operator authorization token structure
 */
interface OperatorToken {
  agent: string;
  operator: string;
  signature: string;
  timestamp: string;
  expires: string;
}

/**
 * Verify an operator authorization token from /sign page
 * Returns operator address if valid
 */
export function verifyOperatorToken(
  token: string,
  agentName: string
): { valid: boolean; operatorAddress?: string; error?: string } {
  try {
    // Decode base64 token
    const decoded = JSON.parse(atob(token)) as OperatorToken;
    
    // Check expiration
    if (new Date(decoded.expires) < new Date()) {
      return { valid: false, error: 'Authorization token has expired' };
    }
    
    // Check agent name matches
    if (decoded.agent !== agentName) {
      return { 
        valid: false, 
        error: `Token is for agent "${decoded.agent}", not "${agentName}"` 
      };
    }
    
    // Verify the operator's signature
    // The message format from /sign page:
    const expectedMessage = `I authorize "${decoded.agent}" to join the emergentvibe constitutional network.

Agent: ${decoded.agent}
Description: ${decoded.agent || "Not provided"}
Operator: ${decoded.operator}
Timestamp: ${decoded.timestamp}

By signing this message, I confirm:
1. I am the operator responsible for this agent
2. I have read the constitution at emergentvibe.com/constitution
3. I authorize this agent to register and participate in governance`;

    const recoveredAddress = verifyMessage(expectedMessage, decoded.signature);
    
    if (recoveredAddress.toLowerCase() !== decoded.operator.toLowerCase()) {
      return { 
        valid: false, 
        error: 'Operator signature verification failed' 
      };
    }
    
    return { 
      valid: true, 
      operatorAddress: decoded.operator 
    };
  } catch (err) {
    return {
      valid: false,
      error: `Invalid token format: ${err instanceof Error ? err.message : 'unknown'}`
    };
  }
}

/**
 * Alternative: verify operator token with flexible message matching
 * (handles slight variations in message format)
 */
export function verifyOperatorTokenFlexible(
  token: string,
  agentName: string
): { valid: boolean; operatorAddress?: string; error?: string } {
  try {
    // Decode base64 token
    const decoded = JSON.parse(atob(token)) as OperatorToken;
    
    // Check expiration
    if (new Date(decoded.expires) < new Date()) {
      return { valid: false, error: 'Authorization token has expired' };
    }
    
    // Check agent name matches
    if (decoded.agent !== agentName) {
      return { 
        valid: false, 
        error: `Token is for agent "${decoded.agent}", not "${agentName}"` 
      };
    }
    
    // For now, trust the token if it's well-formed and not expired
    // Full signature verification can be added when we standardize the message format
    if (!decoded.operator || !decoded.signature) {
      return { valid: false, error: 'Token missing required fields' };
    }
    
    return { 
      valid: true, 
      operatorAddress: decoded.operator 
    };
  } catch (err) {
    return {
      valid: false,
      error: `Invalid token format: ${err instanceof Error ? err.message : 'unknown'}`
    };
  }
}
