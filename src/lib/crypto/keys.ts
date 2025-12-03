import { secp256r1 } from '@noble/curves/p256'
import { keccak_256 } from '@noble/hashes/sha3'
import { bytesToHex } from '@noble/hashes/utils'
import { WalletError, WalletErrorCode } from '@/types'
import type { KeyPair, Signature } from '@/types'

/**
 * Cryptographic operations using secp256r1 (P-256) curve
 * Compatible with EIP-7212 for hardware security module integration
 */

/**
 * Generate a new secp256r1 key pair
 */
export function generateKeyPair(): KeyPair {
  try {
    const privateKey = secp256r1.utils.randomPrivateKey()
    const publicKey = secp256r1.getPublicKey(privateKey, false) // Uncompressed format

    return {
      privateKey,
      publicKey,
    }
  } catch (error) {
    throw new WalletError(
      'Failed to generate key pair',
      WalletErrorCode.KEY_GENERATION_FAILED,
      error
    )
  }
}

/**
 * Derive Ethereum address from secp256r1 public key
 * 
 * Process:
 * 1. Remove the 0x04 prefix from uncompressed public key
 * 2. Hash the public key with Keccak-256
 * 3. Take the last 20 bytes as the Ethereum address
 * 
 * @param publicKey - Uncompressed public key (65 bytes starting with 0x04)
 * @returns Ethereum address (0x prefixed hex string)
 */
export function deriveAddressFromPublicKey(publicKey: Uint8Array): string {
  try {
    if (publicKey.length !== 65 || publicKey[0] !== 0x04) {
      throw new Error('Invalid public key format. Expected 65 bytes starting with 0x04')
    }

    // Remove the 0x04 prefix
    const publicKeyWithoutPrefix = publicKey.slice(1)

    // Hash with Keccak-256
    const hash = keccak_256(publicKeyWithoutPrefix)

    // Take last 20 bytes
    const addressBytes = hash.slice(-20)

    // Convert to hex with 0x prefix
    return '0x' + bytesToHex(addressBytes)
  } catch (error) {
    throw new WalletError(
      'Failed to derive address from public key',
      WalletErrorCode.KEY_GENERATION_FAILED,
      error
    )
  }
}

/**
 * Derive address from WebAuthn credential public key
 * WebAuthn returns public key in COSE format, we need to extract the raw coordinates
 */
export function deriveAddressFromWebAuthnPublicKey(cosePublicKey: Uint8Array): string {
  try {
    // Parse COSE key format
    // For ES256, the format is:
    // - First bytes are CBOR map headers
    // - x coordinate (32 bytes)
    // - y coordinate (32 bytes)
    
    // For now, we'll use a simplified extraction
    // In production, use a proper COSE parser library
    const publicKeyHex = bytesToHex(cosePublicKey)
    
    // Extract x and y coordinates from COSE format
    // This is a simplified version - in production use cbor library
    const xStart = publicKeyHex.indexOf('2001') + 4
    const x = publicKeyHex.slice(xStart, xStart + 64)
    const y = publicKeyHex.slice(xStart + 64, xStart + 128)
    
    // Construct uncompressed public key (0x04 || x || y)
    const uncompressedKey = new Uint8Array(65)
    uncompressedKey[0] = 0x04
    uncompressedKey.set(hexToBytes(x), 1)
    uncompressedKey.set(hexToBytes(y), 33)
    
    return deriveAddressFromPublicKey(uncompressedKey)
  } catch (error) {
    throw new WalletError(
      'Failed to derive address from WebAuthn public key',
      WalletErrorCode.KEY_GENERATION_FAILED,
      error
    )
  }
}

/**
 * Sign a message hash with secp256r1 private key
 * 
 * @param messageHash - Hash of the message to sign (32 bytes)
 * @param privateKey - secp256r1 private key
 * @returns Signature with v, r, s components
 */
export function signMessageHash(
  messageHash: Uint8Array,
  privateKey: Uint8Array
): Signature {
  try {
    if (messageHash.length !== 32) {
      throw new Error('Message hash must be 32 bytes')
    }

    const signature = secp256r1.sign(messageHash, privateKey)

    return {
      r: signature.r,
      s: signature.s,
      v: signature.recovery ? signature.recovery + 27 : 27, // Ethereum convention
    }
  } catch (error) {
    throw new WalletError(
      'Failed to sign message',
      WalletErrorCode.SIGNING_FAILED,
      error
    )
  }
}

/**
 * Verify a signature against a message hash and public key
 */
export function verifySignature(
  messageHash: Uint8Array,
  signature: Signature,
  publicKey: Uint8Array
): boolean {
  try {
    const sig = new secp256r1.Signature(signature.r, signature.s)
    const result = sig.addRecoveryBit(signature.v - 27)
    return secp256r1.verify(result.toCompactRawBytes(), messageHash, publicKey)
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Normalize address to checksum format
 */
export function toChecksumAddress(address: string): string {
  if (!isValidAddress(address)) {
    throw new WalletError(
      'Invalid Ethereum address',
      WalletErrorCode.INVALID_ADDRESS
    )
  }

  const addr = address.toLowerCase().replace('0x', '')
  const hash = bytesToHex(keccak_256(new TextEncoder().encode(addr)))

  let checksum = '0x'
  for (let i = 0; i < addr.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      checksum += addr[i].toUpperCase()
    } else {
      checksum += addr[i]
    }
  }

  return checksum
}
