/**
 * Key Storage Utilities
 *
 * Secure key storage using expo-secure-store with biometric protection.
 * Keys are stored encrypted and require biometric auth for access.
 *
 * @see https://github.com/sip-protocol/sip-mobile/issues/68
 */

import * as SecureStore from "expo-secure-store"
import * as LocalAuthentication from "expo-local-authentication"

// Storage keys
const STORAGE_KEYS = {
  PRIVATE_KEY: "sip_wallet_private_key",
  MNEMONIC: "sip_wallet_mnemonic",
  PUBLIC_KEY: "sip_wallet_public_key",
  WALLET_EXISTS: "sip_wallet_exists",
  WALLET_CREATED_AT: "sip_wallet_created_at",
} as const

// SecureStore options with biometric protection
const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  requireAuthentication: true,
  authenticationPrompt: "Authenticate to access your wallet",
}

// Options without biometric (for non-sensitive data)
const STANDARD_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
}

export interface KeyStorageError {
  code: "AUTH_FAILED" | "NOT_FOUND" | "STORAGE_ERROR" | "BIOMETRIC_UNAVAILABLE"
  message: string
}

/**
 * Check if biometric authentication is available
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const isEnrolled = await LocalAuthentication.isEnrolledAsync()
    return hasHardware && isEnrolled
  } catch {
    return false
  }
}

/**
 * Get available authentication types
 */
export async function getAuthTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
  try {
    return await LocalAuthentication.supportedAuthenticationTypesAsync()
  } catch {
    return []
  }
}

/**
 * Authenticate user with biometrics
 */
export async function authenticateUser(
  prompt: string = "Authenticate to continue"
): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      fallbackLabel: "Use passcode",
      disableDeviceFallback: false,
    })
    return result.success
  } catch {
    return false
  }
}

/**
 * Check if wallet exists in storage
 */
export async function hasWallet(): Promise<boolean> {
  try {
    const exists = await SecureStore.getItemAsync(
      STORAGE_KEYS.WALLET_EXISTS,
      STANDARD_OPTIONS
    )
    return exists === "true"
  } catch {
    return false
  }
}

/**
 * Store private key (requires biometric)
 */
export async function storePrivateKey(
  privateKeyBase58: string
): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      STORAGE_KEYS.PRIVATE_KEY,
      privateKeyBase58,
      SECURE_OPTIONS
    )
  } catch (error) {
    throw {
      code: "STORAGE_ERROR",
      message: "Failed to store private key",
    } as KeyStorageError
  }
}

/**
 * Retrieve private key (requires biometric)
 */
export async function getPrivateKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(
      STORAGE_KEYS.PRIVATE_KEY,
      SECURE_OPTIONS
    )
  } catch (error) {
    // Check if auth failed vs not found
    const errorMessage = error instanceof Error ? error.message : ""
    if (errorMessage.includes("authentication") || errorMessage.includes("canceled")) {
      throw {
        code: "AUTH_FAILED",
        message: "Biometric authentication failed",
      } as KeyStorageError
    }
    return null
  }
}

/**
 * Store mnemonic phrase (requires biometric)
 */
export async function storeMnemonic(mnemonic: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      STORAGE_KEYS.MNEMONIC,
      mnemonic,
      SECURE_OPTIONS
    )
  } catch (error) {
    throw {
      code: "STORAGE_ERROR",
      message: "Failed to store mnemonic",
    } as KeyStorageError
  }
}

/**
 * Retrieve mnemonic phrase (requires biometric)
 */
export async function getMnemonic(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(
      STORAGE_KEYS.MNEMONIC,
      SECURE_OPTIONS
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : ""
    if (errorMessage.includes("authentication") || errorMessage.includes("canceled")) {
      throw {
        code: "AUTH_FAILED",
        message: "Biometric authentication failed",
      } as KeyStorageError
    }
    return null
  }
}

/**
 * Store public key (no biometric required)
 */
export async function storePublicKey(publicKeyBase58: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      STORAGE_KEYS.PUBLIC_KEY,
      publicKeyBase58,
      STANDARD_OPTIONS
    )
  } catch (error) {
    throw {
      code: "STORAGE_ERROR",
      message: "Failed to store public key",
    } as KeyStorageError
  }
}

/**
 * Retrieve public key (no biometric required)
 */
export async function getPublicKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(
      STORAGE_KEYS.PUBLIC_KEY,
      STANDARD_OPTIONS
    )
  } catch {
    return null
  }
}

/**
 * Mark wallet as created
 */
export async function setWalletExists(exists: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      STORAGE_KEYS.WALLET_EXISTS,
      exists ? "true" : "false",
      STANDARD_OPTIONS
    )
    if (exists) {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.WALLET_CREATED_AT,
        new Date().toISOString(),
        STANDARD_OPTIONS
      )
    }
  } catch (error) {
    throw {
      code: "STORAGE_ERROR",
      message: "Failed to update wallet status",
    } as KeyStorageError
  }
}

/**
 * Get wallet creation date
 */
export async function getWalletCreatedAt(): Promise<Date | null> {
  try {
    const dateStr = await SecureStore.getItemAsync(
      STORAGE_KEYS.WALLET_CREATED_AT,
      STANDARD_OPTIONS
    )
    return dateStr ? new Date(dateStr) : null
  } catch {
    return null
  }
}

/**
 * Delete all wallet data
 */
export async function deleteWallet(): Promise<void> {
  try {
    // Delete all stored keys
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.PRIVATE_KEY),
      SecureStore.deleteItemAsync(STORAGE_KEYS.MNEMONIC),
      SecureStore.deleteItemAsync(STORAGE_KEYS.PUBLIC_KEY),
      SecureStore.deleteItemAsync(STORAGE_KEYS.WALLET_EXISTS),
      SecureStore.deleteItemAsync(STORAGE_KEYS.WALLET_CREATED_AT),
    ])
  } catch (error) {
    throw {
      code: "STORAGE_ERROR",
      message: "Failed to delete wallet",
    } as KeyStorageError
  }
}

/**
 * Clear sensitive data from memory
 * Call this after using private keys
 */
export function clearSensitiveData(data: Uint8Array): void {
  // Overwrite with zeros
  data.fill(0)
}
