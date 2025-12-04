/**
 * Wallet Types
 */

export type WalletType = 'biometric' | 'imported'

export interface Wallet {
  address: string
  type: WalletType
  name?: string
  createdAt: number
  publicKey?: string
  credentialId?: string // For biometric wallets
  encryptedPrivateKey?: string // Encrypted secp256k1 private key for signing
}

export interface BiometricWallet extends Wallet {
  type: 'biometric'
  credentialId: string
  publicKey: string
  encryptedPrivateKey: string // Required for transaction signing
}

export interface ImportedWallet extends Wallet {
  type: 'imported'
  encryptedPrivateKey: string // Required for transaction signing
}

/**
 * Authentication Types
 */

export interface WebAuthnCredential {
  id: string
  publicKey: Uint8Array
  rawId: Uint8Array
}

export interface AuthSession {
  isAuthenticated: boolean
  walletAddress?: string
  expiresAt?: number
}

/**
 * Transaction Types
 */

export interface TransactionRequest {
  from: string
  to: string
  value: bigint
  data?: string
  gas?: bigint
  gasPrice?: bigint
  nonce?: number
  chainId: number
}

export interface SignedTransaction {
  hash: string
  from: string
  to: string
  value: bigint
  data: string
  gas: bigint
  gasPrice: bigint
  nonce: number
  chainId: number
  v: number
  r: string
  s: string
}

/**
 * Network Types
 */

export interface NetworkConfig {
  id: number
  name: string
  chainId: number
  rpcUrl: string
  explorerUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  testnet: boolean
  eip7212Supported: boolean
}

/**
 * Storage Types
 */

export interface StorageData {
  wallets: Wallet[]
  activeWalletAddress?: string
  sessionTimeout: number
  settings: UserSettings
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  currency: string
  sessionTimeout: number
  biometricRequired: boolean
}

/**
 * Crypto Types
 */

export interface KeyPair {
  privateKey: Uint8Array
  publicKey: Uint8Array
}

export interface Signature {
  r: bigint
  s: bigint
  v: number
}

/**
 * Error Types
 */

export const WalletErrorCode = {
  // WebAuthn errors
  WEBAUTHN_NOT_SUPPORTED: 'WEBAUTHN_NOT_SUPPORTED',
  WEBAUTHN_CREATION_FAILED: 'WEBAUTHN_CREATION_FAILED',
  WEBAUTHN_AUTH_FAILED: 'WEBAUTHN_AUTH_FAILED',
  WEBAUTHN_CANCELLED: 'WEBAUTHN_CANCELLED',
  
  // Crypto errors
  KEY_GENERATION_FAILED: 'KEY_GENERATION_FAILED',
  SIGNING_FAILED: 'SIGNING_FAILED',
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  
  // Storage errors
  STORAGE_ERROR: 'STORAGE_ERROR',
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED: 'DECRYPTION_FAILED',
  
  // Transaction errors
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  GAS_ESTIMATION_FAILED: 'GAS_ESTIMATION_FAILED',
  
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
} as const

export type WalletErrorCode = typeof WalletErrorCode[keyof typeof WalletErrorCode]

export class WalletError extends Error {
  code: WalletErrorCode
  details?: unknown

  constructor(
    message: string,
    code: WalletErrorCode,
    details?: unknown
  ) {
    super(message)
    this.name = 'WalletError'
    this.code = code
    this.details = details
  }
}
