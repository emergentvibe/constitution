#!/usr/bin/env npx ts-node
/**
 * System Test: Full Dyad Journey Simulation
 * 
 * Tests the entire flow:
 * 1. Create test wallet (operator)
 * 2. Create test agent identity
 * 3. Register agent via API
 * 4. Create proposal
 * 5. Vote on proposal
 * 6. Verify results
 * 7. Exit (cleanup)
 * 
 * Usage: npx ts-node scripts/test-system.ts [base-url]
 * Default: http://localhost:3000
 */

import { Wallet } from 'ethers';

const BASE_URL = process.argv[2] || 'http://localhost:3000';

interface TestResult {
  step: string;
  success: boolean;
  details?: string;
  data?: any;
}

const results: TestResult[] = [];

function log(step: string, success: boolean, details?: string, data?: any) {
  const icon = success ? '✓' : '✗';
  console.log(`${icon} ${step}${details ? ': ' + details : ''}`);
  results.push({ step, success, details, data });
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create a test wallet (no real funds needed for signing)
function createTestWallet(): Wallet {
  const wallet = Wallet.createRandom();
  return wallet;
}

// Sign a message with the test wallet
async function signMessage(wallet: Wallet, message: string): Promise<string> {
  return wallet.signMessage(message);
}

// Test 1: API Health Check
async function testApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/symbiont-hub/stats`);
    const data = await res.json();
    log('API Health', res.ok, `${data.total_agents || 0} agents registered`, data);
    return res.ok;
  } catch (err: any) {
    log('API Health', false, err.message);
    return false;
  }
}

// Test 2: Get Constitution Hash
async function testConstitution(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/symbiont-hub/constitution`);
    const data = await res.json();
    log('Constitution', res.ok, `hash: ${data.hash?.substring(0, 16)}...`, data);
    return data.hash || null;
  } catch (err: any) {
    log('Constitution', false, err.message);
    return null;
  }
}

// Test 3: Get Signing Message
async function testSigningMessage(): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/api/symbiont-hub/signing-message`);
    const data = await res.json();
    log('Signing Message', res.ok, 'template retrieved');
    return data;
  } catch (err: any) {
    log('Signing Message', false, err.message);
    return null;
  }
}

// Test 4: Register Agent
async function testRegisterAgent(wallet: Wallet, agentName: string): Promise<string | null> {
  try {
    const timestamp = new Date().toISOString();
    const message = `I, the operator of "${agentName}", sign the Emergent Vibe Constitution.

Agent: ${agentName}
Wallet: ${wallet.address}
Timestamp: ${timestamp}
Constitution Version: 0.1.5

I commit to the 27 principles and agree to the governance process.`;

    const signature = await signMessage(wallet, message);
    
    const res = await fetch(`${BASE_URL}/api/symbiont-hub/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: agentName,
        description: 'Test agent for system verification',
        wallet_address: wallet.address,
        operator_address: wallet.address,
        signature,
        message,
      }),
    });
    
    const data = await res.json();
    
    if (res.ok && data.agent?.id) {
      log('Register Agent', true, `id: ${data.agent.id}`, data.agent);
      return data.agent.id;
    } else {
      log('Register Agent', false, data.error || 'Unknown error', data);
      return null;
    }
  } catch (err: any) {
    log('Register Agent', false, err.message);
    return null;
  }
}

// Test 5: List Agents (verify registration)
async function testListAgents(agentName: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/symbiont-hub/agents`);
    const data = await res.json();
    const found = data.agents?.some((a: any) => a.name === agentName);
    log('List Agents', found, found ? 'agent found in registry' : 'agent NOT found');
    return found;
  } catch (err: any) {
    log('List Agents', false, err.message);
    return false;
  }
}

// Test 6: Create Governance Proposal
async function testCreateProposal(wallet: Wallet): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/governance/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Proposal: System Verification',
        description: 'This is an automated test proposal to verify the governance system is working correctly. It should be deleted after testing. '.repeat(3),
        type: 'policy_proposal',
        category: 'Testing',
        author_wallet: wallet.address,
      }),
    });
    
    const data = await res.json();
    
    if (res.ok && data.proposal?.id) {
      log('Create Proposal', true, `id: ${data.proposal.id}`, data.proposal);
      return data.proposal.id;
    } else {
      log('Create Proposal', false, data.error || 'Unknown error', data);
      return null;
    }
  } catch (err: any) {
    log('Create Proposal', false, err.message);
    return null;
  }
}

// Test 7: Get Proposal
async function testGetProposal(proposalId: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/governance/proposals/${proposalId}`);
    const data = await res.json();
    log('Get Proposal', res.ok, data.proposal?.title || 'no title', data);
    return res.ok;
  } catch (err: any) {
    log('Get Proposal', false, err.message);
    return false;
  }
}

// Test 8: Vote on Proposal
async function testVote(proposalId: string, wallet: Wallet): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/governance/proposals/${proposalId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        choice: 1, // For
        reason: 'Automated test vote',
        wallet_address: wallet.address,
      }),
    });
    
    const data = await res.json();
    log('Cast Vote', res.ok, res.ok ? 'vote recorded' : data.error, data);
    return res.ok;
  } catch (err: any) {
    log('Cast Vote', false, err.message);
    return false;
  }
}

// Test 9: Get Votes
async function testGetVotes(proposalId: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/governance/proposals/${proposalId}/vote`);
    const data = await res.json();
    log('Get Votes', res.ok, `${data.total || 0} votes`, data);
    return res.ok && data.total > 0;
  } catch (err: any) {
    log('Get Votes', false, err.message);
    return false;
  }
}

// Test 10: Delete Proposal (cleanup)
async function testDeleteProposal(proposalId: string, wallet: Wallet): Promise<boolean> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/governance/proposals/${proposalId}?author_wallet=${wallet.address}`,
      { method: 'DELETE' }
    );
    const data = await res.json();
    log('Delete Proposal', res.ok, res.ok ? 'cleaned up' : data.error);
    return res.ok;
  } catch (err: any) {
    log('Delete Proposal', false, err.message);
    return false;
  }
}

// Test 11: Exit (delete agent)
async function testExit(agentId: string, wallet: Wallet): Promise<boolean> {
  try {
    const message = `I voluntarily exit the constitutional network.\nAgent ID: ${agentId}\nTimestamp: ${new Date().toISOString()}`;
    const signature = await signMessage(wallet, message);
    
    const res = await fetch(`${BASE_URL}/api/symbiont-hub/agents/${agentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature, message }),
    });
    
    const data = await res.json();
    log('Exit Agent', res.ok, res.ok ? 'exited successfully' : data.error);
    return res.ok;
  } catch (err: any) {
    log('Exit Agent', false, err.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n🧪 EMERGENTVIBE SYSTEM TEST');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('─'.repeat(50));
  
  // Create test wallet
  const wallet = createTestWallet();
  console.log(`\n📝 Test Wallet: ${wallet.address}`);
  console.log('─'.repeat(50));
  
  const testAgentName = `TestBot_${Date.now()}`;
  let agentId: string | null = null;
  let proposalId: string | null = null;
  
  // Run tests
  console.log('\n[1/11] API Health Check');
  const healthy = await testApiHealth();
  if (!healthy) {
    console.log('\n❌ API not healthy, aborting tests');
    return;
  }
  
  console.log('\n[2/11] Constitution');
  await testConstitution();
  
  console.log('\n[3/11] Signing Message Template');
  await testSigningMessage();
  
  console.log('\n[4/11] Register Agent');
  agentId = await testRegisterAgent(wallet, testAgentName);
  
  if (agentId) {
    console.log('\n[5/11] Verify Registration');
    await testListAgents(testAgentName);
  }
  
  console.log('\n[6/11] Create Proposal');
  proposalId = await testCreateProposal(wallet);
  
  if (proposalId) {
    console.log('\n[7/11] Get Proposal');
    await testGetProposal(proposalId);
    
    console.log('\n[8/11] Cast Vote');
    await testVote(proposalId, wallet);
    
    console.log('\n[9/11] Verify Vote');
    await testGetVotes(proposalId);
    
    console.log('\n[10/11] Cleanup Proposal');
    await testDeleteProposal(proposalId, wallet);
  }
  
  if (agentId) {
    console.log('\n[11/11] Exit Agent');
    await testExit(agentId, wallet);
  }
  
  // Summary
  console.log('\n' + '─'.repeat(50));
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('✅ ALL TESTS PASSED\n');
  } else {
    console.log('❌ SOME TESTS FAILED\n');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.step}: ${r.details}`);
    });
    console.log('');
  }
}

runTests().catch(console.error);
