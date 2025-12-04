# User Stories - SkypierWallet

> This document outlines user stories organized by development phase (POC → MVP → Production)
> 
> **Last Updated:** December 4, 2025

## Legend
- 🎯 POC Phase
- 🚀 MVP Phase
- ⭐ Production Phase
- ✅ Completed
- 🔄 In Progress
- ⏳ Planned

---

## 🎯 POC Phase - Core Functionality

### Epic 1: Biometric Wallet Creation

#### US-001: Create New Biometric Wallet ✅
**As a** new user  
**I want to** create a wallet using my device's biometric authentication  
**So that** I don't have to manage seed phrases

**Status:** ✅ Completed (December 4, 2025)

**Acceptance Criteria:**
- [x] User can initiate wallet creation from welcome screen
- [x] System checks for WebAuthn availability
- [x] System detects available biometric methods (Face ID, Touch ID, Fingerprint)
- [x] User is prompted for biometric authentication
- [x] secp256r1 key pair is generated
- [x] Public key is derived and displayed
- [x] Ethereum address is generated and displayed
- [x] Success confirmation is shown with wallet details

**Implementation Details:**

| Component | File | Description |
|-----------|------|-------------|
| WebAuthn Service | \`src/lib/auth/webauthn.ts\` | WebAuthn API integration for biometric auth |
| Crypto Keys | \`src/lib/crypto/keys.ts\` | secp256r1 key generation with @noble/curves |
| Encrypted Storage | \`src/lib/storage/encrypted.ts\` | AES-GCM encrypted wallet storage |
| Wallet Store | \`src/store/wallet.store.ts\` | Zustand state management |
| Create Wallet Page | \`src/pages/CreateWallet.tsx\` | Wallet creation UI flow |
| Biometric Setup | \`src/components/organisms/BiometricSetup.tsx\` | Biometric enrollment component |
| Wallet Created | \`src/components/organisms/WalletCreated.tsx\` | Success confirmation component |

**Technical Tasks:**
- [x] Implement WebAuthn availability check
- [x] Create biometric enrollment UI
- [x] Integrate WebAuthn API for credential creation
- [x] Implement secp256r1 key generation with \`@noble/curves\`
- [x] Derive Ethereum address from public key
- [x] Store credential ID in encrypted local storage
- [x] Create success/error handling flows
- [ ] Write unit tests for key generation logic

**Test Coverage:**
\`\`\`typescript
// Tests to implement in src/lib/crypto/__tests__/keys.test.ts
describe('Crypto Keys Service', () => {
  describe('generateKeyPair', () => {
    it('should generate valid secp256r1 key pair');
    it('should generate unique key pairs on each call');
    it('should return 32-byte private key');
    it('should return 33-byte compressed public key');
  });
  
  describe('deriveAddressFromPublicKey', () => {
    it('should derive valid Ethereum address from public key');
    it('should return checksummed address');
    it('should handle compressed public key format');
  });
  
  describe('deriveAddressFromWebAuthnPublicKey', () => {
    it('should handle COSE key format from WebAuthn');
    it('should extract x,y coordinates correctly');
  });
});
\`\`\`

**Priority:** P0 (Critical)  
**Actual Time:** 3 days

---

#### US-002: Onboarding Flow ✅
**As a** first-time user  
**I want to** understand what biometric wallets are and their benefits  
**So that** I can make an informed decision

**Status:** ✅ Completed (December 4, 2025)

**Acceptance Criteria:**
- [x] Welcome screen explains biometric wallet concept
- [x] Security benefits are clearly communicated
- [x] Device compatibility is checked automatically
- [x] User can choose between biometric wallet or import existing (placeholder)
- [x] Clear call-to-action buttons
- [x] Existing wallet unlock option available

**Implementation Details:**

| Component | File | Description |
|-----------|------|-------------|
| Welcome Page | \`src/pages/Welcome.tsx\` | Landing page with capability detection |
| Theme | \`src/theme/\` | Catppuccin Mocha palette, JetBrains Mono font |

**Technical Tasks:**
- [x] Design onboarding screens
- [x] Create device capability detection service
- [x] Implement progressive disclosure of features
- [x] Add skip/continue navigation
- [x] Store onboarding completion flag
- [x] Create responsive layouts for mobile
- [x] Detect existing wallets and show unlock option

**Priority:** P1 (High)  
**Actual Time:** 2 days

---

### Epic 2: Authentication & Session Management

#### US-003: Biometric Authentication ✅
**As a** returning user  
**I want to** unlock my wallet using biometrics  
**So that** I can access my funds securely and quickly

**Status:** ✅ Completed (December 4, 2025)

**Acceptance Criteria:**
- [x] User is prompted for biometric auth when opening app (if locked)
- [x] Authentication uses WebAuthn assertion
- [x] Successful auth grants session access
- [x] Failed auth shows error and retry option
- [ ] Maximum 3 retry attempts before lockout (not implemented)

**Implementation Details:**

| Component | File | Description |
|-----------|------|-------------|
| WebAuthn Service | \`src/lib/auth/webauthn.ts\` | \`authenticate()\` method for assertion |
| Wallet Store | \`src/store/wallet.store.ts\` | \`unlock()\` action with session creation |
| Dashboard | \`src/pages/Dashboard.tsx\` | Locked state UI with unlock button |

**Technical Tasks:**
- [x] Implement WebAuthn assertion flow
- [x] Create authentication middleware
- [x] Build session management system
- [ ] Implement retry logic with counter
- [ ] Add lockout mechanism after failed attempts
- [x] Create auth state management (Zustand)
- [ ] Write unit tests for auth flows

**Test Coverage:**
\`\`\`typescript
// Tests to implement in src/lib/auth/__tests__/webauthn.test.ts
describe('WebAuthn Service', () => {
  describe('isAvailable', () => {
    it('should return true when WebAuthn is supported');
    it('should return false when WebAuthn is not supported');
  });
  
  describe('createCredential', () => {
    it('should create credential with correct options');
    it('should return credential ID and public key');
    it('should handle user cancellation');
  });
  
  describe('authenticate', () => {
    it('should authenticate with stored credential');
    it('should throw on invalid credential');
    it('should handle biometric failure');
  });
});
\`\`\`

**Priority:** P0 (Critical)  
**Actual Time:** 2 days

---

#### US-004: Session Timeout ✅
**As a** security-conscious user  
**I want to** have my wallet auto-unlock persist for 5 minutes after authentication  
**So that** I don't have to re-authenticate on every page refresh

**Status:** ✅ Completed (December 4, 2025)

**Acceptance Criteria:**
- [x] Session persists for 5 minutes after biometric authentication
- [x] Session auto-unlocks wallet on page refresh within timeout
- [x] Session is cleared on explicit lock
- [x] Session extends on successful unlock
- [ ] Warning appears 30 seconds before timeout (not implemented)
- [ ] User can extend session from warning (not implemented)

**Implementation Details:**

| Component | File | Description |
|-----------|------|-------------|
| Session Management | \`src/store/wallet.store.ts\` | \`createSession()\`, \`getValidSession()\`, \`clearSession()\` |
| Session Storage | localStorage | \`skypier_session\` key with expiration timestamp |

**Session Configuration:**
\`\`\`typescript
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_KEY = 'skypier_session';

interface SessionData {
  expiresAt: number;
  credentialId: string;
}
\`\`\`

**Technical Tasks:**
- [x] Implement session timer service
- [ ] Track user interactions (mouse, touch, keyboard)
- [ ] Create warning modal component
- [x] Implement session extension logic
- [x] Persist session state in localStorage
- [ ] Handle edge cases (tab switching, background)
- [ ] Write unit tests for timer logic

**Test Coverage:**
\`\`\`typescript
// Tests to implement in src/store/__tests__/wallet.store.test.ts
describe('Session Management', () => {
  describe('createSession', () => {
    it('should create session with 5-minute expiry');
    it('should store credential ID in session');
  });
  
  describe('getValidSession', () => {
    it('should return session if not expired');
    it('should return null if session expired');
    it('should clear expired session from storage');
  });
  
  describe('initialize with session', () => {
    it('should auto-unlock if valid session exists');
    it('should require auth if session expired');
  });
});
\`\`\`

**Priority:** P1 (High)  
**Actual Time:** 1 day

---

### Epic 3: Wallet Import (Fallback)

#### US-005: Import Existing Wallet ⏳
**As a** user with an existing wallet  
**I want to** import my seed phrase  
**So that** I can access my existing funds

**Status:** ⏳ Planned

**Acceptance Criteria:**
- [ ] User can choose "Import Wallet" option
- [ ] 12/24 word seed phrase input supported
- [ ] BIP-39 validation performed
- [ ] Private key derived using standard derivation path
- [ ] Key stored in encrypted local storage
- [ ] User warned about security implications
- [ ] Ethereum address displayed for verification

**Technical Tasks:**
- [ ] Create seed phrase input component (word-by-word)
- [ ] Implement BIP-39 validation
- [ ] Integrate HD wallet derivation (ethers/viem)
- [ ] Implement encryption for private key storage
- [ ] Add derivation path selection (m/44'/60'/0'/0/0)
- [ ] Create address verification screen
- [ ] Add security warnings and disclaimers
- [ ] Write unit tests for import logic

**Priority:** P1 (High)  
**Estimate:** 3 days

---

#### US-006: Toggle Between Wallet Types ✅
**As a** user with multiple wallets  
**I want to** switch between wallets easily  
**So that** I can manage multiple accounts

**Status:** ✅ Completed (December 4, 2025)

**Acceptance Criteria:**
- [x] User can view all wallet accounts
- [x] Clear indication of wallet type (biometric vs imported)
- [x] Easy switching mechanism via modal
- [x] Active wallet highlighted
- [x] Jazzicon profile pictures for each wallet
- [ ] Each wallet shows its balance (placeholder data)

**Implementation Details:**

| Component | File | Description |
|-----------|------|-------------|
| Wallet Selector Modal | \`src/components/organisms/WalletSelectorModal.tsx\` | Modal for wallet switching |
| Jazzicon | \`src/components/atoms/Jazzicon.tsx\` | Unique identicon per address |
| Wallet Store | \`src/store/wallet.store.ts\` | \`setActiveWallet()\` action |

**Technical Tasks:**
- [x] Design wallet switcher UI (modal)
- [x] Implement multi-wallet state management
- [x] Create wallet type badges/icons
- [x] Add active wallet persistence
- [ ] Implement balance fetching for all wallets
- [ ] Write unit tests for wallet switching

**Priority:** P2 (Medium)  
**Actual Time:** 1 day

---

### Epic 4: Balance & Network Management

#### US-007: View ETH Balance ⏳
**As a** wallet user  
**I want to** see my ETH balance  
**So that** I know how much I have

**Status:** ⏳ Planned (UI ready with placeholder data)

**Acceptance Criteria:**
- [x] Balance displayed on home screen (placeholder)
- [ ] Shows in ETH with proper decimals
- [ ] USD value displayed (using price feed)
- [ ] Updates automatically on network change
- [ ] Refresh button available
- [x] Loading state shown during fetch

**Implementation Details:**

| Component | File | Description |
|-----------|------|-------------|
| Dashboard | \`src/pages/Dashboard.tsx\` | Balance display (mock data) |
| Token List Item | \`src/components/molecules/TokenListItem.tsx\` | Token display component |

**Current Mock Data:**
\`\`\`typescript
const MOCK_TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', balance: '2.4582', price: 3450.00, change24h: 2.34 },
  { symbol: 'WASSIE', name: 'Wassie', balance: '420690', price: 0.000234, change24h: 15.67 },
  { symbol: 'MOG', name: 'Mog Coin', balance: '1500000', price: 0.00000089, change24h: -8.45 },
  { symbol: 'PEPE', name: 'Pepe', balance: '25000000', price: 0.0000185, change24h: 5.23 },
  { symbol: 'MON', name: 'Mon Protocol', balance: '5000', price: 0.42, change24h: 12.89 },
  { symbol: 'GRT', name: 'The Graph', balance: '1250', price: 0.28, change24h: -2.15 },
];
\`\`\`

**Technical Tasks:**
- [x] Create balance display component (with mock data)
- [ ] Integrate viem for balance fetching
- [ ] Implement price feed integration (CoinGecko API)
- [ ] Add currency formatting utilities
- [ ] Implement auto-refresh mechanism
- [ ] Handle network errors gracefully
- [x] Add loading skeletons
- [ ] Write unit tests for balance logic

**Priority:** P0 (Critical)  
**Estimate:** 2 days

---

#### US-008: Multi-Network Support ⏳
**As a** user  
**I want to** switch between different networks  
**So that** I can use testnets for development

**Status:** ⏳ Planned

**Acceptance Criteria:**
- [ ] Network selector in header/menu
- [ ] Supported networks: Sepolia, Base Sepolia (POC)
- [ ] Current network clearly displayed
- [ ] Balance updates when network changes
- [ ] Network-specific RPC endpoints configured
- [ ] Connection status indicator

**Technical Tasks:**
- [ ] Define network configuration structure
- [ ] Create network switcher component
- [ ] Implement RPC provider management (viem)
- [ ] Add network icons and branding
- [ ] Persist selected network preference
- [ ] Handle network switch errors
- [ ] Update all dependent data on switch
- [ ] Write unit tests for network logic

**Priority:** P0 (Critical)  
**Estimate:** 3 days

---

### Epic 5: Basic Transactions

#### US-009: Send ETH Transaction ⏳
**As a** wallet user  
**I want to** send ETH to another address  
**So that** I can transfer funds

**Status:** ⏳ Planned (UI buttons present)

**Acceptance Criteria:**
- [x] Send button available on home screen
- [ ] Recipient address input with ENS support (basic)
- [ ] Amount input with max button
- [ ] Gas estimation displayed
- [ ] Transaction preview before confirmation
- [ ] Biometric confirmation required
- [ ] Transaction hash shown after submission
- [ ] Success/failure notification

**Technical Tasks:**
- [x] Create send button (placeholder)
- [ ] Create send transaction form
- [ ] Implement address validation
- [ ] Add amount input with balance validation
- [ ] Integrate gas estimation (viem)
- [ ] Create transaction preview modal
- [ ] Implement transaction signing with secp256r1
- [ ] Handle EIP-7212 precompile for signature verification
- [ ] Submit transaction to network
- [ ] Create confirmation flow with biometrics
- [ ] Add transaction status tracking
- [ ] Write unit tests for transaction logic

**Priority:** P0 (Critical)  
**Estimate:** 5 days

---

#### US-010: Transaction Confirmation ⏳
**As a** user sending a transaction  
**I want to** review all details before signing  
**So that** I don't make mistakes

**Status:** ⏳ Planned

**Acceptance Criteria:**
- [ ] Clear preview of: recipient, amount, gas fee, total
- [ ] Network displayed
- [ ] Estimated completion time shown
- [ ] Edit option available
- [ ] Biometric prompt for final confirmation
- [ ] Clear cancel option

**Technical Tasks:**
- [ ] Design transaction review modal
- [ ] Calculate total cost (amount + gas)
- [ ] Add time estimation logic
- [ ] Implement edit functionality
- [ ] Create biometric confirmation flow
- [ ] Add cancel handling
- [ ] Write unit tests

**Priority:** P1 (High)  
**Estimate:** 2 days

---

### Epic 6: Basic UI/UX

#### US-011: Home Dashboard ✅
**As a** user  
**I want to** see my wallet overview  
**So that** I can quickly understand my portfolio

**Status:** ✅ Completed (December 4, 2025)

**Acceptance Criteria:**
- [x] Clean, modern interface (Rainbow wallet style)
- [x] Balance prominently displayed
- [x] Network indicator visible (placeholder)
- [x] Quick actions: Send, Receive, Swap (buttons)
- [x] Token list with mock data
- [x] NFT gallery with mock data
- [x] Activity tab (placeholder)
- [x] Responsive design for mobile

**Implementation Details:**

| Component | File | Description |
|-----------|------|-------------|
| Dashboard | \`src/pages/Dashboard.tsx\` | Main wallet dashboard |
| Token List Item | \`src/components/molecules/TokenListItem.tsx\` | Token row component |
| NFT Card | \`src/components/molecules/NFTCard.tsx\` | NFT grid item |
| Jazzicon | \`src/components/atoms/Jazzicon.tsx\` | Wallet avatar |

**UI Features:**
- Gradient header with Jazzicon profile picture
- Clickable address with copy-to-clipboard
- Total portfolio value display
- Tabs: Tokens, NFTs, Activity
- Wallet selector modal
- Action buttons (Send, Receive, Swap, More)

**Technical Tasks:**
- [x] Design home screen layout (Rainbow style)
- [x] Implement responsive grid system
- [x] Create balance card component
- [x] Add quick action buttons
- [x] Create navigation structure (tabs)
- [x] Implement dark theme (Catppuccin Mocha)
- [x] Add animations and transitions
- [x] Optimize for mobile viewports

**Priority:** P1 (High)  
**Actual Time:** 2 days

---

#### US-012: Receive Address ⏳
**As a** user  
**I want to** share my wallet address  
**So that** others can send me funds

**Status:** ⏳ Planned (Receive button present)

**Acceptance Criteria:**
- [x] Receive button opens modal (placeholder)
- [ ] Ethereum address displayed prominently
- [ ] QR code generated
- [ ] Copy address button
- [ ] Network warning if not on mainnet
- [ ] Share functionality

**Technical Tasks:**
- [x] Add receive button
- [ ] Create receive modal component
- [ ] Integrate QR code library (qrcode.react)
- [ ] Implement copy-to-clipboard
- [ ] Add network badge
- [ ] Create share functionality (Web Share API)
- [ ] Add success toast on copy
- [ ] Write unit tests

**Priority:** P1 (High)  
**Estimate:** 2 days

---

## 🚀 MVP Phase - Enhanced Features

### Epic 7: Token Management

#### US-013: ERC-20 Token Display ✅ (Partial)
**As a** user  
**I want to** see my token balances  
**So that** I can track my portfolio

**Status:** ✅ Partial (UI ready with mock data)

**Acceptance Criteria:**
- [x] Token list displayed on dashboard
- [x] Token balance shown
- [x] Token icons/logos shown (color avatars)
- [x] USD value for each token
- [x] 24h price change indicator
- [ ] Real token detection (using APIs)

**Implementation Details:**

| Component | File | Description |
|-----------|------|-------------|
| Token List Item | \`src/components/molecules/TokenListItem.tsx\` | Individual token display |
| Dashboard | \`src/pages/Dashboard.tsx\` | Token list container |

**Technical Tasks:**
- [x] Design token list UI
- [x] Create token component with price change
- [ ] Integrate token list (Uniswap, CoinGecko)
- [ ] Implement multicall for batch balance fetching
- [ ] Add token logo CDN integration
- [ ] Implement price fetching for tokens
- [ ] Add caching mechanism
- [ ] Write unit tests

**Priority:** P0 (Critical)  
**Estimate:** 4 days (for real integration)

---

### Epic 8: NFT Management

#### US-014: NFT Gallery ✅ (Partial)
**As a** user  
**I want to** see my NFT collection  
**So that** I can view and manage my digital art

**Status:** ✅ Partial (UI ready with mock data)

**Acceptance Criteria:**
- [x] NFT grid displayed in tab
- [x] NFT image loading with placeholder
- [x] Collection name displayed
- [x] Floor price shown
- [ ] Real NFT detection (using APIs)
- [ ] NFT detail view

**Implementation Details:**

| Component | File | Description |
|-----------|------|-------------|
| NFT Card | \`src/components/molecules/NFTCard.tsx\` | Individual NFT display |
| Dashboard | \`src/pages/Dashboard.tsx\` | NFT grid container |

**Mock Data:**
\`\`\`typescript
const MOCK_NFTS: NFT[] = [
  { id: '1', name: 'Pudgy Penguin #1234', collection: 'Pudgy Penguins', floorPrice: 12.5 },
  { id: '2', name: 'Azuki #5678', collection: 'Azuki', floorPrice: 8.2 },
  { id: '3', name: 'Doodle #9012', collection: 'Doodles', floorPrice: 3.8 },
];
\`\`\`

**Technical Tasks:**
- [x] Create NFT card component
- [x] Implement image loading states
- [x] Add responsive grid layout
- [ ] Integrate NFT APIs (Alchemy, OpenSea)
- [ ] Implement IPFS image loading
- [ ] Add collection grouping
- [ ] Create NFT detail modal
- [ ] Write unit tests

**Priority:** P1 (High)  
**Estimate:** 3 days (for real integration)

---

## Implementation Summary

### Completed User Stories (POC Phase)

| US | Title | Status | Files |
|----|-------|--------|-------|
| US-001 | Create New Biometric Wallet | ✅ | webauthn.ts, keys.ts, encrypted.ts, wallet.store.ts |
| US-002 | Onboarding Flow | ✅ | Welcome.tsx, theme/ |
| US-003 | Biometric Authentication | ✅ | webauthn.ts, wallet.store.ts, Dashboard.tsx |
| US-004 | Session Timeout | ✅ | wallet.store.ts (5-min session) |
| US-006 | Toggle Between Wallets | ✅ | WalletSelectorModal.tsx, Jazzicon.tsx |
| US-011 | Home Dashboard | ✅ | Dashboard.tsx, TokenListItem.tsx, NFTCard.tsx |

### In Progress / Partial

| US | Title | Status | Notes |
|----|-------|--------|-------|
| US-007 | View ETH Balance | 🔄 | UI ready, needs viem integration |
| US-013 | ERC-20 Token Display | 🔄 | UI ready with mock data |
| US-014 | NFT Gallery | 🔄 | UI ready with mock data |

### Pending (POC Phase)

| US | Title | Priority | Estimate |
|----|-------|----------|----------|
| US-005 | Import Existing Wallet | P1 | 3 days |
| US-008 | Multi-Network Support | P0 | 3 days |
| US-009 | Send ETH Transaction | P0 | 5 days |
| US-010 | Transaction Confirmation | P1 | 2 days |
| US-012 | Receive Address | P1 | 2 days |

---

## Test Plan

### Unit Tests Required

| Module | File | Priority |
|--------|------|----------|
| Crypto Keys | \`src/lib/crypto/__tests__/keys.test.ts\` | P0 |
| WebAuthn Service | \`src/lib/auth/__tests__/webauthn.test.ts\` | P0 |
| Encrypted Storage | \`src/lib/storage/__tests__/encrypted.test.ts\` | P0 |
| Wallet Store | \`src/store/__tests__/wallet.store.test.ts\` | P0 |

### Integration Tests Required

| Flow | Description | Priority |
|------|-------------|----------|
| Wallet Creation | End-to-end wallet creation with biometrics | P0 |
| Unlock Flow | Session persistence and unlock | P1 |
| Wallet Switching | Multi-wallet management | P2 |

---

## Architecture Reference

See [Architecture.md](./Architecture.md) for detailed technical specifications.

### Key Technologies
- **Framework:** React 18 + Vite 7
- **Language:** TypeScript (strict mode)
- **State Management:** Zustand v5
- **Styling:** Material-UI v6 + Catppuccin Mocha theme
- **Crypto:** @noble/curves (secp256r1), @noble/hashes
- **Auth:** WebAuthn API
- **Storage:** AES-GCM encrypted localStorage
