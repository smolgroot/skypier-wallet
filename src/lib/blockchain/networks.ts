/**
 * Network Configuration
 * 
 * Defines supported blockchain networks for the wallet.
 * POC Phase: Sepolia and Base Sepolia testnets
 */

import { sepolia, baseSepolia } from 'viem/chains';
import type { Chain } from 'viem';

export interface NetworkConfig {
  id: string;
  name: string;
  chain: Chain;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
  iconColor: string;
  eip7212Supported: boolean;
}

/**
 * Supported Networks
 * 
 * For POC, we support Sepolia and Base Sepolia testnets.
 * These networks allow testing without real funds.
 */
export const networks: Record<string, NetworkConfig> = {
  sepolia: {
    id: 'sepolia',
    name: 'Sepolia',
    chain: sepolia,
    rpcUrl: 'https://eth-sepolia.public.blastapi.io',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    isTestnet: true,
    iconColor: '#627EEA',
    eip7212Supported: false, // EIP-7212 not yet on Sepolia
  },
  'base-sepolia': {
    id: 'base-sepolia',
    name: 'Base Sepolia',
    chain: baseSepolia,
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    isTestnet: true,
    iconColor: '#0052FF',
    eip7212Supported: true, // Base supports EIP-7212
  },
};

/**
 * Default network for new users
 */
export const DEFAULT_NETWORK_ID = 'sepolia';

/**
 * Get network by ID
 */
export function getNetwork(networkId: string): NetworkConfig | undefined {
  return networks[networkId];
}

/**
 * Get all supported networks
 */
export function getAllNetworks(): NetworkConfig[] {
  return Object.values(networks);
}

/**
 * Get testnet networks only
 */
export function getTestnetNetworks(): NetworkConfig[] {
  return Object.values(networks).filter((n) => n.isTestnet);
}

/**
 * Get mainnet networks only
 */
export function getMainnetNetworks(): NetworkConfig[] {
  return Object.values(networks).filter((n) => !n.isTestnet);
}

/**
 * Check if network supports EIP-7212
 */
export function supportsEIP7212(networkId: string): boolean {
  return networks[networkId]?.eip7212Supported ?? false;
}
