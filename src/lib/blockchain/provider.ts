/**
 * Blockchain Provider Service
 * 
 * Provides viem clients and blockchain interaction methods.
 * Handles balance fetching, transaction submission, and network management.
 */

import {
  createPublicClient,
  http,
  formatEther,
  formatUnits,
  type PublicClient,
  type Address,
} from 'viem';
import { networks, DEFAULT_NETWORK_ID, type NetworkConfig } from './networks';

/**
 * Cache for public clients by network ID
 */
const clientCache = new Map<string, PublicClient>();

/**
 * Get or create a public client for a network
 */
export function getPublicClient(networkId: string = DEFAULT_NETWORK_ID): PublicClient {
  // Return cached client if available
  if (clientCache.has(networkId)) {
    return clientCache.get(networkId)!;
  }

  const network = networks[networkId];
  if (!network) {
    throw new Error(`Unknown network: ${networkId}`);
  }

  // Create new client
  const client = createPublicClient({
    chain: network.chain,
    transport: http(network.rpcUrl),
  });

  // Cache it
  clientCache.set(networkId, client);

  return client;
}

/**
 * Clear client cache (useful when switching RPC endpoints)
 */
export function clearClientCache(): void {
  clientCache.clear();
}

/**
 * Balance result with formatted values
 */
export interface BalanceResult {
  /** Raw balance in wei */
  raw: bigint;
  /** Formatted balance in ETH (or native currency) */
  formatted: string;
  /** Balance as a number (may lose precision for large values) */
  value: number;
  /** Currency symbol */
  symbol: string;
}

/**
 * Get native currency balance for an address
 */
export async function getBalance(
  address: Address,
  networkId: string = DEFAULT_NETWORK_ID
): Promise<BalanceResult> {
  const client = getPublicClient(networkId);
  const network = networks[networkId];

  if (!network) {
    throw new Error(`Unknown network: ${networkId}`);
  }

  const balance = await client.getBalance({ address });
  const formatted = formatEther(balance);

  return {
    raw: balance,
    formatted,
    value: parseFloat(formatted),
    symbol: network.nativeCurrency.symbol,
  };
}

/**
 * Token balance result
 */
export interface TokenBalanceResult {
  /** Raw balance in token's smallest unit */
  raw: bigint;
  /** Formatted balance with proper decimals */
  formatted: string;
  /** Balance as a number */
  value: number;
  /** Token symbol */
  symbol: string;
  /** Token decimals */
  decimals: number;
}

/**
 * ERC-20 Token ABI (minimal for balance checking)
 */
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'decimals', type: 'uint8' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'symbol', type: 'string' }],
  },
] as const;

/**
 * Get ERC-20 token balance for an address
 */
export async function getTokenBalance(
  address: Address,
  tokenAddress: Address,
  networkId: string = DEFAULT_NETWORK_ID
): Promise<TokenBalanceResult> {
  const client = getPublicClient(networkId);

  // Fetch balance, decimals, and symbol in parallel
  const [balance, decimals, symbol] = await Promise.all([
    client.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    }),
    client.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'decimals',
    }),
    client.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'symbol',
    }),
  ]);

  const formatted = formatUnits(balance, decimals);

  return {
    raw: balance,
    formatted,
    value: parseFloat(formatted),
    symbol,
    decimals,
  };
}

/**
 * Get current block number
 */
export async function getBlockNumber(
  networkId: string = DEFAULT_NETWORK_ID
): Promise<bigint> {
  const client = getPublicClient(networkId);
  return client.getBlockNumber();
}

/**
 * Get current gas price
 */
export async function getGasPrice(
  networkId: string = DEFAULT_NETWORK_ID
): Promise<bigint> {
  const client = getPublicClient(networkId);
  return client.getGasPrice();
}

/**
 * Check if an address is a contract
 */
export async function isContract(
  address: Address,
  networkId: string = DEFAULT_NETWORK_ID
): Promise<boolean> {
  const client = getPublicClient(networkId);
  const code = await client.getCode({ address });
  return code !== undefined && code !== '0x';
}

/**
 * Get transaction count (nonce) for an address
 */
export async function getTransactionCount(
  address: Address,
  networkId: string = DEFAULT_NETWORK_ID
): Promise<number> {
  const client = getPublicClient(networkId);
  return client.getTransactionCount({ address });
}

/**
 * Wait for a transaction to be confirmed
 */
export async function waitForTransaction(
  hash: `0x${string}`,
  networkId: string = DEFAULT_NETWORK_ID,
  confirmations: number = 1
) {
  const client = getPublicClient(networkId);
  return client.waitForTransactionReceipt({
    hash,
    confirmations,
  });
}

/**
 * Get network info
 */
export function getNetworkInfo(networkId: string = DEFAULT_NETWORK_ID): NetworkConfig | undefined {
  return networks[networkId];
}
