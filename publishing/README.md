# SIP Privacy - Solana dApp Store Publishing

Publishing configuration for submitting SIP Privacy to the Solana dApp Store (Seeker).

## Prerequisites

### Required Tools
- Node.js 18-21
- Android SDK Build Tools
- Java JDK 17+
- EAS CLI (`npm install -g eas-cli`)

### Environment Setup

```bash
# Android SDK path (add to .env or export)
export ANDROID_TOOLS_DIR="/path/to/android-sdk/build-tools/34.0.0"

# Java home
export JAVA_HOME="/path/to/jdk-17"
```

## Directory Structure

```
publishing/
├── config.yaml           # Main publishing config
├── package.json          # CLI dependencies
├── README.md             # This file
├── media/
│   ├── app-icon-512.png        # App icon (512x512)
│   ├── publisher-icon-512.png  # Publisher icon (512x512)
│   ├── banner-1200x600.png     # Banner graphic (1200x600)
│   └── screenshots/
│       ├── 01-home-dashboard.png
│       ├── 02-send-private.png
│       ├── 03-receive-stealth.png
│       ├── 04-swap-privacy.png
│       └── 05-compliance-audit.png
└── builds/
    └── sip-privacy-release.apk  # Release APK
```

## Publishing Steps

### 1. Build Release APK

```bash
# From project root
cd /Users/rz/local-dev/sip-mobile

# Build with EAS
eas build --platform android --profile production --local

# Or with Expo
npx expo build:android -t apk

# Copy APK to publishing directory
cp path/to/output.apk publishing/builds/sip-privacy-release.apk
```

### 2. Capture Screenshots

Run the app on an Android device/emulator and capture screenshots:

```bash
# Start dev server
npx expo start

# Press 'a' for Android emulator
# Navigate to each screen and capture:
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png media/screenshots/01-home-dashboard.png
```

Required screenshots (1920x1080 or 1080x1920):
1. `01-home-dashboard.png` - Home with wallet balance
2. `02-send-private.png` - Send with privacy toggle
3. `03-receive-stealth.png` - Receive with QR code
4. `04-swap-privacy.png` - Swap with privacy enabled
5. `05-compliance-audit.png` - Compliance dashboard

### 3. Validate Configuration

```bash
cd publishing
npx dapp-store validate
```

### 4. Create Publisher NFT (First Time Only)

```bash
# Create publisher identity on-chain
npx dapp-store create publisher

# Note: This requires a funded Solana wallet
# The publisher address will be added to config.yaml
```

### 5. Create App NFT (First Time Only)

```bash
# Create app entry
npx dapp-store create app

# The app address will be added to config.yaml
```

### 6. Create Release NFT

```bash
# Create release with APK and assets
npx dapp-store create release
```

### 7. Submit to Publisher Portal

```bash
# Submit for review
npx dapp-store publish submit
```

## Wallet Setup

Publishing requires a Solana wallet with SOL for transaction fees.

### Using a Keypair File

```bash
# Generate new keypair (or use existing)
solana-keygen new -o ~/.config/solana/dapp-store-keypair.json

# Fund with SOL (mainnet for production, devnet for testing)
solana airdrop 2 --keypair ~/.config/solana/dapp-store-keypair.json

# Set as default
export SOLANA_KEYPAIR=~/.config/solana/dapp-store-keypair.json
```

## CI/CD Integration

The publishing tool supports automated workflows:

```yaml
# .github/workflows/publish.yml
name: Publish to dApp Store

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd publishing
          pnpm install

      - name: Build APK
        run: eas build --platform android --profile production --non-interactive

      - name: Submit to dApp Store
        run: |
          cd publishing
          npx dapp-store publish submit
        env:
          SOLANA_KEYPAIR: ${{ secrets.DAPP_STORE_KEYPAIR }}
```

## Checklist

### Before First Submission
- [ ] Android SDK tools configured
- [ ] Java JDK 17+ installed
- [ ] Solana wallet funded
- [ ] Publisher NFT created
- [ ] App NFT created

### Before Each Release
- [ ] APK built and tested
- [ ] Screenshots captured (min 4)
- [ ] Banner graphic ready (1200x600)
- [ ] Version updated in app.json
- [ ] Release notes written
- [ ] `npx dapp-store validate` passes

### Submission
- [ ] Release NFT created
- [ ] Submitted via publisher portal
- [ ] Review status monitored

## Links

- [Solana dApp Store Docs](https://docs.solanamobile.com/dapp-publishing/intro)
- [Publishing Overview](https://docs.solanamobile.com/dapp-publishing/overview)
- [Listing Guidelines](https://docs.solanamobile.com/dapp-publishing/listing-page-guidelines)
- [Developer Agreement](https://docs.solanamobile.com/dapp-publishing/agreement)
- [dApp Publishing CLI](https://github.com/solana-mobile/dapp-publishing)

## Troubleshooting

### "bigint: Failed to load bindings"
This warning is safe to ignore. The CLI will use pure JS implementation.

### Validation Errors
```bash
# Check specific validation issues
npx dapp-store validate --verbose
```

### APK Signing
The APK must be signed with a unique key NOT used for Google Play:
```bash
# Generate new keystore
keytool -genkey -v -keystore dapp-store.keystore -alias sip-privacy -keyalg RSA -keysize 2048 -validity 10000
```
