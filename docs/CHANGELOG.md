# Changelog

All notable changes to the Fusaka Wallet project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planning Phase - POC
Initial project setup and planning for proof-of-concept.

---

## [0.1.0] - 2025-12-03 - Project Initialization

### Added
- Project documentation structure
- Initial README with project vision and technical stack
- Comprehensive User Stories document covering POC, MVP, and Production phases
- Architecture documentation with technical specifications
- Governance framework and decision-making processes
- Project changelog (this file)

### Documentation
- **README.md**: Project overview, features, tech stack, and getting started guide
- **UserStories.md**: 36 detailed user stories organized by development phase
- **Architecture.md**: Complete technical architecture with code examples
- **Governance.md**: Project governance model and development workflow
- **CHANGELOG.md**: Version history and change tracking

### Technical Decisions
- Chose Next.js 14+ as framework for PWA capabilities
- Selected TypeScript for type safety
- Decided on viem for Ethereum interactions (over ethers.js)
- Chose Zustand for state management (over Redux)
- Selected React Query for server state management
- Integrated WebAuthn API for biometric authentication
- Selected secp256r1 curve implementation via @noble/curves
- Chose Blockscout API for transaction history
- Decided on client-side only architecture for POC

### Infrastructure
- Defined multi-network support strategy (Sepolia, Base Sepolia for POC)
- Planned EIP-7212 precompile integration for signature verification
- Designed encrypted local storage system
- Established security-first architecture with defense in depth

---

## Development Roadmap

### POC Phase - Q4 2025 (Current)

#### Sprint 1 - Core Authentication (Weeks 1-2)
**Target:** Basic wallet creation and authentication
- [ ] Project setup with Next.js and dependencies
- [ ] WebAuthn integration for biometric authentication
- [ ] secp256r1 key generation in hardware security module
- [ ] Ethereum address derivation
- [ ] Session management with configurable timeout
- [ ] Lock/unlock functionality

**Milestone:** Users can create and unlock biometric wallets

---

#### Sprint 2 - Wallet Import & UI Foundation (Weeks 3-4)
**Target:** Fallback wallet import and basic interface
- [ ] Seed phrase import functionality
- [ ] BIP-39 validation and HD wallet derivation
- [ ] Encrypted storage for imported wallets
- [ ] Basic home dashboard UI
- [ ] Network selector component
- [ ] Wallet switcher for multiple accounts

**Milestone:** Users can import existing wallets and navigate basic UI

---

#### Sprint 3 - Balance & Network (Week 5)
**Target:** Multi-network support and balance viewing
- [ ] Network configuration for Sepolia and Base Sepolia
- [ ] RPC provider integration with viem
- [ ] ETH balance fetching and display
- [ ] Price feed integration (CoinGecko)
- [ ] Currency formatting utilities
- [ ] Network switching functionality

**Milestone:** Users can view balances across testnets

---

#### Sprint 4 - Basic Transactions (Weeks 6-7)
**Target:** Send ETH transactions
- [ ] Transaction form with validation
- [ ] Gas estimation implementation
- [ ] Transaction preview modal
- [ ] EIP-7212 signature verification
- [ ] Transaction signing with biometric confirmation
- [ ] Transaction broadcasting to network
- [ ] Success/error handling

**Milestone:** Users can send ETH transactions with biometric confirmation

---

#### Sprint 5 - Receive & Polish (Week 8)
**Target:** Complete POC features
- [ ] Receive address modal with QR code
- [ ] Copy address functionality
- [ ] Share functionality (Web Share API)
- [ ] Onboarding flow (welcome screens)
- [ ] Dark/light theme toggle
- [ ] Loading states and error boundaries
- [ ] PWA manifest and service worker
- [ ] Unit tests for core functionality

**Milestone:** POC complete and ready for demo

---

### MVP Phase - Q1 2026 (Planned)

#### Sprint 6-7 - Token Support (Weeks 9-12)
- [ ] ERC-20 token detection
- [ ] Token list integration
- [ ] Token balance display
- [ ] Send ERC-20 tokens
- [ ] Custom token import
- [ ] Token approval flow

**Milestone:** Full token management

---

#### Sprint 8-9 - NFT Support (Weeks 13-16)
- [ ] NFT gallery implementation
- [ ] NFT metadata fetching
- [ ] NFT detail view
- [ ] Send NFT functionality
- [ ] Collection grouping
- [ ] IPFS image loading

**Milestone:** NFT viewing and transfers

---

#### Sprint 10 - Transaction History (Weeks 17-18)
- [ ] Blockscout API integration
- [ ] Transaction list with pagination
- [ ] Transaction detail view
- [ ] Transaction filtering
- [ ] Pending transaction handling
- [ ] Real-time status updates

**Milestone:** Complete transaction history

---

#### Sprint 11 - ENS Integration (Weeks 19-20)
- [ ] ENS name resolution
- [ ] Reverse resolution
- [ ] ENS avatar display
- [ ] Name caching
- [ ] Cross-chain ENS support

**Milestone:** ENS fully integrated

---

#### Sprint 12 - Multi-Network Expansion (Weeks 21-22)
- [ ] Mainnet configuration and security checks
- [ ] Base mainnet integration
- [ ] Optimism support
- [ ] Arbitrum support
- [ ] Monad preparation
- [ ] Network-specific features

**Milestone:** Production networks supported

---

#### Sprint 13-14 - Settings & Security (Weeks 23-26)
- [ ] Settings page structure
- [ ] Configurable session timeout
- [ ] Security settings
- [ ] Recovery mechanism
- [ ] Private key export (with warnings)
- [ ] Currency selection
- [ ] Biometric requirement toggle

**Milestone:** Enhanced security and customization

---

#### Sprint 15 - Testing & Polish (Weeks 27-28)
- [ ] Comprehensive unit test coverage (80%+)
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Bug fixing
- [ ] Documentation updates
- [ ] Security review

**Milestone:** MVP ready for beta testing

---

### Production Phase - Q2 2026 (Planned)

#### Sprint 16-18 - WalletConnect (Weeks 29-34)
- [ ] WalletConnect v2 SDK integration
- [ ] Session management
- [ ] dApp connection UI
- [ ] Request approval flow
- [ ] Connection manager

**Milestone:** dApp connectivity

---

#### Sprint 19-20 - Advanced Features (Weeks 35-38)
- [ ] Gas optimization (EIP-1559)
- [ ] Transaction queue
- [ ] Cancel/speed up transactions
- [ ] Address book
- [ ] Transaction notes
- [ ] Push notifications

**Milestone:** Advanced UX features

---

#### Sprint 21-22 - Security Hardening (Weeks 39-42)
- [ ] Third-party security audit
- [ ] Vulnerability fixes
- [ ] Penetration testing
- [ ] Bug bounty program setup
- [ ] Security documentation

**Milestone:** Security audit passed

---

#### Sprint 23 - Production Release (Week 43)
- [ ] Final testing
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Documentation finalization
- [ ] Marketing materials
- [ ] Public announcement

**Milestone:** Public mainnet launch

---

## Version History Template

### [Version] - YYYY-MM-DD

#### Added
- New features

#### Changed
- Changes to existing functionality

#### Deprecated
- Soon-to-be removed features

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Security improvements

---

## Notes

### Versioning Strategy
- **Major version (X.0.0)**: Breaking changes, major milestones
- **Minor version (0.X.0)**: New features, backward compatible
- **Patch version (0.0.X)**: Bug fixes, minor improvements

### Version Milestones
- **0.1.x**: Project setup and planning
- **0.2.x**: POC development
- **0.3.x - 0.9.x**: MVP development
- **1.0.0**: Production release on mainnet
- **1.x.x**: Post-launch features and improvements

### Changelog Maintenance
- Update this file with every significant change
- Include PR/issue references where applicable
- Group changes by type (Added, Changed, Fixed, etc.)
- Keep unreleased section at top
- Move to versioned section on release
- Use ISO date format (YYYY-MM-DD)

### Links Format
When versions are released, add comparison links:
```
[0.2.0]: https://github.com/org/fusaka-wallet/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/org/fusaka-wallet/releases/tag/v0.1.0
```

---

**Last Updated:** December 3, 2025  
**Current Version:** 0.1.0 (Planning)  
**Next Target:** 0.2.0 (POC Sprint 1 Complete)
