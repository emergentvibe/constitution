/**
 * Deterministic test wallets using ethers.js
 * Uses HDNodeWallet.fromMnemonic for proper derivation paths.
 */
import { HDNodeWallet, Mnemonic } from 'ethers';

// Fixed mnemonic for deterministic test wallets (Hardhat default)
const TEST_MNEMONIC = 'test test test test test test test test test test test junk';
const mnemonic = Mnemonic.fromPhrase(TEST_MNEMONIC);

export function getTestWallet(index: number = 0): HDNodeWallet {
  return HDNodeWallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${index}`);
}

// Pre-built wallets for convenience — each has a unique address
export const operatorWallet = getTestWallet(0);
export const agentWallet = getTestWallet(1);
export const voterWallet = getTestWallet(2);
export const outsiderWallet = getTestWallet(3);
