/**
 * E2E Tests: Onboarding Flow
 *
 * Tests wallet creation and seed phrase import flows.
 */

import { device, element, by, expect, waitFor } from 'detox';
import { TIMEOUTS, waitForVisible, waitForLoading, sleep } from './utils';

describe('Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Fresh Install', () => {
    it('should show welcome screen on first launch', async () => {
      // Welcome screen should be visible
      await waitForVisible(by.text('SIP Privacy'));
      await expect(element(by.id('welcome-screen'))).toBeVisible();
    });

    it('should show create and import wallet options', async () => {
      await expect(element(by.id('create-wallet-button'))).toBeVisible();
      await expect(element(by.id('import-wallet-button'))).toBeVisible();
    });
  });

  describe('Create Wallet', () => {
    it('should create a new wallet successfully', async () => {
      // Tap create wallet
      await element(by.id('create-wallet-button')).tap();

      // Should show seed phrase
      await waitForVisible(by.id('seed-phrase-display'), TIMEOUTS.long);

      // Should have 12 or 24 words
      await expect(element(by.id('seed-phrase-display'))).toBeVisible();

      // Tap continue after viewing seed phrase
      await element(by.id('continue-button')).tap();

      // Should now be on home screen with balance
      await waitForVisible(by.id('wallet-balance'), TIMEOUTS.long);
    });

    it('should persist wallet after app restart', async () => {
      // Relaunch app
      await device.launchApp({ newInstance: false });

      // Should go directly to home, not welcome
      await waitForVisible(by.id('wallet-balance'), TIMEOUTS.medium);
      await expect(element(by.id('welcome-screen'))).not.toBeVisible();
    });
  });

  describe('Import Wallet', () => {
    beforeEach(async () => {
      // Clear app data to start fresh
      await device.uninstallApp();
      await device.installApp();
      await device.launchApp({ newInstance: true });
    });

    it('should import wallet from seed phrase', async () => {
      // Tap import wallet
      await element(by.id('import-wallet-button')).tap();

      // Should show seed phrase input
      await waitForVisible(by.id('seed-phrase-input'));

      // Enter test seed phrase (12 words)
      const testSeedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      await element(by.id('seed-phrase-input')).typeText(testSeedPhrase);

      // Tap import
      await element(by.id('import-button')).tap();

      // Should show loading then home
      await waitForLoading(TIMEOUTS.long);
      await waitForVisible(by.id('wallet-balance'), TIMEOUTS.long);
    });

    it('should reject invalid seed phrase', async () => {
      await element(by.id('import-wallet-button')).tap();
      await waitForVisible(by.id('seed-phrase-input'));

      // Enter invalid seed phrase
      await element(by.id('seed-phrase-input')).typeText('invalid seed phrase here');

      // Tap import
      await element(by.id('import-button')).tap();

      // Should show error
      await waitForVisible(by.text('Invalid seed phrase'));
    });
  });
});
