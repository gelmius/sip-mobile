# CLAUDE.md - SIP Mobile

> **Ecosystem:** [sip-protocol/CLAUDE.md](https://github.com/sip-protocol/sip-protocol/blob/main/CLAUDE.md)

**Purpose:** Privacy-first Solana wallet — native key management + shielded payments on iOS, Android & Seeker

**Positioning:** Standalone privacy wallet (not a layer on top of other wallets)

---

## Quick Reference

**Stack:** Expo 52, React Native, NativeWind 4, Zustand 5, Expo Router

```bash
pnpm install              # Install
npx expo start            # Dev server
pnpm typecheck            # Type check
eas build --platform android --profile production --local  # Local APK
```

**Tabs:** Home | Send | Receive | Swap | Settings

---

## Wallet Architecture

**Philosophy:** SIP Privacy IS the wallet — users manage keys directly, no external wallet required.

### Wallet Strategy

| Method | Platform | Priority | Status |
|--------|----------|----------|--------|
| **Native Wallet** | All | PRIMARY | 🔲 In Progress |
| **Seed Vault** | Seeker | PRIMARY | 🔲 Planned |
| MWA | Android | Optional | ✅ Available |
| Phantom Deeplinks | iOS | Optional | ✅ Available |
| ~~Privy~~ | ~~All~~ | DEPRECATED | ⚠️ Removing |

### Key Management

```
┌─────────────────────────────────────────────────────────────┐
│  PRIMARY: Native Wallet (useNativeWallet)                   │
│  ├── Generate new wallet (BIP39 mnemonic)                   │
│  ├── Import seed phrase (12/24 words)                       │
│  ├── Import private key (base58)                            │
│  ├── SecureStore + Biometrics for security                  │
│  └── Solana derivation: m/44'/501'/0'/0'                    │
├─────────────────────────────────────────────────────────────┤
│  SEEKER: Direct Seed Vault Integration                      │
│  └── No Phantom middleman — direct Seed Vault API           │
├─────────────────────────────────────────────────────────────┤
│  OPTIONAL: External Wallet Connection                       │
│  ├── MWA (Android) — connect to Phantom/Solflare            │
│  └── Phantom Deeplinks (iOS) — connect to Phantom           │
└─────────────────────────────────────────────────────────────┘
```

### Security Model

| Layer | Implementation |
|-------|----------------|
| Key Storage | `expo-secure-store` (Keychain/Keystore) |
| Access Control | Biometric auth via `expo-local-authentication` |
| Derivation | BIP39 → BIP44 (Solana path) |
| Memory | Keys cleared after signing operations |
| Backup | Mnemonic export (biometric required) |

### Key Files

```
src/hooks/useNativeWallet.ts   # Primary wallet hook (TODO)
src/hooks/useSeedVault.ts      # Seeker Seed Vault integration (TODO)
src/hooks/useMWA.ts            # Optional: Android external wallet
src/hooks/usePhantomDeeplink.ts # Optional: iOS external wallet
src/utils/keyStorage.ts        # SecureStore utilities (TODO)
```

---

## Structure

```
app/(tabs)/     # Tab screens (index, send, receive, swap, settings)
src/components/ # UI components (Button, Card, Input, Modal, Toggle)
src/stores/     # Zustand stores (wallet, settings, privacy, swap, toast)
publishing/     # APK builds, dApp Store config
```

---

## Build & Publishing

> **Details:** [publishing/BUILD-WORKFLOW.md](publishing/BUILD-WORKFLOW.md)

**APK Optimization:** ARM only, ProGuard, shrink resources (112MB → ~45MB)

**dApp Store:** Published as App NFT `2THAY9h4MaxsCtbm2WVj1gn2NMbVN3GUhLQ1EkMvqQby`

**Cost/release:** ~0.025 SOL (Arweave ~0.02 + NFT rent ~0.002 + fees)

---

## Versioning (IMPORTANT)

> **Bump version BEFORE every build** — Same version = store won't recognize update.

```bash
# app.json — increment BOTH before building:
"version": "0.1.1"              # versionName (human-readable)
"android": { "versionCode": 2 } # MUST increment for store updates
```

---

## Debug Workflow

> **⚠️ NEVER use Expo cloud builds** — Free tier quota limited. Local only.

```bash
# Build (ALWAYS --local)
eas build --platform android --profile production --local

# ADB WiFi: Device → Developer Options → Wireless debugging → Pair
adb pair <IP>:<PORT> <CODE>    # First time only
adb connect <IP>:<PORT>        # Daily reconnect

# Install & run
adb install -r build-*.apk
adb shell am start -n com.sipprotocol.mobile/.MainActivity

# Debug
adb logcat | grep -iE "error|exception|sip"   # Logs
scrcpy                                         # Screen mirror
scrcpy --record session.mp4                    # Record
```

---

## Guidelines

**DO:**
- Test on real devices (especially Seeker for Seed Vault)
- Use NativeWind classes for styling
- Use SecureStore for ALL key storage
- Handle offline gracefully
- Require biometric for sensitive operations

**DON'T:**
- Block main thread with crypto operations
- Ignore keyboard/safe areas
- Use Expo cloud builds (local only)
- Log or expose private keys
- Store keys in AsyncStorage (use SecureStore)

**Packages:**
- `@sip-protocol/sdk` — Privacy primitives
- `@noble/curves`, `@noble/hashes` — Cryptography
- `expo-secure-store` — Key storage
- `expo-local-authentication` — Biometrics
- `@scure/bip39`, `@scure/bip32` — Key derivation

---

## Related Issues

- [#61](https://github.com/sip-protocol/sip-mobile/issues/61) — EPIC: Native Wallet Architecture
- [#67](https://github.com/sip-protocol/sip-mobile/issues/67) — useNativeWallet hook
- [#68](https://github.com/sip-protocol/sip-mobile/issues/68) — keyStorage utilities
- [#70](https://github.com/sip-protocol/sip-mobile/issues/70) — Seed Vault integration

---

**Status:** v0.1.2 | dApp Store submitted | Wallet pivot in progress
