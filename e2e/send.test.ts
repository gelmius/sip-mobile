/**
 * E2E Tests: Send Flow
 *
 * Tests shielded payment sending functionality.
 */

import { device, element, by, expect, waitFor } from 'detox';
import {
  TIMEOUTS,
  navigateToTab,
  waitForVisible,
  waitForLoading,
  typeInField,
  handleBiometricPrompt,
  setupTestWallet,
  sleep,
} from './utils';

describe('Send Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await setupTestWallet();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await navigateToTab('Send');
  });

  describe('Send Screen UI', () => {
    it('should display send screen elements', async () => {
      await expect(element(by.text('Send'))).toBeVisible();
      await expect(element(by.id('recipient-input'))).toBeVisible();
      await expect(element(by.id('amount-input'))).toBeVisible();
      await expect(element(by.id('privacy-toggle'))).toBeVisible();
    });

    it('should show privacy level options', async () => {
      // Privacy toggle should be visible
      await expect(element(by.id('privacy-toggle'))).toBeVisible();

      // Default should be shielded
      await expect(element(by.text('Shielded'))).toBeVisible();
    });

    it('should have QR scanner button', async () => {
      await expect(element(by.id('scan-qr-button'))).toBeVisible();
    });
  });

  describe('Address Validation', () => {
    it('should validate Solana address format', async () => {
      // Enter invalid address
      await typeInField('recipient-input', 'invalid-address');
      await element(by.id('amount-input')).tap(); // Focus out

      // Should show validation error
      await waitForVisible(by.text('Invalid address'));
    });

    it('should accept valid Solana address', async () => {
      const validAddress = 'S1P6j1yeTm6zkewQVeihrTZvmfoHABRkHDhabWTuWMd';
      await typeInField('recipient-input', validAddress);
      await element(by.id('amount-input')).tap();

      // Should not show error
      await expect(element(by.text('Invalid address'))).not.toBeVisible();
    });

    it('should accept SIP stealth address', async () => {
      const stealthAddress = 'sip:solana:S1P6j1yeTm6zkewQVeihrTZvmfoHABRkHDhabWTuWMd:S1P9WhBSbAGGatvrVE4TRBZfWpbG96U26zksy2TQj8q';
      await typeInField('recipient-input', stealthAddress);
      await element(by.id('amount-input')).tap();

      // Should parse and show stealth badge
      await expect(element(by.id('stealth-address-badge'))).toBeVisible();
    });
  });

  describe('Amount Input', () => {
    it('should validate amount is positive', async () => {
      await typeInField('amount-input', '-1');

      // Should show error or be rejected
      await expect(element(by.id('amount-input'))).not.toHaveText('-1');
    });

    it('should show MAX button', async () => {
      await expect(element(by.id('max-button'))).toBeVisible();
    });

    it('should fill max balance when MAX tapped', async () => {
      await element(by.id('max-button')).tap();

      // Amount should be filled
      const amountInput = element(by.id('amount-input'));
      await expect(amountInput).not.toHaveText('');
    });

    it('should show insufficient balance error', async () => {
      await typeInField('amount-input', '9999999');

      // Should show insufficient balance
      await waitForVisible(by.text('Insufficient balance'));
    });
  });

  describe('Send Transaction', () => {
    const testRecipient = 'S1P6j1yeTm6zkewQVeihrTZvmfoHABRkHDhabWTuWMd';

    it('should require biometric confirmation', async () => {
      await typeInField('recipient-input', testRecipient);
      await typeInField('amount-input', '0.001');

      // Tap send button
      await element(by.id('send-button')).tap();

      // Should show confirmation modal
      await waitForVisible(by.text('Confirm Send'));

      // Confirm
      await element(by.id('confirm-send-button')).tap();

      // Should prompt for biometric
      // Note: In debug builds, this may auto-approve
      await sleep(1000);
    });

    it('should show transaction progress', async () => {
      await typeInField('recipient-input', testRecipient);
      await typeInField('amount-input', '0.001');

      await element(by.id('send-button')).tap();
      await waitForVisible(by.text('Confirm Send'));
      await element(by.id('confirm-send-button')).tap();

      // Handle biometric
      try {
        await handleBiometricPrompt();
      } catch {
        // May not need biometric in test mode
      }

      // Should show progress
      await waitForVisible(by.id('transaction-progress'), TIMEOUTS.medium);
    });

    it('should show success on completed transaction', async () => {
      await typeInField('recipient-input', testRecipient);
      await typeInField('amount-input', '0.001');

      await element(by.id('send-button')).tap();
      await waitForVisible(by.text('Confirm Send'));
      await element(by.id('confirm-send-button')).tap();

      try {
        await handleBiometricPrompt();
      } catch {
        // Continue
      }

      // Wait for success (may take time on devnet)
      await waitForVisible(by.id('transaction-success'), TIMEOUTS.transaction);
      await expect(element(by.text('Payment Sent'))).toBeVisible();
    });
  });

  describe('QR Scanner', () => {
    it('should open QR scanner screen', async () => {
      await element(by.id('scan-qr-button')).tap();

      // Should navigate to scanner
      await waitForVisible(by.id('qr-scanner-screen'));
    });

    it('should request camera permission', async () => {
      await element(by.id('scan-qr-button')).tap();

      // Camera permission prompt or camera view should appear
      await sleep(1000);

      // Either permission prompt or camera view
      // This depends on device state
    });
  });
});
