/**
 * Provider Unit Tests
 * 
 * Tests for the blockchain provider service.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getPublicClient,
  clearClientCache,
  getBalance,
  getTokenBalance,
  getBlockNumber,
  getGasPrice,
  getNetworkInfo,
} from '../provider';
import { DEFAULT_NETWORK_ID, networks } from '../networks';

// Mock viem
vi.mock('viem', () => ({
  createPublicClient: vi.fn(() => ({
    getBalance: vi.fn().mockResolvedValue(BigInt('1000000000000000000')), // 1 ETH
    getBlockNumber: vi.fn().mockResolvedValue(BigInt(1000000)),
    getGasPrice: vi.fn().mockResolvedValue(BigInt(20000000000)), // 20 gwei
    getCode: vi.fn().mockResolvedValue('0x'),
    getTransactionCount: vi.fn().mockResolvedValue(5),
    readContract: vi.fn().mockImplementation(async ({ functionName }) => {
      if (functionName === 'balanceOf') return BigInt('5000000000000000000');
      if (functionName === 'decimals') return 18;
      if (functionName === 'symbol') return 'TEST';
      return BigInt(0);
    }),
    waitForTransactionReceipt: vi.fn().mockResolvedValue({ status: 'success' }),
  })),
  http: vi.fn(),
  formatEther: vi.fn((value: bigint) => (Number(value) / 1e18).toString()),
  formatUnits: vi.fn((value: bigint, decimals: number) => 
    (Number(value) / Math.pow(10, decimals)).toString()
  ),
}));

describe('Blockchain Provider', () => {
  beforeEach(() => {
    clearClientCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearClientCache();
  });

  describe('getPublicClient', () => {
    it('should create a client for default network', () => {
      const client = getPublicClient();
      expect(client).toBeDefined();
    });

    it('should create a client for specific network', () => {
      const client = getPublicClient('base-sepolia');
      expect(client).toBeDefined();
    });

    it('should cache clients', () => {
      const client1 = getPublicClient('sepolia');
      const client2 = getPublicClient('sepolia');
      expect(client1).toBe(client2);
    });

    it('should create different clients for different networks', () => {
      const client1 = getPublicClient('sepolia');
      const client2 = getPublicClient('base-sepolia');
      expect(client1).not.toBe(client2);
    });

    it('should throw for unknown network', () => {
      expect(() => getPublicClient('unknown-network')).toThrow('Unknown network');
    });
  });

  describe('clearClientCache', () => {
    it('should clear cached clients', () => {
      const client1 = getPublicClient('sepolia');
      clearClientCache();
      const client2 = getPublicClient('sepolia');
      // After clearing, a new client should be created
      expect(client1).not.toBe(client2);
    });
  });

  describe('getBalance', () => {
    it('should fetch balance for an address', async () => {
      const result = await getBalance(
        '0x1234567890123456789012345678901234567890' as `0x${string}`,
        'sepolia'
      );

      expect(result).toBeDefined();
      expect(result.raw).toBe(BigInt('1000000000000000000'));
      expect(result.formatted).toBe('1');
      expect(result.value).toBe(1);
      expect(result.symbol).toBe('ETH');
    });

    it('should use default network when not specified', async () => {
      const result = await getBalance(
        '0x1234567890123456789012345678901234567890' as `0x${string}`
      );

      expect(result.symbol).toBe(networks[DEFAULT_NETWORK_ID].nativeCurrency.symbol);
    });

    it('should throw for unknown network', async () => {
      await expect(
        getBalance(
          '0x1234567890123456789012345678901234567890' as `0x${string}`,
          'unknown'
        )
      ).rejects.toThrow('Unknown network');
    });
  });

  describe('getTokenBalance', () => {
    it('should fetch token balance', async () => {
      const result = await getTokenBalance(
        '0x1234567890123456789012345678901234567890' as `0x${string}`,
        '0xabcdef1234567890123456789012345678901234' as `0x${string}`,
        'sepolia'
      );

      expect(result).toBeDefined();
      expect(result.raw).toBe(BigInt('5000000000000000000'));
      expect(result.formatted).toBe('5');
      expect(result.value).toBe(5);
      expect(result.symbol).toBe('TEST');
      expect(result.decimals).toBe(18);
    });
  });

  describe('getBlockNumber', () => {
    it('should fetch current block number', async () => {
      const blockNumber = await getBlockNumber('sepolia');
      expect(blockNumber).toBe(BigInt(1000000));
    });
  });

  describe('getGasPrice', () => {
    it('should fetch current gas price', async () => {
      const gasPrice = await getGasPrice('sepolia');
      expect(gasPrice).toBe(BigInt(20000000000));
    });
  });

  describe('getNetworkInfo', () => {
    it('should return network info for valid network', () => {
      const info = getNetworkInfo('sepolia');
      expect(info).toBeDefined();
      expect(info?.id).toBe('sepolia');
      expect(info?.name).toBe('Sepolia');
    });

    it('should return undefined for unknown network', () => {
      const info = getNetworkInfo('unknown');
      expect(info).toBeUndefined();
    });

    it('should return default network info when not specified', () => {
      const info = getNetworkInfo();
      expect(info?.id).toBe(DEFAULT_NETWORK_ID);
    });
  });
});
