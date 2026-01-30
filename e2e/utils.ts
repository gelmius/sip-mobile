/**
 * Detox E2E Test Utilities
 *
 * Helper functions for common test operations.
 */

import { device, element, by, waitFor, expect } from 'detox';

// ============================================================================
// TIMEOUTS
// ============================================================================

export const TIMEOUTS = {
  short: 5000,
  medium: 10000,
  long: 30000,
  transaction: 60000,
};

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

/**
 * Navigate to a tab by its label
 */
export async function navigateToTab(tabName: 'Home' | 'Send' | 'Receive' | 'Swap' | 'Settings') {
  await element(by.text(tabName)).tap();
  await sleep(500);
}

/**
 * Go back from current screen
 */
export async function goBack() {
  if (device.getPlatform() === 'ios') {
    await element(by.traits(['button']).and(by.label('Back'))).tap();
  } else {
    await device.pressBack();
  }
}

// ============================================================================
// WAIT HELPERS
// ============================================================================

/**
 * Sleep for a given duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for an element to be visible
 */
export async function waitForVisible(matcher: Detox.NativeMatcher, timeout = TIMEOUTS.medium) {
  await waitFor(element(matcher)).toBeVisible().withTimeout(timeout);
}

/**
 * Wait for an element to not exist
 */
export async function waitForNotExist(matcher: Detox.NativeMatcher, timeout = TIMEOUTS.medium) {
  await waitFor(element(matcher)).not.toExist().withTimeout(timeout);
}

/**
 * Wait for loading to complete (spinner to disappear)
 */
export async function waitForLoading(timeout = TIMEOUTS.long) {
  // Wait for any loading indicator to disappear
  try {
    await waitFor(element(by.id('loading-indicator'))).not.toExist().withTimeout(timeout);
  } catch {
    // No loading indicator found, continue
  }
}

// ============================================================================
// INPUT HELPERS
// ============================================================================

/**
 * Type text into an input field
 */
export async function typeInField(testID: string, text: string) {
  const input = element(by.id(testID));
  await input.tap();
  await input.clearText();
  await input.typeText(text);
}

/**
 * Clear and replace text in an input field
 */
export async function replaceText(testID: string, text: string) {
  const input = element(by.id(testID));
  await input.tap();
  await input.replaceText(text);
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Assert element is visible
 */
export async function assertVisible(testID: string) {
  await expect(element(by.id(testID))).toBeVisible();
}

/**
 * Assert element has text
 */
export async function assertText(testID: string, text: string) {
  await expect(element(by.id(testID))).toHaveText(text);
}

/**
 * Assert element contains text
 */
export async function assertContainsText(text: string) {
  await expect(element(by.text(text))).toBeVisible();
}

// ============================================================================
// WALLET HELPERS
// ============================================================================

/**
 * Check if wallet is connected (looks for balance display)
 */
export async function isWalletConnected(): Promise<boolean> {
  try {
    await expect(element(by.id('wallet-balance'))).toBeVisible();
    return true;
  } catch {
    return false;
  }
}

/**
 * Create or import a test wallet
 * This should be done in beforeAll for test suites that need a wallet
 */
export async function setupTestWallet() {
  // Check if already connected
  if (await isWalletConnected()) {
    return;
  }

  // Navigate to wallet setup
  await element(by.id('setup-wallet-button')).tap();

  // For testing, we'll create a new wallet
  await element(by.id('create-wallet-button')).tap();

  // Wait for wallet creation
  await waitForLoading(TIMEOUTS.long);

  // Should now be on home with balance
  await waitForVisible(by.id('wallet-balance'));
}

// ============================================================================
// BIOMETRIC HELPERS
// ============================================================================

/**
 * Handle biometric prompt (auto-approve in debug builds)
 */
export async function handleBiometricPrompt() {
  if (device.getPlatform() === 'ios') {
    // iOS simulator can match Face ID
    await device.matchFace();
  } else {
    // Android emulator can match fingerprint
    await device.matchFinger();
  }
}

/**
 * Dismiss biometric prompt (cancel)
 */
export async function dismissBiometricPrompt() {
  if (device.getPlatform() === 'ios') {
    await device.unmatchFace();
  } else {
    await device.unmatchFinger();
  }
}

// ============================================================================
// SCREENSHOT HELPERS
// ============================================================================

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(name: string) {
  await device.takeScreenshot(name);
}

// ============================================================================
// SCROLL HELPERS
// ============================================================================

/**
 * Scroll down in a scrollable view
 */
export async function scrollDown(testID: string, pixels = 300) {
  await element(by.id(testID)).scroll(pixels, 'down');
}

/**
 * Scroll to element
 */
export async function scrollToElement(scrollViewID: string, targetID: string) {
  await waitFor(element(by.id(targetID)))
    .toBeVisible()
    .whileElement(by.id(scrollViewID))
    .scroll(100, 'down');
}
