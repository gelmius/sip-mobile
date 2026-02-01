<div align="center">

<pre>
███████╗ ██╗ ██████╗     ██████╗ ██████╗ ██╗██╗   ██╗ █████╗  ██████╗██╗   ██╗
██╔════╝ ██║ ██╔══██╗    ██╔══██╗██╔══██╗██║██║   ██║██╔══██╗██╔════╝╚██╗ ██╔╝
███████╗ ██║ ██████╔╝    ██████╔╝██████╔╝██║██║   ██║███████║██║      ╚████╔╝
╚════██║ ██║ ██╔═══╝     ██╔═══╝ ██╔══██╗██║╚██╗ ██╔╝██╔══██║██║       ╚██╔╝
███████║ ██║ ██║         ██║     ██║  ██║██║ ╚████╔╝ ██║  ██║╚██████╗   ██║
╚══════╝ ╚═╝ ╚═╝         ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝   ╚═╝
</pre>

# SIP Privacy Mobile Wallet

> **Privacy is not a feature. It's a right.**

**The first privacy-native Solana wallet — stealth addresses + viewing keys for iOS, Android & Seeker**

*One toggle to shield • Native key management • Compliant privacy • Jupiter DEX integration*

[![CI](https://github.com/sip-protocol/sip-mobile/actions/workflows/ci.yml/badge.svg)](https://github.com/sip-protocol/sip-mobile/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?logo=solana&logoColor=white)](https://solana.com/)
[![dApp Store](https://img.shields.io/badge/Solana-dApp_Store-14F195?logo=solana&logoColor=white)](https://solanamobile.com/dapp-store)

**Solana Privacy Hackathon 2026 Submission** | [Download APK v0.1.6](https://github.com/sip-protocol/sip-mobile/releases/tag/v0.1.6) | [Live Demo Videos](https://sip-protocol.org/showcase/solana-privacy-2026)

</div>

---

## Table of Contents

- [What is SIP Privacy?](#-what-is-sip-privacy)
- [Quick Preview](#-quick-preview)
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Architecture](#%EF%B8%8F-architecture)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Wallet Strategy](#-wallet-strategy)
- [Build & Publishing](#-build--publishing)
- [Development](#-development)
- [Security](#-security)
- [Related Projects](#-related-projects)
- [License](#-license)

---

## 🛡️ What is SIP Privacy?

SIP Privacy is a **standalone privacy wallet** for Solana — not a layer on top of other wallets. Create or import your wallet directly, then send shielded payments with stealth addresses and Pedersen commitments.

```
Traditional Wallet  → Public transactions (everyone sees everything)
SIP Privacy Wallet  → Shielded transactions (you control who sees what)
```

**Stop exposing your financial activity. Start transacting privately.**

---

## 🎥 Quick Preview

### 8 Demo Videos on Seeker Device

| Category | Videos |
|----------|--------|
| **Getting Started** | Onboarding & Education, Wallet Setup, Settings & Navigation |
| **Privacy Transactions** | Devnet E2E Flow, Mainnet E2E Flow, On-Chain Verification |
| **Compliance** | Compliant Privacy Flow, Viewing Keys & Compliance |

**[Watch All Demo Videos →](https://sip-protocol.org/showcase/solana-privacy-2026)**

### The Privacy Upgrade

<table>
<tr>
<th width="50%">❌ Traditional Wallet</th>
<th width="50%">✅ SIP Privacy Wallet</th>
</tr>
<tr>
<td valign="top">

```
Send 10 SOL to alice.sol

Public record:
• Your address: 7xK9...
• Amount: 10 SOL
• Recipient: alice.sol
• Forever on-chain
```

**Everyone sees:**
- 🔴 Your wallet address
- 🔴 Exact amounts
- 🔴 Recipient identity
- 🔴 Full transaction history

</td>
<td valign="top">

```
Send 10 SOL to alice.sol
(Privacy: Shielded)

On-chain record:
• Stealth address: 9aB3...
• Commitment: 0xdef...
• No link to alice.sol
```

**Protected:**
- ✅ Sender hidden
- ✅ Amount hidden (commitment)
- ✅ Recipient hidden (stealth)
- ✅ Unlinkable transactions

</td>
</tr>
</table>

---

## 🎯 The Problem

Mobile wallets expose **everything** about your transactions. This isn't just inconvenient — it's a surveillance system.

### What's Exposed on Solana

| Data Point | Visibility | Risk |
|------------|------------|------|
| **Your Address** | Public | Targeted phishing, social engineering |
| **Token Balances** | Public | Wealth profiling, price discrimination |
| **Transaction History** | Permanent | Financial surveillance, address clustering |
| **Recipient Addresses** | Public | Social graph analysis, relationship mapping |

### Real Consequences

- **Targeted attacks** — High-value wallets get phished
- **MEV extraction** — Bots front-run your swaps
- **Price discrimination** — Services charge based on your balance
- **Surveillance** — Governments/exchanges track all activity

---

## 💡 The Solution

SIP Privacy wraps Solana transactions in a **cryptographic privacy layer** using battle-tested technology.

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  SIP PRIVACY MOBILE WALLET                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              PRIVACY LAYER                           │    │
│  │  • Stealth addresses (DKSAP - one-time recipients)   │    │
│  │  • Pedersen commitments (hide amounts)               │    │
│  │  • Viewing keys (selective disclosure)               │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              SIP-PRIVACY PROGRAM                     │    │
│  │  • On-chain privacy execution                        │    │
│  │  • Mainnet: S1PMFs...cX9                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              SOLANA BLOCKCHAIN                       │    │
│  │  • Fast finality (~400ms)                            │    │
│  │  • Low fees (~$0.001)                                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Core Privacy Mechanisms

| Mechanism | Purpose | How It Works |
|-----------|---------|--------------|
| **Stealth Addresses** | Hide recipients | Fresh one-time address per transaction |
| **Pedersen Commitments** | Hide amounts | `value * G + blinding * H` |
| **Viewing Keys** | Selective disclosure | Share read-only access with auditors |
| **Privacy Levels** | User control | Transparent, Shielded, or Compliant |

---

## ✨ Key Features

### 🔐 **Native Wallet**
Create or import your wallet directly — no dependency on external wallets. Your keys, your crypto.

### 🛡️ **Three Privacy Levels**

| Level | Description | Use Case |
|-------|-------------|----------|
| `Transparent` | Standard public transaction | When privacy isn't needed |
| `Shielded` | Full privacy (stealth + commitment) | Personal transactions |
| `Compliant` | Privacy + viewing key | Institutional/tax compliance |

### 👻 **Stealth Addresses**
Every payment uses a fresh one-time address. No address reuse, no transaction linkability.

### 🔑 **Viewing Keys**
Share read-only access with auditors or tax authorities without exposing your spending keys.

### 💱 **Jupiter DEX Integration**
Swap any Solana token with privacy toggle. Best routes + privacy protection.

### 📱 **Multi-Platform**
- **iOS** — App Store ready
- **Android** — Google Play + direct APK
- **Seeker** — Solana dApp Store (native Seed Vault integration)

### 🔒 **Secure Storage**
Keys protected with SecureStore + biometric authentication (Face ID / fingerprint).

---

## 📦 Installation

### Download APK (Android/Seeker)

**[Download APK v0.1.6 →](https://github.com/sip-protocol/sip-mobile/releases/tag/v0.1.6)**

### Build from Source

```bash
# Clone the repository
git clone https://github.com/sip-protocol/sip-mobile.git
cd sip-mobile

# Install dependencies
pnpm install

# Start development server
npx expo start
```

---

## 🚀 Quick Start

### 1. Create or Import Wallet

```
Create new wallet    →  BIP39 mnemonic (12/24 words)
Import seed phrase   →  Standard Solana derivation (m/44'/501'/0'/0')
Import private key   →  Base58 encoded
```

### 2. Fund Your Wallet

Send SOL to your wallet address. Works on both devnet and mainnet.

### 3. Send Private Payment

1. Go to **Send** tab
2. Enter recipient address or scan QR
3. Enter amount
4. Select **Privacy Level**: Transparent, Shielded, or Compliant
5. Confirm and send

### 4. Receive Private Payment

1. Go to **Receive** tab
2. Share your **Stealth Meta-Address** (not your public key)
3. Sender uses SIP to generate one-time stealth address
4. **Scan** to detect incoming payments

### 5. Export Viewing Key (Optional)

For auditors/compliance:
1. Go to **Settings** → **Viewing Keys**
2. Export viewing key for specific time range
3. Share with auditor (they can see but not spend)

---

## 🏗️ Architecture

### Project Structure

```
sip-mobile/
├── app/                      # Expo Router screens
│   ├── (onboarding)/         # Education + wallet setup flow
│   ├── (tabs)/               # Main tab screens
│   │   ├── index.tsx         # Home (dashboard)
│   │   ├── send.tsx          # Send payments
│   │   ├── receive.tsx       # Receive + scan
│   │   ├── swap.tsx          # Jupiter DEX
│   │   └── settings.tsx      # Settings + keys
│   └── _layout.tsx           # Root layout
├── src/
│   ├── components/           # UI components
│   │   ├── ui/               # Base (Button, Card, Input, Modal)
│   │   ├── wallet/           # Wallet-specific components
│   │   └── privacy/          # Privacy UI (level selector, etc.)
│   ├── hooks/                # React hooks
│   │   ├── useNativeWallet.ts
│   │   ├── useSendPayment.ts
│   │   ├── useScanPayments.ts
│   │   └── useQuote.ts       # Jupiter quotes
│   ├── stores/               # Zustand stores
│   │   ├── wallet.ts         # Wallet state
│   │   ├── privacy.ts        # Privacy settings
│   │   ├── settings.ts       # App settings
│   │   └── swap.ts           # Swap state
│   ├── lib/                  # Core utilities
│   │   ├── sip-client.ts     # SIP SDK integration
│   │   ├── solana.ts         # Solana connection
│   │   └── crypto.ts         # Cryptographic helpers
│   └── privacy-providers/    # Privacy backend adapters
├── publishing/               # Build configs, dApp Store
└── assets/                   # Images, icons, fonts
```

### Data Flow

```
User Action → Privacy Layer → Solana Program → Blockchain
     │              │               │              │
     │              ▼               │              │
     │       ┌──────────────┐      │              │
     │       │ Generate     │      │              │
     │       │ Stealth Addr │      │              │
     │       └──────────────┘      │              │
     │              │               │              │
     │              ▼               │              │
     │       ┌──────────────┐      │              │
     │       │ Create       │      │              │
     │       │ Commitment   │      │              │
     │       └──────────────┘      │              │
     │              │               │              │
     └──────────────┴───────────────┴──────────────┘
```

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Expo SDK 54 | Cross-platform development |
| **UI** | React Native 0.81 | Native components |
| **Styling** | NativeWind 4.0 | Tailwind CSS for React Native |
| **State** | Zustand 5 | Lightweight state management |
| **Navigation** | Expo Router | File-based routing |
| **Cryptography** | @noble/curves, @noble/hashes | Stealth addresses, commitments |
| **Key Derivation** | @scure/bip39, @scure/bip32 | HD wallet support |
| **Secure Storage** | Expo SecureStore | Encrypted key storage |
| **Biometrics** | Expo Local Authentication | Face ID / fingerprint |
| **Privacy SDK** | @sip-protocol/sdk | Core privacy primitives |
| **DEX** | Jupiter API | Token swaps |

---

## 👛 Wallet Strategy

SIP Privacy is a **standalone wallet** — not a connector to other wallets.

### Platform Support

| Platform | Primary Wallet | Optional Integration |
|----------|----------------|---------------------|
| **All** | Native Wallet (built-in) | — |
| **Seeker** | Native + Seed Vault | MWA for external apps |
| **Android** | Native Wallet | MWA connection (optional) |
| **iOS** | Native Wallet | Phantom connection (optional) |

### Key Management

| Method | Security | Recovery |
|--------|----------|----------|
| **Create New** | SecureStore + biometrics | 12/24 word seed phrase |
| **Import Seed** | SecureStore + biometrics | BIP39 standard |
| **Import Key** | SecureStore + biometrics | Base58 private key |
| **Seed Vault** | Hardware-backed (Seeker) | Device-managed |

---

## 📱 Build & Publishing

### EAS Cloud Build (Recommended)

```bash
# Development build
eas build --profile development --platform android

# Production APK
eas build --profile production --platform android

# Production AAB (Play Store)
eas build --profile production --platform android --type aab
```

### Build Optimizations

| Optimization | Before | After |
|--------------|--------|-------|
| ARM-only (no x86) | 112MB | ~65MB |
| ProGuard + shrink | 65MB | ~45MB |
| Hermes bytecode | 45MB | ~40MB |

### Solana dApp Store

Published as App NFT:
- **App NFT:** `2THAY9h4MaxsCtbm2WVj1gn2NMbVN3GUhLQ1EkMvqQby`
- **Cost:** ~0.025 SOL per release (Arweave + NFT rent)

See [publishing/BUILD-WORKFLOW.md](publishing/BUILD-WORKFLOW.md) for details.

---

## 💻 Development

### Prerequisites

- Node.js 20+
- pnpm 9+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode (for native builds)

### Commands

```bash
pnpm install          # Install dependencies
npx expo start        # Start dev server
npx expo run:ios      # Run on iOS simulator
npx expo run:android  # Run on Android emulator
pnpm typecheck        # Type check
pnpm lint             # Lint code
pnpm test:run         # Run tests
```

### Environment Setup

```bash
# .env.local
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
EXPO_PUBLIC_HELIUS_API_KEY=your-key
```

---

## 🔐 Security

### Threat Model

| Threat | Mitigation |
|--------|------------|
| **Key extraction** | SecureStore encryption + biometrics |
| **Transaction replay** | Unique stealth addresses per tx |
| **Amount correlation** | Pedersen commitments hide values |
| **Network analysis** | Stealth addresses break linkability |

### Security Best Practices

- ✅ Keys never leave the device (except explicit export)
- ✅ Biometric authentication for sensitive operations
- ✅ No analytics or tracking in production
- ✅ Open source for audit
- ❌ Never share your seed phrase
- ❌ Never screenshot your keys

### Reporting Security Issues

If you discover a vulnerability:
- Email: **security@sip-protocol.org**
- Do NOT open public issues for security vulnerabilities
- We follow responsible disclosure

---

## 🔗 Related Projects

| Project | Description | Link |
|---------|-------------|------|
| **sip-protocol** | Core SDK (6,600+ tests) | [GitHub](https://github.com/sip-protocol/sip-protocol) |
| **sip-app** | Web application | [GitHub](https://github.com/sip-protocol/sip-app) |
| **docs-sip** | Documentation | [docs.sip-protocol.org](https://docs.sip-protocol.org) |
| **blog-sip** | Technical blog | [blog.sip-protocol.org](https://blog.sip-protocol.org) |

---

## 📄 License

[MIT License](LICENSE) — see LICENSE file for details.

---

<div align="center">

**Solana Privacy Hackathon 2026 Submission**

*Privacy is not a feature. It's a right.*

[Download APK](https://github.com/sip-protocol/sip-mobile/releases/tag/v0.1.6) · [Demo Videos](https://sip-protocol.org/showcase/solana-privacy-2026) · [Documentation](https://docs.sip-protocol.org) · [Report Bug](https://github.com/sip-protocol/sip-mobile/issues)

*Part of the [SIP Protocol](https://github.com/sip-protocol) ecosystem*

</div>
