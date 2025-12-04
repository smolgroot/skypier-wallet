/**
 * Balance Hook
 * 
 * React hook for fetching and caching wallet balances.
 * Uses React Query for automatic caching and refetching.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBalance, getTokenBalance, type BalanceResult, type TokenBalanceResult } from '../lib/blockchain/provider';
import { DEFAULT_NETWORK_ID } from '../lib/blockchain/networks';
import type { Address } from 'viem';

/**
 * Query keys for balance-related queries
 */
export const balanceKeys = {
  all: ['balances'] as const,
  native: (address: string, networkId: string) => 
    [...balanceKeys.all, 'native', address, networkId] as const,
  token: (address: string, tokenAddress: string, networkId: string) => 
    [...balanceKeys.all, 'token', address, tokenAddress, networkId] as const,
  allTokens: (address: string, networkId: string) =>
    [...balanceKeys.all, 'tokens', address, networkId] as const,
};

/**
 * Options for balance hook
 */
interface UseBalanceOptions {
  /** Wallet address to fetch balance for */
  address?: string;
  /** Network to fetch from (defaults to Sepolia) */
  networkId?: string;
  /** Enable/disable the query */
  enabled?: boolean;
  /** Refetch interval in milliseconds (default: 30 seconds) */
  refetchInterval?: number;
}

/**
 * Hook to fetch native currency balance (ETH)
 */
export function useBalance({
  address,
  networkId = DEFAULT_NETWORK_ID,
  enabled = true,
  refetchInterval = 30_000,
}: UseBalanceOptions = {}) {
  return useQuery<BalanceResult, Error>({
    queryKey: balanceKeys.native(address ?? '', networkId),
    queryFn: async () => {
      if (!address) {
        throw new Error('No address provided');
      }
      return getBalance(address as Address, networkId);
    },
    enabled: enabled && !!address,
    refetchInterval,
    staleTime: 10_000, // Consider data stale after 10 seconds
    gcTime: 5 * 60_000, // Keep in cache for 5 minutes
  });
}

/**
 * Options for token balance hook
 */
interface UseTokenBalanceOptions extends UseBalanceOptions {
  /** Token contract address */
  tokenAddress?: string;
}

/**
 * Hook to fetch ERC-20 token balance
 */
export function useTokenBalance({
  address,
  tokenAddress,
  networkId = DEFAULT_NETWORK_ID,
  enabled = true,
  refetchInterval = 30_000,
}: UseTokenBalanceOptions = {}) {
  return useQuery<TokenBalanceResult, Error>({
    queryKey: balanceKeys.token(address ?? '', tokenAddress ?? '', networkId),
    queryFn: async () => {
      if (!address || !tokenAddress) {
        throw new Error('Address and token address are required');
      }
      return getTokenBalance(address as Address, tokenAddress as Address, networkId);
    },
    enabled: enabled && !!address && !!tokenAddress,
    refetchInterval,
    staleTime: 10_000,
    gcTime: 5 * 60_000,
  });
}

/**
 * Token configuration for multi-token fetching
 */
export interface TokenConfig {
  address: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
}

/**
 * Combined balance result for dashboard display
 */
export interface WalletBalances {
  native: BalanceResult | null;
  tokens: Array<TokenBalanceResult & { address: string; logoUrl?: string }>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to invalidate all balance queries for a wallet
 */
export function useInvalidateBalances() {
  const queryClient = useQueryClient();

  return (address?: string, networkId?: string) => {
    if (address && networkId) {
      // Invalidate specific wallet/network
      queryClient.invalidateQueries({
        queryKey: balanceKeys.native(address, networkId),
      });
      queryClient.invalidateQueries({
        queryKey: balanceKeys.allTokens(address, networkId),
      });
    } else {
      // Invalidate all balances
      queryClient.invalidateQueries({
        queryKey: balanceKeys.all,
      });
    }
  };
}

/**
 * Format balance for display with appropriate precision
 */
export function formatDisplayBalance(value: number, symbol: string): string {
  if (value === 0) {
    return `0 ${symbol}`;
  }

  if (value < 0.0001) {
    return `<0.0001 ${symbol}`;
  }

  if (value < 1) {
    return `${value.toFixed(4)} ${symbol}`;
  }

  if (value < 1000) {
    return `${value.toFixed(4)} ${symbol}`;
  }

  if (value < 1_000_000) {
    return `${(value / 1000).toFixed(2)}K ${symbol}`;
  }

  return `${(value / 1_000_000).toFixed(2)}M ${symbol}`;
}

/**
 * Format USD value for display
 */
export function formatUsdValue(value: number): string {
  if (value < 0.01) {
    return '<$0.01';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
