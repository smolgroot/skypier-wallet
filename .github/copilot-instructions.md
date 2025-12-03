<!-- Use this file to provide workspace-specific custom instructions to Copilot. -->

- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
  <!-- Project: SkypierWallet - React + Vite + TypeScript PWA with pnpm and MUI -->

- [x] Scaffold the Project
  <!-- Created Vite + React + TypeScript project with pnpm -->

- [x] Customize the Project
  <!-- Updated package.json, added MUI and crypto dependencies, created folder structure, configured vite and vitest -->

- [x] Install Required Extensions
  <!-- No additional extensions required beyond defaults -->

- [x] Compile the Project
  <!-- Project builds successfully with pnpm build -->

- [x] Core Services Implemented
  <!-- WebAuthn service, crypto keys service, encrypted storage service, Zustand wallet store -->

- [x] Create Welcome/Onboarding Page
  <!-- Welcome page with device capability checks and feature overview -->

- [ ] Create Wallet Creation UI Components

- [x] Launch the Project
  <!-- Dev server running on http://localhost:5173/ -->

- [ ] Ensure Documentation is Complete

## Project: SkypierWallet
A secp256r1-enabled EVM wallet PWA with biometric authentication leveraging EIP-7212.

**Tech Stack:**
- React 18 + Vite
- TypeScript (strict mode)
- pnpm (package manager)
- Material-UI (MUI) for UI components
- viem for Ethereum interactions
- @noble/curves for secp256r1 cryptography
- zustand for state management
- @tanstack/react-query for server state
- vite-plugin-pwa for PWA capabilities
- vitest for unit testing
