# Fusaka Wallet - secp256r1 EVM Wallet POC

> A next-generation Ethereum wallet leveraging the Fusaka upgrade's secp256r1 support (EIP-7212) to enable biometric authentication via hardware security modules on mobile devices.

## 🎯 Project Vision

Fusaka Wallet aims to make crypto accessible and secure for everyday users by eliminating seed phrase management through native biometric authentication (Face ID, Touch ID, fingerprint sensors). Built as a Progressive Web App (PWA), it provides a seamless cross-platform experience while leveraging modern device security features.

## 🚀 Key Innovation

**EIP-7212 Integration**: Utilizes secp256r1 curve (P-256) support in Ethereum to enable direct integration with mobile hardware security modules (Secure Enclave on iOS, StrongBox on Android), allowing users to sign transactions using their device's biometric sensors.

## ✨ Features

### POC Phase (Current)
- ✅ Biometric wallet creation using WebAuthn API
- ✅ Key generation with secp256r1 curve
- ✅ Transaction signing with hardware-backed keys
- ✅ Balance viewing (ETH)
- ✅ Multi-network support (testnet focus: Sepolia, Base Sepolia)
- ✅ Basic send transactions
- ✅ Import seed phrase wallet (fallback option)

### MVP Phase (Planned)
- 🔄 ERC-20 token detection and management
- 🔄 NFT viewing (ERC-721, ERC-1155)
- 🔄 Transaction history (Blockscout API)
- 🔄 ENS resolution
- 🔄 Multi-network support (Base, Monad, Optimism, Arbitrum, mainnet)
- 🔄 Advanced settings (session timeout, security options)
- 🔄 Recovery mechanisms
- 🔄 WalletConnect integration
- 🔄 Gas optimization features

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **Crypto Libraries**: 
  - `viem` - Ethereum interactions
  - `@noble/curves` - secp256r1 curve operations
  - WebAuthn API - Hardware security module access
- **State Management**: Zustand
- **API Integration**: Blockscout API, Ethereum JSON-RPC
- **Testing**: Vitest, React Testing Library
- **PWA**: next-pwa

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────┐
│           PWA Shell (Next.js)               │
├─────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │   UI Layer   │  │   Service Worker     │ │
│  │  (React)     │  │   (Offline Support)  │ │
│  └──────────────┘  └──────────────────────┘ │
├─────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Wallet     │  │   Authentication     │ │
│  │   Manager    │  │   Manager            │ │
│  └──────────────┘  └──────────────────────┘ │
├─────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Crypto Layer │  │   Network Manager    │ │
│  │ (secp256r1)  │  │   (Multi-chain)      │ │
│  └──────────────┘  └──────────────────────┘ │
├─────────────────────────────────────────────┤
│           Hardware Security Module          │
│         (Secure Enclave / StrongBox)        │
└─────────────────────────────────────────────┘
```

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- Modern browser with WebAuthn support
- Mobile device with biometric sensors (for full testing)

## 🚦 Getting Started

```bash
# Clone the repository
git clone <repository-url>
cd fusaka-wallet-poc

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 🔐 Security Considerations

- **Private keys never leave the device**: All key material stays in hardware security modules
- **No seed phrase storage**: Biometric-first approach eliminates seed phrase vulnerabilities
- **Session management**: Auto-lock after configurable timeout (default: 5 minutes)
- **Encrypted local storage**: Sensitive data encrypted at rest
- **Recovery options**: Multiple recovery mechanisms for account access

## 🌐 Supported Networks

### POC Phase
- Sepolia (Ethereum Testnet)
- Base Sepolia (Base Testnet)

### MVP Phase
- Ethereum Mainnet
- Base
- Optimism
- Arbitrum
- Monad (when available)
- Polygon

## 📱 PWA Features

- ✅ Installable on iOS and Android
- ✅ Offline balance viewing (cached)
- ✅ Push notifications (transaction confirmations)
- ✅ Native app-like experience
- ✅ Fast loading with service worker caching

## 🧪 Testing Strategy

- **Unit Tests**: Core wallet functions, crypto operations, utilities
- **Integration Tests**: Planned for MVP phase
- **E2E Tests**: Planned for MVP phase
- **Security Audits**: Planned before mainnet launch

## 📖 Documentation

- [User Stories](./UserStories.md) - Feature specifications and tasks
- [Architecture](./Architecture.md) - Technical architecture details
- [Governance](./Governance.md) - Project governance and decision-making
- [Changelog](./CHANGELOG.md) - Version history and updates

## 🗺 Roadmap

### Phase 1: POC (Current) - Q4 2025
- Basic wallet functionality
- Biometric authentication
- Testnet support
- Core transaction features

### Phase 2: MVP - Q1 2026
- Token & NFT support
- Transaction history
- ENS integration
- Multi-network expansion
- Advanced security features

### Phase 3: Production - Q2 2026
- Mainnet launch
- Security audits
- WalletConnect integration
- Enhanced UX features
- Performance optimization

## 🤝 Contributing

This is currently a POC project. Contribution guidelines will be established during the MVP phase.

## 📄 License

[To be determined]

## 🙏 Acknowledgments

- Ethereum Foundation for EIP-7212
- Fusaka upgrade contributors
- WebAuthn specification authors
- Open source crypto library maintainers

## 📞 Contact

[To be added]

---

**Note**: This is a proof-of-concept project. Do not use with real funds on mainnet until security audits are completed.
