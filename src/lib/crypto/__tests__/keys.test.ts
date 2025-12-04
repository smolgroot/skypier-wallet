/**
 * Crypto Keys Service Tests
 * 
 * Tests for secp256r1 key generation and Ethereum address derivation.
 * Covers US-001: Create New Biometric Wallet
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateKeyPair,
  deriveAddressFromPublicKey,
  signMessageHash,
  verifySignature,
  isValidAddress,
  toChecksumAddress,
} from '../keys';
import type { Signature } from '@/types';

describe('Crypto Keys Service', () => {
  describe('generateKeyPair', () => {
    it('should generate valid secp256r1 key pair', () => {
      const { privateKey, publicKey } = generateKeyPair();

      expect(privateKey).toBeDefined();
      expect(publicKey).toBeDefined();
      expect(privateKey).toBeInstanceOf(Uint8Array);
      expect(publicKey).toBeInstanceOf(Uint8Array);
    });

    it('should generate unique key pairs on each call', () => {
      const keyPair1 = generateKeyPair();
      const keyPair2 = generateKeyPair();

      // Private keys should be different
      expect(Buffer.from(keyPair1.privateKey).toString('hex')).not.toBe(
        Buffer.from(keyPair2.privateKey).toString('hex')
      );

      // Public keys should be different
      expect(Buffer.from(keyPair1.publicKey).toString('hex')).not.toBe(
        Buffer.from(keyPair2.publicKey).toString('hex')
      );
    });

    it('should return 32-byte private key', () => {
      const { privateKey } = generateKeyPair();
      expect(privateKey.length).toBe(32);
    });

    it('should return 65-byte uncompressed public key', () => {
      const { publicKey } = generateKeyPair();
      // Uncompressed public key is 65 bytes (0x04 prefix + 32 bytes x + 32 bytes y)
      expect(publicKey.length).toBe(65);
      // First byte should be 0x04 (uncompressed format)
      expect(publicKey[0]).toBe(0x04);
    });
  });

  describe('deriveAddressFromPublicKey', () => {
    it('should derive valid Ethereum address from public key', () => {
      const { publicKey } = generateKeyPair();
      const address = deriveAddressFromPublicKey(publicKey);

      // Address should start with 0x
      expect(address.startsWith('0x')).toBe(true);
      // Address should be 42 characters (0x + 40 hex chars)
      expect(address.length).toBe(42);
      // Should be a valid address format
      expect(isValidAddress(address)).toBe(true);
    });

    it('should derive same address for same public key', () => {
      const { publicKey } = generateKeyPair();
      const address1 = deriveAddressFromPublicKey(publicKey);
      const address2 = deriveAddressFromPublicKey(publicKey);

      expect(address1).toBe(address2);
    });

    it('should derive different addresses for different public keys', () => {
      const keyPair1 = generateKeyPair();
      const keyPair2 = generateKeyPair();

      const address1 = deriveAddressFromPublicKey(keyPair1.publicKey);
      const address2 = deriveAddressFromPublicKey(keyPair2.publicKey);

      expect(address1).not.toBe(address2);
    });

    it('should throw error for invalid public key format', () => {
      const invalidKey = new Uint8Array(32); // Wrong length
      expect(() => deriveAddressFromPublicKey(invalidKey)).toThrow();
    });
  });

  describe('signMessageHash', () => {
    let privateKey: Uint8Array;
    let messageHash: Uint8Array;

    beforeEach(() => {
      const keyPair = generateKeyPair();
      privateKey = keyPair.privateKey;
      // Create a 32-byte message hash (simulating keccak256 output)
      messageHash = new Uint8Array(32);
      crypto.getRandomValues(messageHash);
    });

    it('should sign a message hash', () => {
      const signature = signMessageHash(messageHash, privateKey);

      expect(signature).toBeDefined();
      expect(signature.r).toBeDefined();
      expect(signature.s).toBeDefined();
      expect(signature.v).toBeDefined();
      expect(typeof signature.r).toBe('bigint');
      expect(typeof signature.s).toBe('bigint');
      expect(typeof signature.v).toBe('number');
    });

    it('should produce different signatures for different messages', () => {
      const messageHash2 = new Uint8Array(32);
      crypto.getRandomValues(messageHash2);

      const sig1 = signMessageHash(messageHash, privateKey);
      const sig2 = signMessageHash(messageHash2, privateKey);

      // r or s should be different (or both)
      expect(sig1.r !== sig2.r || sig1.s !== sig2.s).toBe(true);
    });

    it('should throw error for invalid message hash length', () => {
      const invalidHash = new Uint8Array(16); // Wrong length
      expect(() => signMessageHash(invalidHash, privateKey)).toThrow();
    });
  });

  describe('verifySignature', () => {
    it('should verify a valid signature', () => {
      const { privateKey, publicKey } = generateKeyPair();
      const messageHash = new Uint8Array(32);
      crypto.getRandomValues(messageHash);

      const signature = signMessageHash(messageHash, privateKey);
      const isValid = verifySignature(messageHash, signature, publicKey);

      expect(isValid).toBe(true);
    });

    it('should reject signature with wrong public key', () => {
      const keyPair1 = generateKeyPair();
      const keyPair2 = generateKeyPair();
      const messageHash = new Uint8Array(32);
      crypto.getRandomValues(messageHash);

      const signature = signMessageHash(messageHash, keyPair1.privateKey);
      const isValid = verifySignature(messageHash, signature, keyPair2.publicKey);

      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong message', () => {
      const { privateKey, publicKey } = generateKeyPair();
      const messageHash1 = new Uint8Array(32);
      const messageHash2 = new Uint8Array(32);
      crypto.getRandomValues(messageHash1);
      crypto.getRandomValues(messageHash2);

      const signature = signMessageHash(messageHash1, privateKey);
      const isValid = verifySignature(messageHash2, signature, publicKey);

      expect(isValid).toBe(false);
    });

    it('should reject tampered signature', () => {
      const { privateKey, publicKey } = generateKeyPair();
      const messageHash = new Uint8Array(32);
      crypto.getRandomValues(messageHash);

      const signature = signMessageHash(messageHash, privateKey);
      const tamperedSignature: Signature = {
        ...signature,
        r: signature.r + 1n, // Tamper with r
      };

      const isValid = verifySignature(messageHash, tamperedSignature, publicKey);
      expect(isValid).toBe(false);
    });
  });

  describe('isValidAddress', () => {
    it('should return true for valid address', () => {
      expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f8fBd7')).toBe(true);
    });

    it('should return false for address without 0x prefix', () => {
      expect(isValidAddress('742d35Cc6634C0532925a3b844Bc9e7595f8fBd7')).toBe(false);
    });

    it('should return false for address with wrong length', () => {
      expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f8')).toBe(false);
    });

    it('should return false for address with invalid characters', () => {
      expect(isValidAddress('0xGGGd35Cc6634C0532925a3b844Bc9e7595f8fBd7')).toBe(false);
    });
  });

  describe('toChecksumAddress', () => {
    it('should convert lowercase address to checksum format', () => {
      const lowercase = '0x742d35cc6634c0532925a3b844bc9e7595f8fbd7';
      const checksum = toChecksumAddress(lowercase);
      
      expect(checksum).toMatch(/^0x[0-9a-fA-F]{40}$/);
      expect(checksum.length).toBe(42);
    });

    it('should throw error for invalid address', () => {
      expect(() => toChecksumAddress('invalid')).toThrow();
    });
  });
});
