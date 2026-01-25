# SIP Privacy

> Privacy-first Solana wallet — native key management + shielded payments

**Live:** Solana dApp Store (App NFT: `2THAY9h4MaxsCtbm2WVj1gn2NMbVN3GUhLQ1EkMvqQby`)

## Overview

SIP Privacy is a **standalone privacy wallet** for Solana — not a layer on top of other wallets. Create or import your wallet directly, then send shielded payments with stealth addresses and Pedersen commitments.

Built with Expo SDK 52 for iOS, Android, and Solana Mobile (Seeker).

## Features

- **Native Wallet** — Create or import wallet directly (seed phrase / private key)
- **Private Payments** — Send and receive shielded payments with stealth addresses
- **Private Swaps** — Jupiter DEX integration with privacy toggle
- **Secure Storage** — Keys protected with SecureStore + biometrics
- **Seed Vault** — Direct integration on Seeker (no Phantom middleman)
- **External Wallets** — Optional MWA (Android) & Phantom (iOS) connection

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Type check
pnpm typecheck
```

## Project Structure

```
sip-mobile/
├── app/
│   └── (tabs)/           # Tab screens (index, send, receive, swap, settings)
├── src/
│   ├── components/       # UI components (Button, Card, Input, Modal, Toggle)
│   └── stores/           # Zustand stores (wallet, settings, privacy, swap, toast)
├── publishing/           # APK builds, dApp Store config
└── assets/               # Images, icons, fonts
```

## Tech Stack

- **Framework:** Expo SDK 52, React Native
- **Styling:** NativeWind 4.0 (Tailwind for RN)
- **State:** Zustand 5
- **Navigation:** Expo Router
- **Crypto:** @noble/curves, @noble/hashes, @scure/bip39, @scure/bip32
- **Storage:** Expo SecureStore (keys), Expo Local Authentication (biometrics)
- **Privacy:** @sip-protocol/sdk (stealth addresses, Pedersen commitments)

## Build & Publishing

### Local APK Build

```bash
eas build --platform android --profile production --local
```

### Optimizations

- ARM-only build (no x86)
- ProGuard + shrink resources
- Result: 112MB → ~45MB

### Solana dApp Store

Published as App NFT with ~0.025 SOL per release (Arweave + NFT rent + fees).

See [publishing/BUILD-WORKFLOW.md](publishing/BUILD-WORKFLOW.md) for details.

## Wallet Strategy

| Platform | Primary | Optional Integration |
|----------|---------|---------------------|
| All | **Native Wallet** (built-in) | — |
| Seeker | Native + Seed Vault | MWA for external wallets |
| Android | Native Wallet | MWA connection |
| iOS | Native Wallet | Phantom connection |

### Key Management

```
Create new wallet    →  BIP39 mnemonic (12/24 words)
Import seed phrase   →  Standard Solana derivation (m/44'/501'/0'/0')
Import private key   →  Base58 encoded
Security             →  SecureStore + biometric authentication
```

## Related

- [sip-protocol](https://github.com/sip-protocol/sip-protocol) — Core SDK
- [sip-app](https://github.com/sip-protocol/sip-app) — Web application
- [docs-sip](https://github.com/sip-protocol/docs-sip) — Documentation

## License

MIT

---

*Part of the [SIP Protocol](https://github.com/sip-protocol) ecosystem*
