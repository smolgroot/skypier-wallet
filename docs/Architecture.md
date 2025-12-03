# Architecture Documentation - Fusaka Wallet

> Technical architecture and design decisions for the secp256r1-enabled EVM wallet

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [Core Components](#core-components)
5. [Data Flow](#data-flow)
6. [Security Architecture](#security-architecture)
7. [Key Technical Decisions](#key-technical-decisions)
8. [API Integration](#api-integration)
9. [State Management](#state-management)
10. [Deployment Architecture](#deployment-architecture)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PWA Shell (React + Vite)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │   Presentation  │  │   Application   │  │   Domain      │  │
│  │   Layer (UI)    │  │   Layer         │  │   Layer       │  │
│  │                 │  │                 │  │               │  │
│  │ • React         │  │ • State Mgmt    │  │ • Wallet      │  │
│  │   Components    │  │ • Hooks         │  │   Logic       │  │
│  │ • MUI           │  │ • Services      │  │ • Crypto      │  │
│  │ • Emotion       │  │ • Utils         │  │   Operations  │  │
│  └─────────────────┘  └─────────────────┘  └───────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                     Infrastructure Layer                         │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐    │
│  │   Storage    │ │   Network    │ │   External APIs     │    │
│  │              │ │              │ │                     │    │
│  │ • IndexedDB  │ │ • RPC        │ │ • Blockscout       │    │
│  │ • LocalStore │ │ • WebSocket  │ │ • Price Feeds      │    │
│  │ • Encrypted  │ │ • HTTP       │ │ • Token Lists      │    │
│  └──────────────┘ └──────────────┘ └─────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         │                        │                         │
         ▼                        ▼                         ▼
┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Hardware       │   │  Blockchain      │   │  External        │
│  Security       │   │  Networks        │   │  Services        │
│  Module         │   │                  │   │                  │
│                 │   │ • Ethereum       │   │ • CoinGecko      │
│ • Secure        │   │ • Base           │   │ • ENS Registry   │
│   Enclave       │   │ • Optimism       │   │ • IPFS Gateway   │
│ • StrongBox     │   │ • Arbitrum       │   │                  │
└─────────────────┘   └──────────────────┘   └──────────────────┘
```

---

## Technology Stack

### Frontend Framework
- **React 18 + Vite**: Modern build tool with React
  - Fast HMR (Hot Module Replacement)
  - Optimized build output
  - Native ES modules
  - Excellent TypeScript support
  - Lightning-fast development experience

### Core Libraries

#### Blockchain & Crypto
```typescript
{
  "viem": "^2.x",              // Ethereum interactions
  "@noble/curves": "^1.x",     // secp256r1 curve operations
  "@noble/hashes": "^1.x",     // Cryptographic hashing
  "ethers": "^6.x",            // Fallback for some operations
}
```

#### UI & Styling
```typescript
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "@mui/material": "^6.x",     // Material-UI components
  "@mui/icons-material": "^6.x", // MUI icons
  "@emotion/react": "^11.x",   // CSS-in-JS (MUI dependency)
  "@emotion/styled": "^11.x",  // Styled components
}
```

#### State Management
```typescript
{
  "zustand": "^4.x",           // Global state
  "react-query": "^5.x",       // Server state & caching
}
```

#### PWA & Utilities
```typescript
{
  "vite-plugin-pwa": "^0.21.x", // PWA capabilities
  "qrcode.react": "^4.x",       // QR code generation
  "bip39": "^3.x",              // Mnemonic generation
  "date-fns": "^4.x",           // Date formatting
}
```

#### Testing
```typescript
{
  "vitest": "^1.x",
  "@testing-library/react": "^14.x",
  "@testing-library/user-event": "^14.x",
}
```

---

## Architecture Patterns

### 1. Clean Architecture
Separation of concerns across layers:

```
src/
├── pages/              # Page components (Presentation)
├── components/         # React components (Presentation)
│   ├── atoms/          # Basic UI elements
│   ├── molecules/      # Simple compositions
│   ├── organisms/      # Complex components
│   └── templates/      # Page layouts
├── hooks/              # Custom React hooks (Application)
├── services/           # Business logic (Application)
├── lib/                # Core domain logic (Domain)
│   ├── auth/           # Authentication (WebAuthn)
│   ├── crypto/         # Cryptographic operations
│   ├── blockchain/     # Blockchain interactions
│   └── storage/        # Encrypted storage
├── store/              # State management (Application)
├── theme/              # MUI theme configuration
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

### 2. Component Composition Pattern

```typescript
// Atomic Design structure
components/
├── atoms/           # Basic building blocks (Button, Input)
├── molecules/       # Simple compositions (AddressInput, BalanceCard)
├── organisms/       # Complex components (TransactionForm, WalletHeader)
├── templates/       # Page layouts
└── pages/           # Full pages (deprecated in App Router)
```

### 3. Service Layer Pattern

```typescript
// services/wallet.service.ts
export class WalletService {
  private cryptoService: CryptoService;
  private storageService: StorageService;
  
  async createBiometricWallet(): Promise<Wallet> {
    // Business logic here
  }
  
  async signTransaction(tx: Transaction): Promise<SignedTx> {
    // Business logic here
  }
}
```

---

## Core Components

### 1. Authentication System

#### WebAuthn Integration
```typescript
// lib/auth/webauthn.ts
export class WebAuthnService {
  /**
   * Creates a new credential in hardware security module
   * Uses secp256r1 (P-256) algorithm
   */
  async createCredential(
    userId: string,
    userName: string
  ): Promise<Credential> {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "Fusaka Wallet", id: window.location.hostname },
        user: {
          id: Uint8Array.from(userId, c => c.charCodeAt(0)),
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },  // ES256 (secp256r1)
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
      },
    });
    
    return this.parseCredential(credential);
  }
  
  /**
   * Authenticates user with biometric
   */
  async authenticate(credentialId: string): Promise<AuthResult> {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{
          type: "public-key",
          id: base64ToBuffer(credentialId),
        }],
        userVerification: "required",
        timeout: 60000,
      },
    });
    
    return this.verifyAssertion(assertion);
  }
}
```

#### Session Management
```typescript
// lib/auth/session.ts
export class SessionManager {
  private timeout: number = 5 * 60 * 1000; // 5 minutes
  private timerId: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();
  
  startSession(customTimeout?: number): void {
    if (customTimeout) this.timeout = customTimeout;
    this.resetTimer();
    this.setupActivityListeners();
  }
  
  private resetTimer(): void {
    if (this.timerId) clearTimeout(this.timerId);
    
    this.timerId = setTimeout(() => {
      this.endSession();
    }, this.timeout);
  }
  
  private setupActivityListeners(): void {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    events.forEach(event => {
      window.addEventListener(event, this.handleActivity);
    });
  }
  
  private handleActivity = (): void => {
    const now = Date.now();
    if (now - this.lastActivity > 1000) { // Throttle
      this.lastActivity = now;
      this.resetTimer();
    }
  };
  
  endSession(): void {
    // Clear sensitive data from memory
    this.clearSensitiveData();
    // Redirect to lock screen
    window.location.href = '/lock';
  }
}
```

### 2. Wallet Core

#### Key Management
```typescript
// lib/crypto/keys.ts
import { secp256r1 } from '@noble/curves/p256';
import { keccak_256 } from '@noble/hashes/sha3';

export class KeyManager {
  /**
   * Derives Ethereum address from secp256r1 public key
   * EIP-7212 compatible
   */
  deriveAddress(publicKey: Uint8Array): string {
    // Public key is 65 bytes (0x04 + 32 bytes X + 32 bytes Y)
    // Remove the 0x04 prefix
    const uncompressed = publicKey.slice(1);
    
    // Keccak256 hash
    const hash = keccak_256(uncompressed);
    
    // Take last 20 bytes
    const address = hash.slice(-20);
    
    return '0x' + Buffer.from(address).toString('hex');
  }
  
  /**
   * Signs transaction hash with secp256r1
   */
  async signHash(
    hash: Uint8Array,
    privateKey: Uint8Array
  ): Promise<{ r: bigint; s: bigint; v: number }> {
    const signature = secp256r1.sign(hash, privateKey);
    
    return {
      r: signature.r,
      s: signature.s,
      v: signature.recovery + 27, // Ethereum convention
    };
  }
}
```

#### Transaction Builder
```typescript
// lib/blockchain/transaction.ts
import { createPublicClient, createWalletClient, type Transaction } from 'viem';

export class TransactionBuilder {
  /**
   * Builds unsigned transaction
   */
  async buildTransaction(params: {
    from: Address;
    to: Address;
    value: bigint;
    data?: Hex;
    chainId: number;
  }): Promise<Transaction> {
    const client = this.getClient(params.chainId);
    
    // Get current gas price
    const gasPrice = await client.getGasPrice();
    
    // Estimate gas
    const gasLimit = await client.estimateGas({
      account: params.from,
      to: params.to,
      value: params.value,
      data: params.data,
    });
    
    // Get nonce
    const nonce = await client.getTransactionCount({
      address: params.from,
    });
    
    return {
      from: params.from,
      to: params.to,
      value: params.value,
      data: params.data || '0x',
      gasLimit,
      gasPrice,
      nonce,
      chainId: params.chainId,
    };
  }
  
  /**
   * Signs transaction with secp256r1
   * Uses EIP-7212 precompile for verification
   */
  async signTransaction(
    tx: Transaction,
    signer: BiometricSigner
  ): Promise<SignedTransaction> {
    // Serialize transaction
    const serialized = this.serializeTransaction(tx);
    
    // Hash the serialized transaction
    const hash = keccak_256(serialized);
    
    // Sign with biometric authentication
    const signature = await signer.sign(hash);
    
    // Verify signature using EIP-7212 precompile
    await this.verifySignature(signature, hash, signer.publicKey);
    
    return {
      ...tx,
      signature,
    };
  }
  
  /**
   * Calls EIP-7212 precompile for signature verification
   */
  private async verifySignature(
    signature: Signature,
    hash: Uint8Array,
    publicKey: Uint8Array
  ): Promise<void> {
    const EIP7212_PRECOMPILE = '0x0000000000000000000000000000000000000100';
    
    // Format input for precompile
    const input = this.formatPrecompileInput(hash, signature, publicKey);
    
    const client = this.getClient(this.currentChainId);
    
    // Call precompile
    const result = await client.call({
      to: EIP7212_PRECOMPILE,
      data: input,
    });
    
    if (result.data !== '0x01') {
      throw new Error('Signature verification failed');
    }
  }
}
```

### 3. Storage Layer

#### Encrypted Storage
```typescript
// lib/storage/encrypted.ts
export class EncryptedStorage {
  private readonly ENCRYPTION_KEY = 'fusaka_wallet_encryption_key';
  
  /**
   * Encrypts and stores sensitive data
   */
  async setItem(key: string, value: any): Promise<void> {
    const encryptionKey = await this.getEncryptionKey();
    const encrypted = await this.encrypt(JSON.stringify(value), encryptionKey);
    
    localStorage.setItem(key, encrypted);
  }
  
  /**
   * Retrieves and decrypts data
   */
  async getItem<T>(key: string): Promise<T | null> {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    const encryptionKey = await this.getEncryptionKey();
    const decrypted = await this.decrypt(encrypted, encryptionKey);
    
    return JSON.parse(decrypted);
  }
  
  /**
   * Generates or retrieves encryption key from WebAuthn credential
   */
  private async getEncryptionKey(): Promise<CryptoKey> {
    // Derive key from user's biometric credential
    // This ensures data is only accessible when user authenticates
    const credential = await this.getUserCredential();
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      credential.publicKey,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new Uint8Array(16),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  private async encrypt(data: string, key: CryptoKey): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    
    // Combine IV and ciphertext
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    return Buffer.from(combined).toString('base64');
  }
  
  private async decrypt(data: string, key: CryptoKey): Promise<string> {
    const combined = Buffer.from(data, 'base64');
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    
    return new TextDecoder().decode(decrypted);
  }
}
```

### 4. Network Management

```typescript
// lib/blockchain/network.ts
export interface NetworkConfig {
  id: number;
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  testnet: boolean;
  eip7212Supported: boolean; // EIP-7212 support indicator
}

export const NETWORKS: Record<string, NetworkConfig> = {
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    chainId: 11155111,
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL!,
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: true,
    eip7212Supported: true,
  },
  baseSepolia: {
    id: 84532,
    name: 'Base Sepolia',
    chainId: 84532,
    rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL!,
    explorerUrl: 'https://sepolia.basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: true,
    eip7212Supported: true,
  },
  // MVP networks
  ethereum: {
    id: 1,
    name: 'Ethereum',
    chainId: 1,
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL!,
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    eip7212Supported: true,
  },
  base: {
    id: 8453,
    name: 'Base',
    chainId: 8453,
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL!,
    explorerUrl: 'https://basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    eip7212Supported: true,
  },
};

export class NetworkManager {
  private currentNetwork: NetworkConfig;
  private clients: Map<number, PublicClient> = new Map();
  
  switchNetwork(networkId: number): void {
    const network = Object.values(NETWORKS).find(n => n.id === networkId);
    if (!network) throw new Error('Network not found');
    
    this.currentNetwork = network;
    this.emit('networkChanged', network);
  }
  
  getClient(chainId?: number): PublicClient {
    const id = chainId || this.currentNetwork.chainId;
    
    if (!this.clients.has(id)) {
      const network = Object.values(NETWORKS).find(n => n.chainId === id);
      if (!network) throw new Error('Network not configured');
      
      const client = createPublicClient({
        chain: this.viemChainConfig(network),
        transport: http(network.rpcUrl),
      });
      
      this.clients.set(id, client);
    }
    
    return this.clients.get(id)!;
  }
}
```

---

## Data Flow

### Transaction Flow Diagram

```
User Action (Send ETH)
        │
        ▼
┌───────────────────┐
│  UI Component     │
│  (SendForm)       │
└────────┬──────────┘
         │ 1. Submit form
         ▼
┌───────────────────┐
│  Transaction      │
│  Service          │
└────────┬──────────┘
         │ 2. Build transaction
         ▼
┌───────────────────┐
│  Network Manager  │ ← Get gas price, nonce, etc.
└────────┬──────────┘
         │ 3. Transaction built
         ▼
┌───────────────────┐
│  Wallet Service   │
└────────┬──────────┘
         │ 4. Request signature
         ▼
┌───────────────────┐
│  Biometric Auth   │ ← User provides Face ID/Fingerprint
│  (WebAuthn)       │
└────────┬──────────┘
         │ 5. Authenticated
         ▼
┌───────────────────┐
│  Crypto Service   │ ← Sign with secp256r1
└────────┬──────────┘
         │ 6. Verify via EIP-7212
         ▼
┌───────────────────┐
│  EIP-7212         │
│  Precompile       │
└────────┬──────────┘
         │ 7. Signature verified
         ▼
┌───────────────────┐
│  Transaction      │
│  Broadcaster      │
└────────┬──────────┘
         │ 8. Send to network
         ▼
    Blockchain
         │
         ▼
┌───────────────────┐
│  UI Update        │ ← Show confirmation
└───────────────────┘
```

---

## Security Architecture

### Defense in Depth Strategy

#### Layer 1: Device Security
- Hardware security module (Secure Enclave / StrongBox)
- Biometric authentication required
- Keys never leave secure hardware
- Anti-tampering protections

#### Layer 2: Application Security
```typescript
// Security measures implemented:

// 1. Content Security Policy
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' https://*.infura.io https://*.blockscout.com;",
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

// 2. Input validation
export const validateAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// 3. Rate limiting (client-side)
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  checkLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    
    if (validTimestamps.length >= maxRequests) {
      return false;
    }
    
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }
}
```

#### Layer 3: Data Security
- Encrypted local storage
- No sensitive data in logs
- Secure memory handling
- Auto-clear on session end

#### Layer 4: Network Security
- HTTPS only
- Certificate pinning (consideration)
- Request signing
- WebSocket security (when implemented)

### Threat Model

| Threat | Mitigation |
|--------|------------|
| **Phishing** | Domain verification, certificate transparency |
| **Man-in-the-middle** | HTTPS, certificate pinning |
| **Device theft** | Biometric lock, session timeout |
| **Malware** | Hardware key isolation, signature verification |
| **Social engineering** | Clear transaction previews, amount confirmations |
| **Replay attacks** | Nonce management, timestamp validation |
| **Key extraction** | HSM storage, no key export (biometric wallets) |

---

## API Integration

### Blockscout API Integration

```typescript
// services/blockscout.service.ts
export class BlockscoutService {
  private baseUrl: string;
  
  constructor(network: NetworkConfig) {
    this.baseUrl = this.getBlockscoutUrl(network);
  }
  
  async getTransactionHistory(
    address: string,
    page: number = 1,
    limit: number = 20
  ): Promise<Transaction[]> {
    const response = await fetch(
      `${this.baseUrl}/api/v2/addresses/${address}/transactions?page=${page}&limit=${limit}`
    );
    
    const data = await response.json();
    return data.items.map(this.parseTransaction);
  }
  
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    const response = await fetch(
      `${this.baseUrl}/api/v2/addresses/${address}/token-balances`
    );
    
    const data = await response.json();
    return data.map(this.parseTokenBalance);
  }
  
  async getNFTs(address: string): Promise<NFT[]> {
    const response = await fetch(
      `${this.baseUrl}/api/v2/addresses/${address}/nft`
    );
    
    const data = await response.json();
    return data.items.map(this.parseNFT);
  }
}
```

### Price Feed Integration

```typescript
// services/price.service.ts
export class PriceService {
  private cache: Map<string, { price: number; timestamp: number }> = new Map();
  private cacheDuration = 60000; // 1 minute
  
  async getPrice(symbol: string, currency: string = 'usd'): Promise<number> {
    const cacheKey = `${symbol}_${currency}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.price;
    }
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=${currency}`
    );
    
    const data = await response.json();
    const price = data[symbol][currency];
    
    this.cache.set(cacheKey, { price, timestamp: Date.now() });
    return price;
  }
}
```

---

## State Management

### Zustand Store Structure

```typescript
// store/wallet.store.ts
interface WalletState {
  // State
  wallets: Wallet[];
  activeWallet: Wallet | null;
  isLocked: boolean;
  
  // Actions
  addWallet: (wallet: Wallet) => void;
  setActiveWallet: (wallet: Wallet) => void;
  lock: () => void;
  unlock: () => void;
  removeWallet: (address: string) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallets: [],
  activeWallet: null,
  isLocked: true,
  
  addWallet: (wallet) => set((state) => ({
    wallets: [...state.wallets, wallet],
  })),
  
  setActiveWallet: (wallet) => set({ activeWallet: wallet }),
  
  lock: () => set({ isLocked: true, activeWallet: null }),
  
  unlock: () => set({ isLocked: false }),
  
  removeWallet: (address) => set((state) => ({
    wallets: state.wallets.filter(w => w.address !== address),
  })),
}));

// store/network.store.ts
interface NetworkState {
  currentNetwork: NetworkConfig;
  networks: NetworkConfig[];
  switchNetwork: (networkId: number) => void;
}

// store/transaction.store.ts
interface TransactionState {
  pendingTransactions: Transaction[];
  addPending: (tx: Transaction) => void;
  removePending: (hash: string) => void;
}
```

### React Query for Server State

```typescript
// hooks/useBalance.ts
export function useBalance(address: string, chainId: number) {
  return useQuery({
    queryKey: ['balance', address, chainId],
    queryFn: async () => {
      const client = getClient(chainId);
      return await client.getBalance({ address });
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000,
  });
}

// hooks/useTokens.ts
export function useTokens(address: string) {
  return useQuery({
    queryKey: ['tokens', address],
    queryFn: async () => {
      return await blockscoutService.getTokenBalances(address);
    },
    refetchInterval: 30000,
  });
}
```

---

## Deployment Architecture

### PWA Deployment

```
┌─────────────────────────────────────────┐
│           CDN (Static Hosting)          │
│  • Static assets cached globally        │
│  • Service worker delivered             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Vite Built Application          │
│  • Optimized production bundle          │
│  • Code splitting                       │
│  • Lazy loading                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         User's Device (PWA)             │
│  • Service worker (offline support)     │
│  • IndexedDB (local data)               │
│  • WebAuthn (biometrics)                │
└─────────────────────────────────────────┘
```

### Service Worker Strategy

```typescript
// service-worker.js
const CACHE_NAME = 'fusaka-wallet-v1';
const RUNTIME_CACHE = 'runtime';

// Cache-first strategy for static assets
self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  if (event.request.url.includes('/api/')) {
    // Network-first for API calls
    event.respondWith(networkFirst(event.request));
  } else {
    // Cache-first for static assets
    event.respondWith(cacheFirst(event.request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  return cached || fetch(request);
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cache = await caches.open(RUNTIME_CACHE);
    return await cache.match(request);
  }
}
```

### Environment Configuration

```bash
# .env.example
NEXT_PUBLIC_APP_ENV=development

# RPC URLs
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# API Keys
NEXT_PUBLIC_COINGECKO_API_KEY=your_key_here
NEXT_PUBLIC_BLOCKSCOUT_API_KEY=your_key_here

# Feature Flags
NEXT_PUBLIC_ENABLE_MAINNET=false
NEXT_PUBLIC_ENABLE_WALLETCONNECT=false
```

---

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**
   ```typescript
   // Dynamic imports for heavy components
   const WalletConnect = dynamic(() => import('@/components/WalletConnect'), {
     loading: () => <Spinner />,
   });
   ```

2. **Bundle Size Optimization**
   - Tree-shaking unused code
   - Lazy load crypto libraries
   - Use lighter alternatives where possible

3. **Caching Strategy**
   - Balance queries cached for 10s
   - Token metadata cached indefinitely
   - Transaction history cached for 30s

4. **Image Optimization**
   ```typescript
   // next.config.js
   images: {
     domains: ['token-icons.example.com'],
     formats: ['image/avif', 'image/webp'],
   }
   ```

---

## Future Architecture Considerations

### Scalability
- Backend API for complex operations
- WebSocket for real-time updates
- Push notification service
- Cloud backup/sync (encrypted)

### Advanced Features
- Multi-signature coordination service
- Gasless transaction relayer
- DeFi protocol integrations
- Cross-chain bridge support

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-04 | Use React + Vite over Next.js | Faster build times, simpler for SPA, excellent HMR |
| 2025-12-04 | Material-UI over Tailwind CSS | Component library with theme system, accessibility built-in |
| 2025-12-04 | pnpm over npm | Faster installs, disk space efficient, strict dependency resolution |
| 2025-12-04 | Viem over Ethers.js | Lighter, TypeScript-first, better tree-shaking |
| 2025-12-04 | Zustand over Redux | Simpler API, smaller bundle, sufficient for needs |
| 2025-12-04 | Blockscout for transaction history | Open source, multi-chain support, good API |
| 2025-12-04 | Client-side only (POC) | Faster development, true decentralization |

---

**Last Updated:** December 3, 2025  
**Version:** 1.0.0  
**Status:** POC Phase
