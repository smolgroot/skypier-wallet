/**
 * Encrypted Storage Service
 * 
 * Provides secure, encrypted storage for sensitive wallet data using the Web Crypto API.
 * Encryption keys are derived from WebAuthn credentials to ensure data can only be
 * decrypted after successful biometric authentication.
 */

import type { Wallet } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  WALLETS: 'skypier_wallets',
  ACTIVE_WALLET: 'skypier_active_wallet',
  CREDENTIALS: 'skypier_credentials',
  SALT: 'skypier_salt',
} as const;

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12,
  saltLength: 16,
  iterations: 100000,
} as const;

/**
 * Generates a cryptographic salt for key derivation
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength));
}

/**
 * Retrieves the salt from storage or generates a new one
 */
async function getSalt(): Promise<Uint8Array> {
  const storedSalt = localStorage.getItem(STORAGE_KEYS.SALT);
  
  if (storedSalt) {
    return Uint8Array.from(atob(storedSalt), c => c.charCodeAt(0));
  }
  
  const newSalt = generateSalt();
  localStorage.setItem(STORAGE_KEYS.SALT, btoa(String.fromCharCode(...newSalt)));
  return newSalt;
}

/**
 * Derives an encryption key from a password using PBKDF2
 * 
 * @param password - The password/passphrase to derive the key from
 * @param salt - Cryptographic salt for key derivation
 * @returns CryptoKey suitable for AES-GCM encryption/decryption
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import password as a key
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive encryption key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: ENCRYPTION_CONFIG.iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: ENCRYPTION_CONFIG.algorithm,
      length: ENCRYPTION_CONFIG.keyLength,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-GCM
 * 
 * @param data - Data to encrypt (will be JSON stringified)
 * @param key - CryptoKey for encryption
 * @returns Base64-encoded encrypted data with IV prepended
 */
async function encrypt<T>(data: T, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));
  
  // Generate initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength));
  
  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv,
    },
    key,
    dataBuffer
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);
  
  // Return as base64 string
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts data using AES-GCM
 * 
 * @param encryptedData - Base64-encoded encrypted data with IV prepended
 * @param key - CryptoKey for decryption
 * @returns Decrypted and parsed data
 */
async function decrypt<T>(encryptedData: string, key: CryptoKey): Promise<T> {
  // Decode base64
  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  
  // Extract IV and encrypted data
  const iv = combined.slice(0, ENCRYPTION_CONFIG.ivLength);
  const data = combined.slice(ENCRYPTION_CONFIG.ivLength);
  
  // Decrypt the data
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv,
    },
    key,
    data
  );
  
  // Parse and return
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(decryptedBuffer);
  return JSON.parse(jsonString);
}

/**
 * Stores encrypted wallet data
 * 
 * @param wallets - Array of wallets to store
 * @param password - Password for encryption (typically derived from credential)
 */
export async function storeWallets(wallets: Wallet[], password: string): Promise<void> {
  const salt = await getSalt();
  const key = await deriveKey(password, salt);
  const encrypted = await encrypt(wallets, key);
  localStorage.setItem(STORAGE_KEYS.WALLETS, encrypted);
}

/**
 * Retrieves and decrypts wallet data
 * 
 * @param password - Password for decryption
 * @returns Array of decrypted wallets or empty array if none exist
 */
export async function retrieveWallets(password: string): Promise<Wallet[]> {
  const encrypted = localStorage.getItem(STORAGE_KEYS.WALLETS);
  
  if (!encrypted) {
    return [];
  }
  
  try {
    const salt = await getSalt();
    const key = await deriveKey(password, salt);
    return await decrypt<Wallet[]>(encrypted, key);
  } catch (error) {
    console.error('Failed to decrypt wallets:', error);
    throw new Error('DECRYPTION_FAILED');
  }
}

/**
 * Stores the active wallet address
 * 
 * @param address - Ethereum address of the active wallet
 */
export function storeActiveWallet(address: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_WALLET, address);
}

/**
 * Retrieves the active wallet address
 * 
 * @returns Ethereum address or null if no active wallet
 */
export function retrieveActiveWallet(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_WALLET);
}

/**
 * Stores WebAuthn credential ID mapping
 * 
 * @param walletAddress - Ethereum address
 * @param credentialId - Base64-encoded WebAuthn credential ID
 * @param password - Password for encryption
 */
export async function storeCredential(
  walletAddress: string,
  credentialId: string,
  password: string
): Promise<void> {
  const salt = await getSalt();
  const key = await deriveKey(password, salt);
  
  // Retrieve existing credentials
  const existingEncrypted = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
  let credentials: Record<string, string> = {};
  
  if (existingEncrypted) {
    try {
      credentials = await decrypt<Record<string, string>>(existingEncrypted, key);
    } catch {
      // If decryption fails, start fresh
      credentials = {};
    }
  }
  
  // Add new credential
  credentials[walletAddress] = credentialId;
  
  // Store encrypted
  const encrypted = await encrypt(credentials, key);
  localStorage.setItem(STORAGE_KEYS.CREDENTIALS, encrypted);
}

/**
 * Retrieves WebAuthn credential ID for a wallet
 * 
 * @param walletAddress - Ethereum address
 * @param password - Password for decryption
 * @returns Base64-encoded credential ID or null if not found
 */
export async function retrieveCredential(
  walletAddress: string,
  password: string
): Promise<string | null> {
  const encrypted = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
  
  if (!encrypted) {
    return null;
  }
  
  try {
    const salt = await getSalt();
    const key = await deriveKey(password, salt);
    const credentials = await decrypt<Record<string, string>>(encrypted, key);
    return credentials[walletAddress] || null;
  } catch (error) {
    console.error('Failed to decrypt credentials:', error);
    return null;
  }
}

/**
 * Checks if encrypted wallets exist in storage
 */
export function hasStoredWallets(): boolean {
  return localStorage.getItem(STORAGE_KEYS.WALLETS) !== null;
}

/**
 * Clears all wallet data from storage (use with caution!)
 */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Derives a password from a WebAuthn credential ID
 * This creates a consistent password that can be used for encryption/decryption
 * after biometric authentication
 * 
 * @param credentialId - Base64-encoded credential ID
 * @returns Password string suitable for encryption key derivation
 */
export async function derivePasswordFromCredential(credentialId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(credentialId);
  
  // Hash the credential ID to create a password
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // Convert to base64 string
  return btoa(String.fromCharCode(...hashArray));
}
