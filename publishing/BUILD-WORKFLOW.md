# SIP Mobile Build & Publishing Workflow

## Overview

| Environment | Tool | Use Case |
|-------------|------|----------|
| **Development** | Expo Go / Dev Client | Testing on device |
| **Testing builds** | `eas build --local` | APK size verification |
| **Production** | EAS Cloud | Final releases for dApp Store |

---

## Local Build (Recommended for Testing)

### Prerequisites

```bash
# macOS
brew install openjdk@17
brew install --cask android-commandlinetools

# Set environment
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
```

### Build Command

```bash
cd ~/local-dev/sip-mobile

# Local APK build (no EAS quota used)
eas build --platform android --profile production --local \
  --output ./publishing/builds/sip-privacy-optimized.apk
```

### Build Time

| Run | Time |
|-----|------|
| First build | 10-20 min (downloads gradle, dependencies) |
| Subsequent | 5-10 min |

---

## EAS Cloud Build (Production)

### Free Tier Limits

| Resource | Limit |
|----------|-------|
| Android builds | 30/month |
| iOS builds | 30/month |
| Queue time | Variable (can be slow) |

### When to Use EAS Cloud

- Final production releases
- dApp Store submissions
- When consistent build environment needed

### Build Command

```bash
# Cloud build (uses quota)
eas build --platform android --profile production

# With wait for completion
eas build --platform android --profile production --no-wait
```

---

## APK Size Optimization

### Current Configuration (`app.json`)

```json
[
  "expo-build-properties",
  {
    "android": {
      "enableProguardInReleaseBuilds": true,
      "enableShrinkResourcesInReleaseBuilds": true,
      "useLegacyPackaging": true,
      "buildArchs": ["armeabi-v7a", "arm64-v8a"]
    }
  }
]
```

### Optimization Results

| Metric | Before | After |
|--------|--------|-------|
| APK Size | 112 MB | ~45 MB |
| Architectures | 4 | 2 (ARM only) |
| Barcode lib | 18.5 MB | Removed |
| Arweave cost | ~0.05 SOL | ~0.02 SOL |

### What Was Removed

| Component | Size Saved | Impact |
|-----------|------------|--------|
| x86/x86_64 | 48 MB | Emulator-only (no real users) |
| expo-camera | 18.5 MB | Unused (QR scanner TODO) |

---

## dApp Store Publishing

### First-Time Setup

```bash
cd ~/local-dev/sip-mobile/publishing

# Decrypt publisher keypair
age -d ~/.claude/sip-protocol/keys/solana/dapp-store.json.age > /tmp/dapp-store.json

# Validate config
npx @solana-mobile/dapp-store-cli validate \
  -k /tmp/dapp-store.json \
  -b /opt/homebrew/share/android-commandlinetools/build-tools/36.0.0
```

### Submit New Release

```bash
# 1. Place new APK
cp /path/to/new-build.apk builds/sip-privacy-release.apk

# 2. Create release NFT
npx @solana-mobile/dapp-store-cli create release \
  -k /tmp/dapp-store.json \
  -u https://api.mainnet-beta.solana.com \
  -b /opt/homebrew/share/android-commandlinetools/build-tools/36.0.0

# 3. Submit update
npx @solana-mobile/dapp-store-cli publish update \
  -k /tmp/dapp-store.json \
  -u https://api.mainnet-beta.solana.com \
  --complies-with-solana-dapp-store-policies \
  --requestor-is-authorized

# 4. Clean up keypair
rm /tmp/dapp-store.json
```

### Cost Per Release

| Item | Cost |
|------|------|
| Release NFT | ~0.002 SOL (reclaimable) |
| Arweave storage | ~0.02 SOL (permanent) |
| Transaction fees | ~0.001 SOL |
| **Total** | **~0.025 SOL** |

---

## Build Profiles (`eas.json`)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "apk" }
    },
    "production-full": {
      "android": { "buildType": "apk" }
    }
  }
}
```

| Profile | Use |
|---------|-----|
| `development` | Dev client with hot reload |
| `preview` | Internal testing |
| `production` | Optimized (ARM only) |
| `production-full` | All architectures (if needed) |

---

## Quick Reference

```bash
# Local build (no quota)
eas build --platform android --profile production --local

# Cloud build (uses quota)
eas build --platform android --profile production

# Check APK size
ls -lh publishing/builds/*.apk

# Validate dApp Store config
npx @solana-mobile/dapp-store-cli validate -k /tmp/dapp-store.json -b $ANDROID_BUILD_TOOLS
```

---

*Last updated: 2026-01-24*
