/**
 * Network Configuration
 * 
 * Defines supported blockchain networks for the wallet.
 * Includes Ethereum mainnet, major L2s, and testnets.
 */

import { 
  mainnet, 
  sepolia, 
  base, 
  baseSepolia, 
  optimism, 
  arbitrum, 
  polygon,
  zora,
} from 'viem/chains';
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
 * Mainnets: Ethereum, Base, Optimism, Arbitrum, Polygon, Zora
 * Testnets: Sepolia, Base Sepolia
 */
export const networks: Record<string, NetworkConfig> = {
  // === MAINNETS ===
  mainnet: {
    id: 'mainnet',
    name: 'Ethereum',
    chain: mainnet,
    rpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    isTestnet: false,
    iconColor: '#627EEA',
    eip7212Supported: false,
  },
  base: {
    id: 'base',
    name: 'Base',
    chain: base,
    rpcUrl: import.meta.env.VITE_BASE_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    isTestnet: false,
    iconColor: '#0052FF',
    eip7212Supported: true, // Base supports EIP-7212
  },
  optimism: {
    id: 'optimism',
    name: 'Optimism',
    chain: optimism,
    rpcUrl: import.meta.env.VITE_OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    isTestnet: false,
    iconColor: '#FF0420',
    eip7212Supported: false,
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    chain: arbitrum,
    rpcUrl: import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    isTestnet: false,
    iconColor: '#28A0F0',
    eip7212Supported: false,
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    chain: polygon,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    isTestnet: false,
    iconColor: '#8247E5',
    eip7212Supported: false,
  },
  zora: {
    id: 'zora',
    name: 'Zora',
    chain: zora,
    rpcUrl: 'https://rpc.zora.energy',
    explorerUrl: 'https://explorer.zora.energy',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    isTestnet: false,
    iconColor: '#000000',
    eip7212Supported: true, // Zora supports EIP-7212
  },

  // === TESTNETS ===
  sepolia: {
    id: 'sepolia',
    name: 'Sepolia',
    chain: sepolia,
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://eth-sepolia.public.blastapi.io',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    isTestnet: true,
    iconColor: '#627EEA',
    eip7212Supported: false,
  },
  'base-sepolia': {
    id: 'base-sepolia',
    name: 'Base Sepolia',
    chain: baseSepolia,
    rpcUrl: import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    isTestnet: true,
    iconColor: '#0052FF',
    eip7212Supported: true, // Base Sepolia supports EIP-7212
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
