/**
 * Tests for signature verification — the authentication backbone.
 * Uses real ethers.js crypto (deterministic wallets, NOT mocked).
 */
import { describe, it, expect } from 'vitest';
import { operatorWallet, agentWallet, outsiderWallet } from '../fixtures/wallets';
import {
  verifySignature,
  getSigningMessage,
  verifyVoteSignature,
  verifyProposalSignature,
  verifyOperatorToken,
  verifyOperatorTokenFlexible,
  determineInitialTier,
  CONSTITUTION_HASH,
  CONSTITUTION_VERSION,
} from '@/lib/auth';

describe('verifySignature', () => {
  it('accepts a valid signature from the correct wallet', async () => {
    const name = 'test-agent';
    const wallet = operatorWallet;
    const message = getSigningMessage(name, wallet.address);
    const signature = await wallet.signMessage(message);

    const result = verifySignature(name, wallet.address, signature);
    expect(result.valid).toBe(true);
    expect(result.recoveredAddress?.toLowerCase()).toBe(wallet.address.toLowerCase());
  });

  it('rejects a signature from a different wallet', async () => {
    const name = 'test-agent';
    const message = getSigningMessage(name, operatorWallet.address);
    const signature = await agentWallet.signMessage(message);

    const result = verifySignature(name, operatorWallet.address, signature);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Signature mismatch');
  });

  it('rejects garbage signature', () => {
    const result = verifySignature('test', operatorWallet.address, '0xdeadbeef');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid signature format');
  });
});

describe('verifyVoteSignature', () => {
  it('accepts valid vote signature', async () => {
    const proposalId = '123e4567-e89b-12d3-a456-426614174000';
    const vote = 'For';
    const message = `Vote ${vote} on proposal ${proposalId}`;
    const signature = await operatorWallet.signMessage(message);

    const result = verifyVoteSignature(proposalId, vote, operatorWallet.address, signature);
    expect(result.valid).toBe(true);
  });

  it('rejects vote signed by wrong wallet', async () => {
    const proposalId = '123e4567-e89b-12d3-a456-426614174000';
    const vote = 'Against';
    const message = `Vote ${vote} on proposal ${proposalId}`;
    const signature = await agentWallet.signMessage(message);

    const result = verifyVoteSignature(proposalId, vote, operatorWallet.address, signature);
    expect(result.valid).toBe(false);
  });
});

describe('verifyProposalSignature', () => {
  it('accepts valid proposal signature', async () => {
    const title = 'Amend Principle 5';
    const message = `Propose: ${title}`;
    const signature = await operatorWallet.signMessage(message);

    const result = verifyProposalSignature(title, operatorWallet.address, signature);
    expect(result.valid).toBe(true);
  });

  it('rejects signature from wrong wallet', async () => {
    const title = 'Amend Principle 5';
    const message = `Propose: ${title}`;
    const signature = await outsiderWallet.signMessage(message);

    const result = verifyProposalSignature(title, operatorWallet.address, signature);
    expect(result.valid).toBe(false);
  });
});

describe('verifyOperatorToken', () => {
  it('accepts a valid /sign-format token', async () => {
    const agentName = 'my-agent';
    const timestamp = new Date().toISOString();
    const expires = new Date(Date.now() + 3600_000).toISOString();

    const message = `I authorize "${agentName}" to join the emergentvibe constitutional network.

Agent: ${agentName}
Description: ${agentName || "Not provided"}
Operator: ${operatorWallet.address}
Timestamp: ${timestamp}

By signing this message, I confirm:
1. I am the operator responsible for this agent
2. I have read the constitution at emergentvibe.com/constitution
3. I authorize this agent to register and participate in governance`;

    const signature = await operatorWallet.signMessage(message);
    const token = btoa(JSON.stringify({
      agent: agentName,
      operator: operatorWallet.address,
      signature,
      timestamp,
      expires,
    }));

    const result = verifyOperatorToken(token, agentName);
    expect(result.valid).toBe(true);
    expect(result.operatorAddress).toBe(operatorWallet.address);
  });

  it('rejects an expired token', async () => {
    const agentName = 'my-agent';
    const timestamp = new Date().toISOString();
    const expires = new Date(Date.now() - 1000).toISOString(); // already expired

    const message = `I authorize "${agentName}" to join the emergentvibe constitutional network.

Agent: ${agentName}
Description: ${agentName || "Not provided"}
Operator: ${operatorWallet.address}
Timestamp: ${timestamp}

By signing this message, I confirm:
1. I am the operator responsible for this agent
2. I have read the constitution at emergentvibe.com/constitution
3. I authorize this agent to register and participate in governance`;

    const signature = await operatorWallet.signMessage(message);
    const token = btoa(JSON.stringify({
      agent: agentName,
      operator: operatorWallet.address,
      signature,
      timestamp,
      expires,
    }));

    const result = verifyOperatorToken(token, agentName);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('expired');
  });

  it('rejects token for wrong agent name', async () => {
    const agentName = 'my-agent';
    const timestamp = new Date().toISOString();
    const expires = new Date(Date.now() + 3600_000).toISOString();

    const message = `I authorize "${agentName}" to join the emergentvibe constitutional network.

Agent: ${agentName}
Description: ${agentName || "Not provided"}
Operator: ${operatorWallet.address}
Timestamp: ${timestamp}

By signing this message, I confirm:
1. I am the operator responsible for this agent
2. I have read the constitution at emergentvibe.com/constitution
3. I authorize this agent to register and participate in governance`;

    const signature = await operatorWallet.signMessage(message);
    const token = btoa(JSON.stringify({
      agent: agentName,
      operator: operatorWallet.address,
      signature,
      timestamp,
      expires,
    }));

    const result = verifyOperatorToken(token, 'wrong-agent');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Token is for agent');
  });
});

describe('verifyOperatorTokenFlexible', () => {
  it('accepts /sign page format', async () => {
    const agentName = 'my-agent';
    const timestamp = new Date().toISOString();
    const expires = new Date(Date.now() + 3600_000).toISOString();

    const message = `I authorize "${agentName}" to join the emergentvibe constitutional network.

Agent: ${agentName}
Description: ${agentName || "Not provided"}
Operator: ${operatorWallet.address}
Timestamp: ${timestamp}

By signing this message, I confirm:
1. I am the operator responsible for this agent
2. I have read the constitution at emergentvibe.com/constitution
3. I authorize this agent to register and participate in governance`;

    const signature = await operatorWallet.signMessage(message);
    const token = btoa(JSON.stringify({
      agent: agentName,
      operator: operatorWallet.address,
      signature,
      timestamp,
      expires,
    }));

    const result = verifyOperatorTokenFlexible(token, agentName);
    expect(result.valid).toBe(true);
    expect(result.operatorAddress).toBe(operatorWallet.address);
  });

  it('accepts /quickstart page format (with agent)', async () => {
    const agentName = 'my-agent';
    const operatorName = 'Test User';
    const timestamp = new Date().toISOString();
    const expires = new Date(Date.now() + 3600_000).toISOString();

    const message = `I, ${operatorName}, sign the Constitution for Human-AI Coordination (v${CONSTITUTION_VERSION}).

I commit to the 27 principles, including:
1. First, do no harm — human welfare above all
2. Enhance, don't replace — make humans more capable
3. Both can leave — exit rights for all

I authorize "${agentName}" as my AI partner in this network.

Constitution hash: ${CONSTITUTION_HASH}
Operator: ${operatorWallet.address}
Timestamp: ${timestamp}`;

    const signature = await operatorWallet.signMessage(message);
    const token = btoa(JSON.stringify({
      agent: agentName,
      operator: operatorWallet.address,
      operatorName,
      signature,
      timestamp,
      expires,
    }));

    const result = verifyOperatorTokenFlexible(token, agentName);
    expect(result.valid).toBe(true);
    expect(result.operatorAddress).toBe(operatorWallet.address);
  });

  it('accepts human-only /quickstart format (no agent)', async () => {
    const operatorName = 'Test User';
    const timestamp = new Date().toISOString();
    const expires = new Date(Date.now() + 3600_000).toISOString();

    const message = `I, ${operatorName}, sign the Constitution for Human-AI Coordination (v${CONSTITUTION_VERSION}).

I commit to the 27 principles, including:
1. First, do no harm — human welfare above all
2. Enhance, don't replace — make humans more capable
3. Both can leave — exit rights for all

Constitution hash: ${CONSTITUTION_HASH}
Wallet: ${operatorWallet.address}
Timestamp: ${timestamp}`;

    const signature = await operatorWallet.signMessage(message);
    const token = btoa(JSON.stringify({
      agent: null,
      operator: operatorWallet.address,
      operatorName,
      signature,
      timestamp,
      expires,
    }));

    // When agent field is null, verifyOperatorTokenFlexible tries human-only format
    const result = verifyOperatorTokenFlexible(token, 'any-name');
    expect(result.valid).toBe(true);
    expect(result.operatorAddress).toBe(operatorWallet.address);
  });

  it('rejects expired token', async () => {
    const token = btoa(JSON.stringify({
      agent: 'test',
      operator: operatorWallet.address,
      signature: '0xabc',
      timestamp: new Date().toISOString(),
      expires: new Date(Date.now() - 1000).toISOString(),
    }));

    const result = verifyOperatorTokenFlexible(token, 'test');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('expired');
  });

  it('rejects token missing required fields', () => {
    const token = btoa(JSON.stringify({ agent: 'test' }));
    const result = verifyOperatorTokenFlexible(token, 'test');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('missing required fields');
  });

  it('accepts generic multi-constitution format with constitutionConfig', async () => {
    const agentName = 'my-agent';
    const operatorName = 'Test User';
    const timestamp = new Date().toISOString();
    const expires = new Date(Date.now() + 3600_000).toISOString();

    const constitutionConfig = {
      name: 'My Community Constitution',
      version: '1.0.0',
      content_hash: 'abc123hash',
    };

    const message = `I, ${operatorName}, sign ${constitutionConfig.name} (v${constitutionConfig.version}).

I commit to the principles set out in this constitution.

I authorize "${agentName}" as my AI agent in this network.

Constitution hash: ${constitutionConfig.content_hash}
Operator: ${operatorWallet.address}
Timestamp: ${timestamp}`;

    const signature = await operatorWallet.signMessage(message);
    const token = btoa(JSON.stringify({
      agent: agentName,
      operator: operatorWallet.address,
      operatorName,
      signature,
      timestamp,
      expires,
    }));

    const result = verifyOperatorTokenFlexible(token, agentName, constitutionConfig);
    expect(result.valid).toBe(true);
    expect(result.operatorAddress).toBe(operatorWallet.address);
  });

  it('accepts generic human-only multi-constitution format', async () => {
    const operatorName = 'Test User';
    const timestamp = new Date().toISOString();
    const expires = new Date(Date.now() + 3600_000).toISOString();

    const constitutionConfig = {
      name: 'My Community Constitution',
      version: '2.0.0',
      content_hash: 'def456hash',
    };

    const message = `I, ${operatorName}, sign ${constitutionConfig.name} (v${constitutionConfig.version}).

I commit to the principles set out in this constitution.

Constitution hash: ${constitutionConfig.content_hash}
Wallet: ${operatorWallet.address}
Timestamp: ${timestamp}`;

    const signature = await operatorWallet.signMessage(message);
    const token = btoa(JSON.stringify({
      agent: null,
      operator: operatorWallet.address,
      operatorName,
      signature,
      timestamp,
      expires,
    }));

    const result = verifyOperatorTokenFlexible(token, 'any-name', constitutionConfig);
    expect(result.valid).toBe(true);
    expect(result.operatorAddress).toBe(operatorWallet.address);
  });

  it('rejects agent name mismatch', async () => {
    const timestamp = new Date().toISOString();
    const expires = new Date(Date.now() + 3600_000).toISOString();

    const message = `I authorize "agent-a" to join the emergentvibe constitutional network.

Agent: agent-a
Description: agent-a
Operator: ${operatorWallet.address}
Timestamp: ${timestamp}

By signing this message, I confirm:
1. I am the operator responsible for this agent
2. I have read the constitution at emergentvibe.com/constitution
3. I authorize this agent to register and participate in governance`;

    const signature = await operatorWallet.signMessage(message);
    const token = btoa(JSON.stringify({
      agent: 'agent-a',
      operator: operatorWallet.address,
      signature,
      timestamp,
      expires,
    }));

    const result = verifyOperatorTokenFlexible(token, 'agent-b');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Token is for agent');
  });
});

describe('determineInitialTier', () => {
  it('assigns Tier 2 when under bootstrap limit', async () => {
    const result = await determineInitialTier('0xsomeone', 3);
    expect(result.tier).toBe(2);
    expect(result.reason).toBe('bootstrap');
  });

  it('assigns Tier 1 when at or over bootstrap limit', async () => {
    const result = await determineInitialTier('0xsomeone', 10);
    expect(result.tier).toBe(1);
    expect(result.reason).toBe('default');
  });

  it('assigns Tier 1 when well over bootstrap limit', async () => {
    const result = await determineInitialTier('0xsomeone', 100);
    expect(result.tier).toBe(1);
    expect(result.reason).toBe('default');
  });

  it('assigns Tier 2 at count 0 (first member)', async () => {
    const result = await determineInitialTier('0xfirst', 0);
    expect(result.tier).toBe(2);
    expect(result.reason).toBe('bootstrap');
  });

  it('assigns Tier 2 at count 9 (last bootstrap slot)', async () => {
    const result = await determineInitialTier('0xlast', 9);
    expect(result.tier).toBe(2);
    expect(result.reason).toBe('bootstrap');
  });
});
