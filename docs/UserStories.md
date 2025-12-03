# User Stories - Fusaka Wallet

> This document outlines user stories organized by development phase (POC → MVP → Production)

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

#### US-001: Create New Biometric Wallet 🎯
**As a** new user  
**I want to** create a wallet using my device's biometric authentication  
**So that** I don't have to manage seed phrases

**Acceptance Criteria:**
- User can initiate wallet creation from welcome screen
- System checks for WebAuthn availability
- System detects available biometric methods (Face ID, Touch ID, Fingerprint)
- User is prompted for biometric authentication
- secp256r1 key pair is generated in hardware security module
- Public key is derived and displayed
- Ethereum address is generated and displayed
- Success confirmation is shown

**Technical Tasks:**
- [ ] Implement WebAuthn availability check
- [ ] Create biometric enrollment UI
- [ ] Integrate WebAuthn API for credential creation
- [ ] Implement secp256r1 key generation with `@noble/curves`
- [ ] Derive Ethereum address from public key
- [ ] Store credential ID in encrypted local storage
- [ ] Create success/error handling flows
- [ ] Write unit tests for key generation logic

**Priority:** P0 (Critical)  
**Estimate:** 5 days

---

#### US-002: Onboarding Flow 🎯
**As a** first-time user  
**I want to** understand what biometric wallets are and their benefits  
**So that** I can make an informed decision

**Acceptance Criteria:**
- Welcome screen explains biometric wallet concept
- Security benefits are clearly communicated
- Device compatibility is checked automatically
- User can choose between biometric wallet or import existing
- Clear call-to-action buttons

**Technical Tasks:**
- [ ] Design onboarding screens (3-4 slides)
- [ ] Create device capability detection service
- [ ] Implement progressive disclosure of features
- [ ] Add skip/continue navigation
- [ ] Store onboarding completion flag
- [ ] Create responsive layouts for mobile

**Priority:** P1 (High)  
**Estimate:** 3 days

---

### Epic 2: Authentication & Session Management

#### US-003: Biometric Authentication 🎯
**As a** returning user  
**I want to** unlock my wallet using biometrics  
**So that** I can access my funds securely and quickly

**Acceptance Criteria:**
- User is prompted for biometric auth when opening app
- Authentication uses WebAuthn assertion
- Successful auth grants session access
- Failed auth shows error and retry option
- Maximum 3 retry attempts before lockout

**Technical Tasks:**
- [ ] Implement WebAuthn assertion flow
- [ ] Create authentication middleware
- [ ] Build session management system
- [ ] Implement retry logic with counter
- [ ] Add lockout mechanism after failed attempts
- [ ] Create auth state management (Zustand)
- [ ] Write unit tests for auth flows

**Priority:** P0 (Critical)  
**Estimate:** 4 days

---

#### US-004: Session Timeout 🎯
**As a** security-conscious user  
**I want to** have my wallet auto-lock after 5 minutes of inactivity  
**So that** my funds are protected if I forget to lock manually

**Acceptance Criteria:**
- Default timeout is 5 minutes
- Timer resets on user activity
- Warning appears 30 seconds before timeout
- User can extend session from warning
- Wallet locks and requires re-authentication
- Active transactions are not interrupted

**Technical Tasks:**
- [ ] Implement inactivity timer service
- [ ] Track user interactions (mouse, touch, keyboard)
- [ ] Create warning modal component
- [ ] Implement session extension logic
- [ ] Persist session state in memory only
- [ ] Handle edge cases (tab switching, background)
- [ ] Write unit tests for timer logic

**Priority:** P1 (High)  
**Estimate:** 2 days

---

### Epic 3: Wallet Import (Fallback)

#### US-005: Import Existing Wallet 🎯
**As a** user with an existing wallet  
**I want to** import my seed phrase  
**So that** I can access my existing funds

**Acceptance Criteria:**
- User can choose "Import Wallet" option
- 12/24 word seed phrase input supported
- BIP-39 validation performed
- Private key derived using standard derivation path
- Key stored in encrypted local storage
- User warned about security implications
- Ethereum address displayed for verification

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

#### US-006: Toggle Between Wallet Types 🎯
**As a** user with both wallet types  
**I want to** switch between biometric and imported wallets  
**So that** I can manage multiple accounts

**Acceptance Criteria:**
- User can view all wallet accounts
- Clear indication of wallet type (biometric vs imported)
- Easy switching mechanism
- Active wallet highlighted
- Each wallet shows its balance

**Technical Tasks:**
- [ ] Design wallet switcher UI
- [ ] Implement multi-wallet state management
- [ ] Create wallet type badges/icons
- [ ] Add active wallet persistence
- [ ] Implement balance fetching for all wallets
- [ ] Write unit tests for wallet switching

**Priority:** P2 (Medium)  
**Estimate:** 2 days

---

### Epic 4: Balance & Network Management

#### US-007: View ETH Balance 🎯
**As a** wallet user  
**I want to** see my ETH balance  
**So that** I know how much I have

**Acceptance Criteria:**
- Balance displayed on home screen
- Shows in ETH with proper decimals
- USD value displayed (using price feed)
- Updates automatically on network change
- Refresh button available
- Loading state shown during fetch

**Technical Tasks:**
- [ ] Integrate viem for balance fetching
- [ ] Create balance display component
- [ ] Implement price feed integration (CoinGecko API)
- [ ] Add currency formatting utilities
- [ ] Implement auto-refresh mechanism
- [ ] Handle network errors gracefully
- [ ] Add loading skeletons
- [ ] Write unit tests for balance logic

**Priority:** P0 (Critical)  
**Estimate:** 2 days

---

#### US-008: Multi-Network Support 🎯
**As a** user  
**I want to** switch between different networks  
**So that** I can use testnets for development

**Acceptance Criteria:**
- Network selector in header/menu
- Supported networks: Sepolia, Base Sepolia (POC)
- Current network clearly displayed
- Balance updates when network changes
- Network-specific RPC endpoints configured
- Connection status indicator

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

#### US-009: Send ETH Transaction 🎯
**As a** wallet user  
**I want to** send ETH to another address  
**So that** I can transfer funds

**Acceptance Criteria:**
- Send button available on home screen
- Recipient address input with ENS support (basic)
- Amount input with max button
- Gas estimation displayed
- Transaction preview before confirmation
- Biometric confirmation required
- Transaction hash shown after submission
- Success/failure notification

**Technical Tasks:**
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

#### US-010: Transaction Confirmation 🎯
**As a** user sending a transaction  
**I want to** review all details before signing  
**So that** I don't make mistakes

**Acceptance Criteria:**
- Clear preview of: recipient, amount, gas fee, total
- Network displayed
- Estimated completion time shown
- Edit option available
- Biometric prompt for final confirmation
- Clear cancel option

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

#### US-011: Home Dashboard 🎯
**As a** user  
**I want to** see my wallet overview  
**So that** I can quickly understand my portfolio

**Acceptance Criteria:**
- Clean, modern interface
- Balance prominently displayed
- Network indicator visible
- Quick actions: Send, Receive
- Recent transactions section (placeholder for POC)
- Responsive design for mobile

**Technical Tasks:**
- [ ] Design home screen layout
- [ ] Implement responsive grid system
- [ ] Create balance card component
- [ ] Add quick action buttons
- [ ] Create navigation structure
- [ ] Implement dark/light theme toggle
- [ ] Add animations and transitions
- [ ] Optimize for mobile viewports

**Priority:** P1 (High)  
**Estimate:** 3 days

---

#### US-012: Receive Address 🎯
**As a** user  
**I want to** share my wallet address  
**So that** others can send me funds

**Acceptance Criteria:**
- Receive button opens modal
- Ethereum address displayed prominently
- QR code generated
- Copy address button
- Network warning if not on mainnet
- Share functionality

**Technical Tasks:**
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

#### US-013: ERC-20 Token Detection 🚀
**As a** user  
**I want to** see all my ERC-20 tokens automatically  
**So that** I don't have to add them manually

**Acceptance Criteria:**
- Automatic token detection on wallet load
- Popular tokens shown by default
- Token balance displayed
- Token icons/logos shown
- USD value for each token
- Refresh mechanism

**Technical Tasks:**
- [ ] Integrate token list (Uniswap, CoinGecko)
- [ ] Implement multicall for batch balance fetching
- [ ] Create token detection service
- [ ] Design token list UI
- [ ] Add token logo CDN integration
- [ ] Implement price fetching for tokens
- [ ] Add caching mechanism
- [ ] Write unit tests

**Priority:** P0 (Critical)  
**Estimate:** 4 days

---

#### US-014: Send ERC-20 Tokens 🚀
**As a** user  
**I want to** send ERC-20 tokens  
**So that** I can transfer any token

**Acceptance Criteria:**
- Token selector in send flow
- Amount input with max button
- Gas estimation for token transfer
- Approval transaction if needed
- Preview shows token details
- Biometric confirmation

**Technical Tasks:**
- [ ] Create token selector component
- [ ] Implement ERC-20 transfer logic
- [ ] Handle approval flow (if needed)
- [ ] Update gas estimation for token transfers
- [ ] Modify send flow for token support
- [ ] Write unit tests

**Priority:** P0 (Critical)  
**Estimate:** 3 days

---

#### US-015: Custom Token Import 🚀
**As a** user  
**I want to** add custom tokens  
**So that** I can track any ERC-20 token

**Acceptance Criteria:**
- "Add Token" button in token list
- Contract address input
- Automatic metadata fetching (symbol, decimals, name)
- Manual entry fallback
- Token verification
- Remove token option

**Technical Tasks:**
- [ ] Create add token modal
- [ ] Implement contract metadata fetching
- [ ] Add token validation logic
- [ ] Store custom tokens in local storage
- [ ] Implement remove token functionality
- [ ] Write unit tests

**Priority:** P2 (Medium)  
**Estimate:** 2 days

---

### Epic 8: NFT Support

#### US-016: View NFT Gallery 🚀
**As a** user  
**I want to** see my NFTs  
**So that** I can view my digital collectibles

**Acceptance Criteria:**
- NFT tab in main navigation
- Grid layout for NFT display
- Support for ERC-721 and ERC-1155
- NFT images/metadata displayed
- Collection grouping
- Loading states for images

**Technical Tasks:**
- [ ] Integrate NFT API (Alchemy, Moralis, or Blockscout)
- [ ] Implement NFT fetching service
- [ ] Design NFT gallery UI
- [ ] Create NFT card component
- [ ] Handle IPFS image loading
- [ ] Implement collection grouping
- [ ] Add infinite scroll or pagination
- [ ] Write unit tests

**Priority:** P1 (High)  
**Estimate:** 5 days

---

#### US-017: NFT Detail View 🚀
**As a** user  
**I want to** see NFT details  
**So that** I can learn more about my collectibles

**Acceptance Criteria:**
- Click NFT opens detail modal
- Full-size image display
- Name, collection, token ID shown
- Traits/attributes displayed
- Contract address with explorer link
- Send NFT button

**Technical Tasks:**
- [ ] Create NFT detail modal
- [ ] Parse and display metadata
- [ ] Implement trait display
- [ ] Add blockchain explorer links
- [ ] Create send NFT flow
- [ ] Write unit tests

**Priority:** P2 (Medium)  
**Estimate:** 3 days

---

### Epic 9: Transaction History

#### US-018: Transaction List 🚀
**As a** user  
**I want to** see my transaction history  
**So that** I can track my activity

**Acceptance Criteria:**
- Transactions tab in navigation
- Chronological list of transactions
- Transaction type indicators (send, receive, contract)
- Amount and status displayed
- Pagination or infinite scroll
- Filter by type/status

**Technical Tasks:**
- [ ] Integrate Blockscout API
- [ ] Create transaction fetching service
- [ ] Design transaction list UI
- [ ] Implement transaction card component
- [ ] Add pagination/infinite scroll
- [ ] Create filter controls
- [ ] Handle pending transactions
- [ ] Write unit tests

**Priority:** P1 (High)  
**Estimate:** 4 days

---

#### US-019: Transaction Details 🚀
**As a** user  
**I want to** see full transaction details  
**So that** I can verify transaction information

**Acceptance Criteria:**
- Click transaction opens detail modal
- All transaction data displayed (from, to, value, gas, nonce)
- Block confirmation count
- Timestamp
- Link to block explorer
- Status (success, failed, pending)

**Technical Tasks:**
- [ ] Create transaction detail modal
- [ ] Fetch full transaction receipt
- [ ] Calculate confirmation count
- [ ] Format timestamp
- [ ] Add explorer links
- [ ] Create status badges
- [ ] Write unit tests

**Priority:** P2 (Medium)  
**Estimate:** 2 days

---

### Epic 10: ENS Integration

#### US-020: ENS Name Resolution 🚀
**As a** user  
**I want to** use ENS names when sending transactions  
**So that** I don't have to remember addresses

**Acceptance Criteria:**
- ENS names resolve to addresses automatically
- ".eth" domains supported
- Reverse resolution shows names instead of addresses
- Loading state during resolution
- Fallback to address if resolution fails
- Support for mainnet ENS registry

**Technical Tasks:**
- [ ] Integrate ENS resolution (viem)
- [ ] Implement forward resolution (name → address)
- [ ] Implement reverse resolution (address → name)
- [ ] Add ENS input validation
- [ ] Create loading/error states
- [ ] Cache resolved names
- [ ] Handle cross-chain ENS (L2s)
- [ ] Write unit tests

**Priority:** P1 (High)  
**Estimate:** 3 days

---

#### US-021: Display ENS Avatar 🚀
**As a** user  
**I want to** see ENS avatars  
**So that** addresses are more recognizable

**Acceptance Criteria:**
- ENS avatars shown in transaction history
- Avatar shown in recipient field when resolved
- Fallback to identicon if no avatar
- Avatar displayed in wallet header (if user has ENS)

**Technical Tasks:**
- [ ] Fetch ENS avatar records
- [ ] Create avatar component
- [ ] Implement IPFS/HTTP avatar loading
- [ ] Generate identicons as fallback
- [ ] Add caching for avatars
- [ ] Write unit tests

**Priority:** P2 (Medium)  
**Estimate:** 2 days

---

### Epic 11: Multi-Network Expansion

#### US-022: Mainnet Support 🚀
**As a** user  
**I want to** use the wallet on Ethereum mainnet  
**So that** I can manage real funds

**Acceptance Criteria:**
- Ethereum mainnet available in network selector
- Clear mainnet indicator
- Warning when switching to mainnet
- All features work on mainnet
- Proper RPC endpoint configuration

**Technical Tasks:**
- [ ] Add mainnet network configuration
- [ ] Implement mainnet warning modal
- [ ] Configure production RPC endpoints
- [ ] Test all features on mainnet
- [ ] Add mainnet-specific security checks
- [ ] Write unit tests

**Priority:** P0 (Critical)  
**Estimate:** 2 days

---

#### US-023: L2 Network Support 🚀
**As a** user  
**I want to** use Base, Optimism, Arbitrum  
**So that** I can benefit from lower fees

**Acceptance Criteria:**
- Base, Optimism, Arbitrum networks available
- Network-specific branding
- Bridge links for moving assets
- All features work on L2s
- Network-specific transaction details

**Technical Tasks:**
- [ ] Add L2 network configurations
- [ ] Configure L2 RPC endpoints
- [ ] Add network logos and colors
- [ ] Implement bridge deeplinks
- [ ] Test all features on each L2
- [ ] Handle L2-specific gas mechanisms
- [ ] Write unit tests

**Priority:** P1 (High)  
**Estimate:** 3 days

---

#### US-024: Monad Support 🚀
**As a** user  
**I want to** use Monad network when available  
**So that** I can access high-performance blockchain

**Acceptance Criteria:**
- Monad network configuration ready
- Enable when mainnet launches
- Monad-specific features supported
- Proper RPC configuration

**Technical Tasks:**
- [ ] Research Monad specifications
- [ ] Add Monad network configuration
- [ ] Configure Monad RPC endpoints
- [ ] Test compatibility
- [ ] Add Monad branding
- [ ] Write unit tests

**Priority:** P2 (Medium)  
**Estimate:** 2 days

---

### Epic 12: Settings & Security

#### US-025: Configurable Session Timeout 🚀
**As a** user  
**I want to** customize my session timeout  
**So that** I can balance security and convenience

**Acceptance Criteria:**
- Settings page available
- Timeout options: 1, 5, 15, 30 minutes, Never
- Default is 5 minutes
- Setting persists across sessions
- Warning about security implications

**Technical Tasks:**
- [ ] Create settings page structure
- [ ] Build timeout selector component
- [ ] Persist setting in local storage
- [ ] Update timer service to use custom timeout
- [ ] Add security warnings
- [ ] Write unit tests

**Priority:** P1 (High)  
**Estimate:** 2 days

---

#### US-026: Security Settings 🚀
**As a** security-conscious user  
**I want to** access security options  
**So that** I can protect my wallet

**Acceptance Criteria:**
- Settings > Security section
- View recovery options
- Export private key (with warnings)
- View biometric credential info
- Clear wallet data option
- Require biometric for sends toggle

**Technical Tasks:**
- [ ] Create security settings page
- [ ] Implement private key export with warnings
- [ ] Add credential management
- [ ] Create recovery phrase display
- [ ] Implement clear data functionality
- [ ] Add biometric requirement toggle
- [ ] Write unit tests

**Priority:** P1 (High)  
**Estimate:** 4 days

---

#### US-027: Recovery Mechanism 🚀
**As a** user who lost device access  
**I want to** recover my wallet  
**So that** I don't lose my funds

**Acceptance Criteria:**
- Recovery phrase shown during wallet creation (biometric)
- User must acknowledge saving recovery phrase
- Recovery import option on login screen
- Recovery using seed phrase
- Multi-device sync considerations documented

**Technical Tasks:**
- [ ] Generate BIP-39 seed as backup for biometric wallets
- [ ] Create recovery phrase display flow
- [ ] Implement acknowledgment checkbox
- [ ] Add recovery import flow
- [ ] Create recovery documentation
- [ ] Write unit tests

**Priority:** P0 (Critical)  
**Estimate:** 4 days

---

#### US-028: Currency Settings 🚀
**As a** user  
**I want to** choose my display currency  
**So that** I see values in my preferred fiat

**Acceptance Criteria:**
- Currency selector in settings
- Supported: USD, EUR, GBP, JPY, etc.
- All price displays update
- Setting persists

**Technical Tasks:**
- [ ] Add currency selector
- [ ] Integrate multi-currency price API
- [ ] Update all price displays
- [ ] Persist currency preference
- [ ] Write unit tests

**Priority:** P2 (Medium)  
**Estimate:** 2 days

---

## ⭐ Production Phase - Advanced Features

### Epic 13: WalletConnect Integration

#### US-029: WalletConnect v2 Support ⭐
**As a** user  
**I want to** connect to dApps using WalletConnect  
**So that** I can use my wallet across applications

**Acceptance Criteria:**
- WalletConnect pairing via QR or deep link
- Session management
- dApp connection list
- Transaction approval from dApps
- Biometric confirmation for dApp requests
- Disconnect functionality

**Technical Tasks:**
- [ ] Integrate WalletConnect v2 SDK
- [ ] Implement pairing flow
- [ ] Create session management
- [ ] Handle RPC requests from dApps
- [ ] Add approval modals
- [ ] Create connection manager UI
- [ ] Write unit tests

**Priority:** P0 (Critical)  
**Estimate:** 6 days

---

### Epic 14: Advanced Transaction Features

#### US-030: Gas Optimization ⭐
**As a** user  
**I want to** optimize transaction gas fees  
**So that** I can save money

**Acceptance Criteria:**
- Gas price suggestions (slow, normal, fast)
- EIP-1559 support
- Custom gas limits
- Gas savings indicator
- Time estimates per price tier

**Technical Tasks:**
- [ ] Integrate gas price API
- [ ] Implement EIP-1559 logic
- [ ] Create gas selector UI
- [ ] Add custom gas input
- [ ] Calculate savings
- [ ] Write unit tests

**Priority:** P1 (High)  
**Estimate:** 3 days

---

#### US-031: Transaction Queue ⭐
**As a** user  
**I want to** see pending transactions  
**So that** I can track what's processing

**Acceptance Criteria:**
- Pending transaction list
- Cancel/speed up options
- Real-time status updates
- Notification on confirmation

**Technical Tasks:**
- [ ] Implement transaction queue management
- [ ] Add cancel transaction logic
- [ ] Implement speed up (replace by fee)
- [ ] Create real-time updates (polling/websocket)
- [ ] Add push notifications
- [ ] Write unit tests

**Priority:** P1 (High)  
**Estimate:** 4 days

---

### Epic 15: Enhanced Security

#### US-032: Hardware Wallet Support ⭐
**As a** security-focused user  
**I want to** connect hardware wallets  
**So that** I can use cold storage

**Acceptance Criteria:**
- Ledger support
- Trezor support
- USB connection
- Transaction signing via hardware
- Multiple hardware wallets

**Technical Tasks:**
- [ ] Integrate Ledger SDK
- [ ] Integrate Trezor SDK
- [ ] Implement device detection
- [ ] Create connection flow
- [ ] Handle hardware signing
- [ ] Write unit tests

**Priority:** P2 (Medium)  
**Estimate:** 5 days

---

#### US-033: Multi-Sig Support ⭐
**As a** team managing funds  
**I want to** use multi-signature wallets  
**So that** we have shared control

**Acceptance Criteria:**
- Create multi-sig wallet
- Add/remove signers
- Propose transactions
- Approve/reject transactions
- Execution when threshold reached

**Technical Tasks:**
- [ ] Integrate Safe (Gnosis) SDK
- [ ] Implement multi-sig creation
- [ ] Create proposal system
- [ ] Build approval flow
- [ ] Handle execution
- [ ] Write unit tests

**Priority:** P2 (Medium)  
**Estimate:** 6 days

---

### Epic 16: User Experience Enhancements

#### US-034: Address Book ⭐
**As a** frequent user  
**I want to** save recipient addresses  
**So that** I don't have to enter them repeatedly

**Acceptance Criteria:**
- Add contact with name and address
- ENS name support
- Contact list with search
- Edit/delete contacts
- Select from contacts during send

**Technical Tasks:**
- [ ] Create contact data model
- [ ] Build contact management UI
- [ ] Implement search functionality
- [ ] Integrate with send flow
- [ ] Store in encrypted local storage
- [ ] Write unit tests

**Priority:** P2 (Medium)  
**Estimate:** 3 days

---

#### US-035: Transaction Notes ⭐
**As a** user  
**I want to** add notes to transactions  
**So that** I can remember why I sent them

**Acceptance Criteria:**
- Note field in send flow (optional)
- Notes displayed in transaction history
- Edit notes after transaction
- Private (local only)

**Technical Tasks:**
- [ ] Add note field to send form
- [ ] Store notes with transaction hash
- [ ] Display in transaction list/detail
- [ ] Implement edit functionality
- [ ] Write unit tests

**Priority:** P3 (Low)  
**Estimate:** 2 days

---

#### US-036: Portfolio Analytics ⭐
**As a** user  
**I want to** see portfolio analytics  
**So that** I can understand my holdings

**Acceptance Criteria:**
- Total portfolio value
- Asset allocation chart
- Price change indicators
- Profit/loss tracking
- Historical value chart

**Technical Tasks:**
- [ ] Implement portfolio calculation
- [ ] Integrate charting library (Chart.js/Recharts)
- [ ] Create analytics dashboard
- [ ] Fetch historical price data
- [ ] Calculate P&L
- [ ] Write unit tests

**Priority:** P2 (Medium)  
**Estimate:** 5 days

---

## Technical Debt & Infrastructure

### TD-001: Comprehensive Testing 🚀
- Increase unit test coverage to 80%+
- Add integration tests for critical flows
- Add E2E tests with Playwright
- Performance testing
- Security testing

**Estimate:** Ongoing

---

### TD-002: Error Handling & Monitoring ⭐
- Implement error boundary components
- Add Sentry or similar for error tracking
- Create user-friendly error messages
- Add analytics for user behavior
- Performance monitoring

**Estimate:** 3 days

---

### TD-003: Documentation 🚀
- API documentation
- Component storybook
- Developer onboarding guide
- Architecture decision records
- User documentation

**Estimate:** Ongoing

---

### TD-004: Security Audit ⭐
- Third-party security audit
- Penetration testing
- Code review by security experts
- Bug bounty program

**Estimate:** 2-4 weeks (external)

---

### TD-005: Performance Optimization ⭐
- Bundle size optimization
- Code splitting
- Image optimization
- Caching strategies
- Lazy loading

**Estimate:** 3 days

---

## Notes

- **Priority Levels:**
  - P0 (Critical): Must have for phase completion
  - P1 (High): Important for user experience
  - P2 (Medium): Nice to have
  - P3 (Low): Future consideration

- **Estimation:** Based on single developer, may vary with team size

- **Dependencies:** Some stories depend on completion of others, especially in authentication and wallet creation epics

- **Security:** All features involving private keys or transactions must undergo security review before production release
