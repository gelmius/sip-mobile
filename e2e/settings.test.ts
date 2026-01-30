/**
 * E2E Tests: Settings Flow
 *
 * Tests settings screen and configuration changes.
 */

import { device, element, by, expect } from 'detox';
import {
  TIMEOUTS,
  navigateToTab,
  waitForVisible,
  scrollDown,
  setupTestWallet,
  sleep,
} from './utils';

describe('Settings Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await setupTestWallet();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await navigateToTab('Settings');
  });

  describe('Settings Screen UI', () => {
    it('should display all settings sections', async () => {
      await expect(element(by.text('Settings'))).toBeVisible();
      await expect(element(by.text('Wallet'))).toBeVisible();
      await expect(element(by.text('Privacy'))).toBeVisible();
      await expect(element(by.text('Network'))).toBeVisible();
    });

    it('should show wallet address when connected', async () => {
      await expect(element(by.text('Accounts'))).toBeVisible();
      // Address should be displayed (truncated)
    });
  });

  describe('Privacy Settings', () => {
    it('should show privacy provider option', async () => {
      await expect(element(by.text('Privacy Provider'))).toBeVisible();
    });

    it('should open privacy provider modal', async () => {
      await element(by.text('Privacy Provider')).tap();

      // Modal should show providers
      await waitForVisible(by.text('SIP Native'));
      await expect(element(by.text('Arcium'))).toBeVisible();
      await expect(element(by.text('Privacy Cash'))).toBeVisible();
    });

    it('should change privacy provider', async () => {
      await element(by.text('Privacy Provider')).tap();
      await waitForVisible(by.text('Arcium'));

      // Select Arcium
      await element(by.text('Arcium')).tap();

      // Should show success toast
      await waitForVisible(by.text('Provider Changed'));
    });

    it('should show privacy level option', async () => {
      await expect(element(by.text('Privacy Level'))).toBeVisible();
    });

    it('should change privacy level', async () => {
      await element(by.text('Privacy Level')).tap();
      await waitForVisible(by.text('Transparent'));

      // Select Transparent
      await element(by.text('Transparent')).tap();

      // Should show success toast
      await waitForVisible(by.text('Privacy Level Changed'));
    });

    it('should show background scanning toggle', async () => {
      await expect(element(by.text('Background Scanning'))).toBeVisible();
    });

    it('should toggle background scanning', async () => {
      // Find and tap the toggle
      const toggle = element(by.id('background-scan-toggle'));
      await toggle.tap();

      // Should request notification permission or show toast
      await sleep(1000);
    });
  });

  describe('Network Settings', () => {
    it('should show network option', async () => {
      await scrollDown('settings-scroll-view', 200);
      await expect(element(by.text('Network'))).toBeVisible();
    });

    it('should open network modal', async () => {
      await element(by.text('Network')).tap();

      // Modal should show networks
      await waitForVisible(by.text('Solana Mainnet'));
      await expect(element(by.text('Solana Devnet'))).toBeVisible();
    });

    it('should change network', async () => {
      await element(by.text('Network')).tap();
      await waitForVisible(by.text('Solana Mainnet'));

      // Select Mainnet
      await element(by.text('Solana Mainnet')).tap();

      // Should show toast
      await waitForVisible(by.text('Network Changed'));
    });

    it('should show RPC provider option', async () => {
      await expect(element(by.text('RPC Provider'))).toBeVisible();
    });

    it('should change RPC provider', async () => {
      await element(by.text('RPC Provider')).tap();
      await waitForVisible(by.text('Helius'));

      // Select PublicNode
      await element(by.text('PublicNode')).tap();

      // Should show toast
      await waitForVisible(by.text('Provider Changed'));
    });
  });

  describe('Data & Storage', () => {
    it('should show clear history options', async () => {
      await scrollDown('settings-scroll-view', 400);
      await expect(element(by.text('Clear Payment History'))).toBeVisible();
      await expect(element(by.text('Clear Swap History'))).toBeVisible();
    });

    it('should confirm before clearing history', async () => {
      await scrollDown('settings-scroll-view', 400);
      await element(by.text('Clear Payment History')).tap();

      // Should show confirmation alert
      await waitForVisible(by.text('Clear Payment History'));
      await expect(element(by.text('Cancel'))).toBeVisible();
      await expect(element(by.text('Clear'))).toBeVisible();

      // Cancel
      await element(by.text('Cancel')).tap();
    });
  });

  describe('About Section', () => {
    it('should show app version', async () => {
      await scrollDown('settings-scroll-view', 500);
      await expect(element(by.text('About SIP'))).toBeVisible();
    });

    it('should open about modal', async () => {
      await scrollDown('settings-scroll-view', 500);
      await element(by.text('About SIP')).tap();

      // Modal should show version and links
      await waitForVisible(by.text('SIP Privacy'));
      await expect(element(by.text('Visit Website'))).toBeVisible();
      await expect(element(by.text('GitHub'))).toBeVisible();
    });
  });

  describe('Viewing Keys', () => {
    it('should navigate to viewing keys screen', async () => {
      await element(by.text('Viewing Keys')).tap();

      // Should show viewing keys screen
      await waitForVisible(by.text('Viewing Keys'), TIMEOUTS.medium);
    });
  });

  describe('Security Settings', () => {
    it('should navigate to security screen', async () => {
      await element(by.text('Security')).tap();

      // Should show security settings
      await waitForVisible(by.text('Biometrics'), TIMEOUTS.medium);
    });
  });
});
