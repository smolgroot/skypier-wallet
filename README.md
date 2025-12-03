# SkypierWallet - secp256r1 EVM Wallet# React + TypeScript + Vite



> A next-generation Ethereum wallet leveraging the Fusaka upgrade's secp256r1 support (EIP-7212) to enable biometric authentication via hardware security modules on mobile devices.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## 🎯 Project VisionCurrently, two official plugins are available:



SkypierWallet aims to make crypto accessible and secure for everyday users by eliminating seed phrase management through native biometric authentication (Face ID, Touch ID, fingerprint sensors). Built as a Progressive Web App (PWA), it provides a seamless cross-platform experience while leveraging modern device security features.- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## 🚀 Key Innovation

## React Compiler

**EIP-7212 Integration**: Utilizes secp256r1 curve (P-256) support in Ethereum to enable direct integration with mobile hardware security modules (Secure Enclave on iOS, StrongBox on Android), allowing users to sign transactions using their device's biometric sensors.

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## ✨ Features

## Expanding the ESLint configuration

### POC Phase (Current)

- ⏳ Biometric wallet creation using WebAuthn APIIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

- ⏳ Key generation with secp256r1 curve

- ⏳ Transaction signing with hardware-backed keys```js

- ⏳ Balance viewing (ETH)export default defineConfig([

- ⏳ Multi-network support (testnet focus: Sepolia, Base Sepolia)  globalIgnores(['dist']),

- ⏳ Basic send transactions  {

- ⏳ Import seed phrase wallet (fallback option)    files: ['**/*.{ts,tsx}'],

    extends: [

### MVP Phase (Planned)      // Other configs...

- 🔄 ERC-20 token detection and management

- 🔄 NFT viewing (ERC-721, ERC-1155)      // Remove tseslint.configs.recommended and replace with this

- 🔄 Transaction history (Blockscout API)      tseslint.configs.recommendedTypeChecked,

- 🔄 ENS resolution      // Alternatively, use this for stricter rules

- 🔄 Multi-network support (Base, Monad, Optimism, Arbitrum, mainnet)      tseslint.configs.strictTypeChecked,

- 🔄 Advanced settings (session timeout, security options)      // Optionally, add this for stylistic rules

- 🔄 Recovery mechanisms      tseslint.configs.stylisticTypeChecked,

- 🔄 WalletConnect integration

      // Other configs...

## 🛠 Tech Stack    ],

    languageOptions: {

- **Framework**: React 18 + Vite      parserOptions: {

- **Language**: TypeScript (strict mode)        project: ['./tsconfig.node.json', './tsconfig.app.json'],

- **Package Manager**: pnpm        tsconfigRootDir: import.meta.dirname,

- **UI Library**: Material-UI (MUI)      },

- **Styling**: MUI theming system + Emotion      // other options...

- **Crypto Libraries**:     },

  - `viem` - Ethereum interactions  },

  - `@noble/curves` - secp256r1 curve operations])

  - WebAuthn API - Hardware security module access```

- **State Management**: Zustand

- **Server State**: @tanstack/react-queryYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

- **Testing**: Vitest, React Testing Library

- **PWA**: vite-plugin-pwa```js

// eslint.config.js

## 📋 Prerequisitesimport reactX from 'eslint-plugin-react-x'

import reactDom from 'eslint-plugin-react-dom'

- Node.js 18+

- pnpm (install via `npm install -g pnpm`)export default defineConfig([

- Modern browser with WebAuthn support  globalIgnores(['dist']),

- Mobile device with biometric sensors (for full testing)  {

    files: ['**/*.{ts,tsx}'],

## 🚦 Getting Started    extends: [

      // Other configs...

```bash      // Enable lint rules for React

# Install dependencies      reactX.configs['recommended-typescript'],

pnpm install      // Enable lint rules for React DOM

      reactDom.configs.recommended,

# Run development server    ],

pnpm dev    languageOptions: {

      parserOptions: {

# Build for production        project: ['./tsconfig.node.json', './tsconfig.app.json'],

pnpm build        tsconfigRootDir: import.meta.dirname,

      },

# Run tests      // other options...

pnpm test    },

  },

# Run tests with UI])

pnpm test:ui```


# Generate coverage report
pnpm test:coverage

# Preview production build
pnpm preview
```

## 📁 Project Structure

```
skypier-wallet/
├── src/
│   ├── components/         # React components (Atomic Design)
│   │   ├── atoms/         # Basic building blocks
│   │   ├── molecules/     # Simple compositions
│   │   ├── organisms/     # Complex components
│   │   └── templates/     # Page layouts
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Business logic services
│   ├── lib/               # Core domain logic
│   │   ├── auth/          # Authentication (WebAuthn)
│   │   ├── crypto/        # Cryptographic operations
│   │   ├── blockchain/    # Blockchain interactions
│   │   └── storage/       # Encrypted storage
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   └── theme/             # MUI theme configuration
├── docs/                  # Project documentation
│   ├── README.md          # Detailed documentation
│   ├── UserStories.md     # Feature specifications
│   ├── Architecture.md    # Technical architecture
│   ├── Governance.md      # Project governance
│   └── CHANGELOG.md       # Version history
└── public/                # Static assets
```

## 🔐 Security Considerations

- **Private keys never leave the device**: All key material stays in hardware security modules
- **No seed phrase storage**: Biometric-first approach eliminates seed phrase vulnerabilities
- **Session management**: Auto-lock after configurable timeout (default: 5 minutes)
- **Encrypted local storage**: Sensitive data encrypted at rest
- **Recovery options**: Multiple recovery mechanisms for account access

## 📖 Documentation

For detailed documentation, see the [docs](./docs) folder:

- [User Stories](./docs/UserStories.md) - Feature specifications and tasks
- [Architecture](./docs/Architecture.md) - Technical architecture details
- [Governance](./docs/Governance.md) - Project governance and decision-making
- [Changelog](./docs/CHANGELOG.md) - Version history and updates

## 🗺 Roadmap

### Phase 1: POC - Q4 2025 (Current)
- Basic wallet functionality
- Biometric authentication
- Testnet support
- Core transaction features

### Phase 2: MVP - Q1 2026
- Token & NFT support
- Transaction history
- ENS integration
- Multi-network expansion

### Phase 3: Production - Q2 2026
- Mainnet launch
- Security audits
- WalletConnect integration
- Performance optimization

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

## 🤝 Contributing

This is currently a POC project. Contribution guidelines will be established during the MVP phase.

## 📄 License

MIT

## 🙏 Acknowledgments

- Ethereum Foundation for EIP-7212
- Fusaka upgrade contributors
- WebAuthn specification authors
- Open source crypto library maintainers

---

**⚠️ Note**: This is a proof-of-concept project. Do not use with real funds on mainnet until security audits are completed.
