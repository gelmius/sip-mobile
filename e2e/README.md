# E2E Testing with Detox

End-to-end testing framework for SIP Privacy mobile app.

## Prerequisites

1. **iOS (macOS only)**
   - Xcode 15+
   - iOS Simulator (iPhone 15 Pro recommended)
   - `applesimutils`: `brew tap wix/brew && brew install applesimutils`

2. **Android**
   - Android Studio
   - Android SDK
   - Emulator (Pixel 7 API 34 recommended) or physical device

## Setup

```bash
# Install dependencies
pnpm install

# Build native code (required after native changes)
pnpm prebuild
```

## Running Tests

### iOS Simulator

```bash
# Build the debug app
pnpm e2e:build:ios

# Run tests
pnpm e2e:test:ios
```

### Android Emulator

```bash
# Start emulator first (Pixel_7_API_34)
emulator -avd Pixel_7_API_34

# Build the debug app
pnpm e2e:build:android

# Run tests
pnpm e2e:test:android
```

### Android Physical Device (Seeker/Saga)

```bash
# Connect device via USB, enable USB debugging

# Build and test
pnpm e2e:build:android
pnpm e2e:test:android:att
```

## Test Structure

```
e2e/
├── jest.config.js    # Jest configuration for Detox
├── utils.ts          # Helper functions
├── onboarding.test.ts   # Wallet creation/import tests
├── send.test.ts      # Send payment tests
├── settings.test.ts  # Settings screen tests
└── README.md         # This file
```

## Writing Tests

### Test IDs Convention

All testable elements should have `testID` props:

```tsx
<TouchableOpacity testID="send-button" />
<TextInput testID="amount-input" />
<View testID="wallet-balance" />
```

### Naming Convention

- Screens: `{screen-name}-screen` (e.g., `send-screen`)
- Buttons: `{action}-button` (e.g., `send-button`, `confirm-button`)
- Inputs: `{field}-input` (e.g., `amount-input`, `recipient-input`)
- Toggles: `{feature}-toggle` (e.g., `privacy-toggle`)
- Indicators: `{type}-indicator` (e.g., `loading-indicator`)

### Using Helpers

```typescript
import { navigateToTab, waitForVisible, typeInField } from './utils';

it('should send payment', async () => {
  await navigateToTab('Send');
  await typeInField('recipient-input', 'SOL_ADDRESS');
  await typeInField('amount-input', '0.001');
  await element(by.id('send-button')).tap();
  await waitForVisible(by.text('Payment Sent'));
});
```

## Debugging

### Verbose Output

```bash
detox test --configuration ios.sim.debug --loglevel verbose
```

### Single Test

```bash
detox test --configuration ios.sim.debug e2e/send.test.ts
```

### Take Screenshots

```typescript
await device.takeScreenshot('after-send');
```

Screenshots are saved to `artifacts/` folder.

## CI Integration

For CI (GitHub Actions), use:

```yaml
- name: Detox Build
  run: pnpm e2e:build:ios

- name: Detox Test
  run: pnpm e2e:test:ios
```

Note: iOS tests require macOS runners. Android can run on Linux.

## Troubleshooting

### "Device not found"

```bash
# List available simulators
xcrun simctl list devices

# Create simulator if needed
xcrun simctl create "iPhone 15 Pro" "com.apple.CoreSimulator.SimDeviceType.iPhone-15-Pro"
```

### "App not built"

```bash
# Rebuild
pnpm prebuild --clean
pnpm e2e:build:ios
```

### "Timeout waiting for element"

Increase timeout in test:

```typescript
await waitFor(element(by.id('element'))).toBeVisible().withTimeout(30000);
```
