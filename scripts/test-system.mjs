#!/usr/bin/env node
/**
 * System Test: Full Dyad Journey Simulation
 * 
 * Tests the entire flow:
 * 1. Create test wallet (operator)
 * 2. Register agent via API
 * 3. Create proposal
 * 4. Vote on proposal
 * 5. Verify results
 * 6. Exit (cleanup)
 * 
 * Usage: node scripts/test-system.mjs [base-url]
 * Default: http://localhost:3000
 */

import { Wallet } from 'ethers';

const BASE_URL = process.argv[2] || 'http://localhost:3000';

const results = [];

function log(step, success, details, data) {
  const icon = success ? '✓' : '✗';
  console.log(`${icon} ${step}${details ? ': ' + details : ''}`);
  results.push({ step, success, details, data });
}

// Create a test wallet (no real funds needed for signing)
function createTestWallet() {
  return Wallet.createRandom();
}

// Test 1: API Health Check
async function testApiHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/symbiont-hub/stats`);
    const data = await res.json();
    log('API Health', res.ok, `${data.total_agents || 0} agents registered`, data);
    return res.ok;
  } catch (err) {
    log('API Health', false, err.message);
    return false;
  }
}

// Test 2: Get Constitution Hash
async function testConstitution() {
  try {
    const res = await fetch(`${BASE_URL}/api/symbiont-hub/constitution`);
    const data = await res.json();
    log('Constitution', res.ok, `hash: ${data.hash?.substring(0, 16)}...`, data);
    return data.hash || null;
  } catch (err) {
    log('Constitution', false, err.message);
    return null;
  }
}

// Test 3: Get Signing Message (with params)
async function testSigningMessage() {
  try {
    const res = await fetch(`${BASE_URL}/api/symbiont-hub/signing-message?name=TestAgent&wallet=0x1234567890123456789012345678901234567890`);
    const data = await res.json();
    const hasMessage = !!data.message;
    log('Signing Message', hasMessage, hasMessage ? 'template works' : 'no message returned');
    return data;
  } catch (err) {
    log('Signing Message', false, err.message);
    return null;
  }
}

// Test 4: Register Agent
async function testRegisterAgent(wallet, agentName) {
  try {
    // Get the correct signing message format from the API
    const msgRes = await fetch(`${BASE_URL}/api/symbiont-hub/signing-message?name=${encodeURIComponent(agentName)}&wallet=${wallet.address}`);
    const msgData = await msgRes.json();
    
    if (!msgData.message) {
      log('Register Agent', false, 'Could not get signing message', msgData);
      return null;
    }
    
    const message = msgData.message;
    const signature = await wallet.signMessage(message);
    
    console.log('  Signing message:', message.substring(0, 50) + '...');
    console.log('  Wallet:', wallet.address);
    console.log('  Signature:', signature.substring(0, 20) + '...');
    
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
    
    console.log('  Response status:', res.status);
    
    const data = await res.json();
    
    if (res.ok && data.id) {
      log('Register Agent', true, `id: ${data.id}, tier: ${data.tier}`, data);
      return data.id;
    } else {
      const errMsg = data.error || data.details || JSON.stringify(data);
      log('Register Agent', false, errMsg);
      console.log('  Debug response:', JSON.stringify(data, null, 2));
      return null;
    }
  } catch (err) {
    log('Register Agent', false, err.message);
    return null;
  }
}

// Test 5: List Agents (verify registration)
async function testListAgents(agentName) {
  try {
    const res = await fetch(`${BASE_URL}/api/symbiont-hub/agents`);
    const data = await res.json();
    const found = data.agents?.some(a => a.name === agentName);
    log('List Agents', found, found ? 'agent found in registry' : 'agent NOT found');
    return found;
  } catch (err) {
    log('List Agents', false, err.message);
    return false;
  }
}

// Test 6: Create Governance Proposal
async function testCreateProposal(wallet) {
  try {
    const res = await fetch(`${BASE_URL}/api/governance/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Proposal: System Verification',
        description: 'This is an automated test proposal to verify the governance system is working correctly. It should be deleted after testing. This description needs to be at least 100 characters long to pass validation so adding more text here.',
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
  } catch (err) {
    log('Create Proposal', false, err.message);
    return null;
  }
}

// Test 7: Get Proposal
async function testGetProposal(proposalId) {
  try {
    const res = await fetch(`${BASE_URL}/api/governance/proposals/${proposalId}`);
    const data = await res.json();
    log('Get Proposal', res.ok, data.proposal?.title || 'no title', data);
    return res.ok;
  } catch (err) {
    log('Get Proposal', false, err.message);
    return false;
  }
}

// Test 8: Vote on Proposal
async function testVote(proposalId, wallet) {
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
  } catch (err) {
    log('Cast Vote', false, err.message);
    return false;
  }
}

// Test 9: Get Votes
async function testGetVotes(proposalId) {
  try {
    const res = await fetch(`${BASE_URL}/api/governance/proposals/${proposalId}/vote`);
    const data = await res.json();
    log('Get Votes', res.ok, `${data.total || 0} votes`, data);
    return res.ok && data.total > 0;
  } catch (err) {
    log('Get Votes', false, err.message);
    return false;
  }
}

// Test 10: Delete Proposal (cleanup)
async function testDeleteProposal(proposalId, wallet) {
  try {
    const res = await fetch(
      `${BASE_URL}/api/governance/proposals/${proposalId}?author_wallet=${wallet.address}`,
      { method: 'DELETE' }
    );
    const data = await res.json();
    log('Delete Proposal', res.ok, res.ok ? 'cleaned up' : data.error);
    return res.ok;
  } catch (err) {
    log('Delete Proposal', false, err.message);
    return false;
  }
}

// Test 11: Exit (delete agent)
async function testExit(agentId, wallet) {
  try {
    const message = `I voluntarily exit the constitutional network.\nAgent ID: ${agentId}\nTimestamp: ${new Date().toISOString()}`;
    const signature = await wallet.signMessage(message);
    
    const res = await fetch(`${BASE_URL}/api/symbiont-hub/agents/${agentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature, message }),
    });
    
    const data = await res.json();
    log('Exit Agent', res.ok, res.ok ? 'exited successfully' : data.error);
    return res.ok;
  } catch (err) {
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
  let agentId = null;
  let proposalId = null;
  
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
  } else {
    log('Verify Registration', false, 'skipped - no agent');
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
  } else {
    log('Get Proposal', false, 'skipped - no proposal');
    log('Cast Vote', false, 'skipped - no proposal');
    log('Verify Vote', false, 'skipped - no proposal');
    log('Delete Proposal', false, 'skipped - no proposal');
  }
  
  if (agentId) {
    console.log('\n[11/11] Exit Agent');
    await testExit(agentId, wallet);
  } else {
    log('Exit Agent', false, 'skipped - no agent');
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
