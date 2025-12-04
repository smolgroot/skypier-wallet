/**
 * Transaction Service
 *
 * Handles transaction building, gas estimation, and sending transactions.
 * Uses viem for all blockchain interactions.
 */

import {
  createWalletClient,
  http,
  parseEther,
  formatEther,
  type Address,
  type Hash,
  type TransactionRequest,
  isAddress,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getPublicClient } from './provider';
import { networks, DEFAULT_NETWORK_ID, type NetworkConfig } from './networks';

/**
 * Parameters for sending a transaction
 */
export interface SendTransactionParams {
  from: Address;
  to: Address;
  amount: string;
  networkId?: string;
  data?: `0x${string}`;
}

/**
 * Gas estimation result
 */
export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedCost: bigint;
  estimatedCostFormatted: string;
}

/**
 * Transaction result after sending
 */
export interface TransactionResult {
  hash: Hash;
  networkId: string;
  explorerUrl: string;
}

export function isValidAddress(address: string): boolean {
  if (!address) return false;
  return isAddress(address);
}

export function formatAddress(address: string, chars: number = 4): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function parseAmount(amount: string): bigint {
  if (!amount || amount.trim() === '') {
    throw new Error('Amount is required');
  }
  const trimmed = amount.trim();
  if (!/^[0-9]*\.?[0-9]+$/.test(trimmed)) {
    throw new Error('Invalid amount format');
  }
  const num = parseFloat(trimmed);
  if (isNaN(num) || num < 0) {
    throw new Error('Amount must be a positive number');
  }
  if (num === 0) {
    throw new Error('Amount must be greater than 0');
  }
  return parseEther(trimmed);
}

export function isValidAmount(
  amount: string,
  balanceWei: bigint,
  estimatedGasWei?: bigint
): { valid: boolean; error?: string } {
  try {
    const amountWei = parseAmount(amount);
    const totalNeeded = estimatedGasWei ? amountWei + estimatedGasWei : amountWei;
    if (totalNeeded > balanceWei) {
      return { valid: false, error: 'Insufficient balance' };
    }
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid amount',
    };
  }
}

export function getNetwork(networkId: string = DEFAULT_NETWORK_ID): NetworkConfig {
  const network = networks[networkId];
  if (!network) {
    throw new Error(`Unknown network: ${networkId}`);
  }
  return network;
}

export async function estimateGas(
  params: Omit<SendTransactionParams, 'from'> & { from?: Address }
): Promise<GasEstimate> {
  const networkId = params.networkId ?? DEFAULT_NETWORK_ID;
  const client = getPublicClient(networkId);
  const value = parseAmount(params.amount);
  const txRequest: TransactionRequest = {
    to: params.to,
    value,
    data: params.data,
  };
  if (params.from) {
    txRequest.from = params.from;
  }
  const [gasLimit, gasPrice, feeData] = await Promise.all([
    client.estimateGas(txRequest),
    client.getGasPrice(),
    client.estimateFeesPerGas().catch(() => null),
  ]);
  const maxFeePerGas = feeData?.maxFeePerGas ?? gasPrice;
  const maxPriorityFeePerGas = feeData?.maxPriorityFeePerGas ?? 0n;
  const estimatedCost = gasLimit * maxFeePerGas;
  return {
    gasLimit,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    estimatedCost,
    estimatedCostFormatted: formatEther(estimatedCost),
  };
}

export function buildTransaction(
  params: SendTransactionParams,
  gasEstimate: GasEstimate
): TransactionRequest {
  const value = parseAmount(params.amount);
  return {
    from: params.from,
    to: params.to,
    value,
    gas: gasEstimate.gasLimit,
    maxFeePerGas: gasEstimate.maxFeePerGas,
    maxPriorityFeePerGas: gasEstimate.maxPriorityFeePerGas,
    data: params.data,
  };
}

export async function sendTransaction(
  params: SendTransactionParams,
  privateKey: `0x${string}`
): Promise<TransactionResult> {
  const networkId = params.networkId ?? DEFAULT_NETWORK_ID;
  const network = getNetwork(networkId);
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: network.chain,
    transport: http(network.rpcUrl),
  });
  const value = parseAmount(params.amount);
  const hash = await walletClient.sendTransaction({
    to: params.to,
    value,
    data: params.data,
  });
  return {
    hash,
    networkId,
    explorerUrl: `${network.explorerUrl}/tx/${hash}`,
  };
}

export function formatWeiToEth(wei: bigint, decimals: number = 6): string {
  const eth = formatEther(wei);
  const num = parseFloat(eth);
  if (num === 0) return '0';
  if (num < 0.000001) return '< 0.000001';
  return num.toFixed(decimals).replace(/\.?0+$/, '');
}

export function getExplorerTxUrl(hash: Hash, networkId: string = DEFAULT_NETWORK_ID): string {
  const network = getNetwork(networkId);
  return `${network.explorerUrl}/tx/${hash}`;
}

export function getExplorerAddressUrl(address: Address, networkId: string = DEFAULT_NETWORK_ID): string {
  const network = getNetwork(networkId);
  return `${network.explorerUrl}/address/${address}`;
}
