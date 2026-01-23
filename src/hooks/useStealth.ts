/**
 * Stealth Address Hook
 *
 * Manages stealth address generation and scanning for SIP privacy.
 * Uses EIP-5564 style stealth addresses with secp256k1 curve.
 */

import { useState, useCallback, useEffect, useMemo } from "react"
import * as SecureStore from "expo-secure-store"
import { useWalletStore } from "@/stores/wallet"

// ============================================================================
// TYPES
// ============================================================================

export interface StealthKeys {
  spendingPrivateKey: string
  spendingPublicKey: string
  viewingPrivateKey: string
  viewingPublicKey: string
}

export interface StealthAddress {
  full: string
  encoded: string
  chain: string
  spendingKey: string
  viewingKey: string
}

export interface UseStealthReturn {
  // State
  stealthAddress: StealthAddress | null
  isGenerating: boolean
  isLoading: boolean
  error: string | null

  // Actions
  generateNewAddress: () => Promise<StealthAddress | null>
  regenerateAddress: () => Promise<StealthAddress | null>
  getKeys: () => Promise<StealthKeys | null>
  formatForDisplay: (address: StealthAddress) => string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SECURE_STORE_KEY = "sip_stealth_keys"
const SIP_CHAIN = "solana"

// ============================================================================
// MOCK CRYPTO (Replace with real SDK integration)
// ============================================================================

/**
 * Generate random hex string
 * TODO: Replace with actual @noble/curves integration
 */
function generateRandomHex(length: number): string {
  const array = new Uint8Array(length)
  // Use expo-crypto for secure random in production
  for (let i = 0; i < length; i++) {
    array[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * Generate mock stealth keys
 * TODO: Replace with actual stealth.ts from SDK
 */
function generateStealthKeys(): StealthKeys {
  // In production, use @noble/curves secp256k1
  const spendingPrivateKey = generateRandomHex(32)
  const viewingPrivateKey = generateRandomHex(32)

  // Mock public keys (in production, derive from private keys)
  const spendingPublicKey = "02" + generateRandomHex(32)
  const viewingPublicKey = "03" + generateRandomHex(32)

  return {
    spendingPrivateKey,
    spendingPublicKey,
    viewingPrivateKey,
    viewingPublicKey,
  }
}

/**
 * Format stealth address
 * Format: sip:<chain>:<spendingKey>:<viewingKey>
 */
function formatStealthAddress(
  chain: string,
  spendingPublicKey: string,
  viewingPublicKey: string
): StealthAddress {
  const full = `sip:${chain}:${spendingPublicKey}:${viewingPublicKey}`

  return {
    full,
    encoded: full,
    chain,
    spendingKey: spendingPublicKey,
    viewingKey: viewingPublicKey,
  }
}

// ============================================================================
// HOOK
// ============================================================================

export function useStealth(): UseStealthReturn {
  const { isConnected, address } = useWalletStore()

  const [stealthAddress, setStealthAddress] = useState<StealthAddress | null>(null)
  const [keys, setKeys] = useState<StealthKeys | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load or generate keys on mount
  useEffect(() => {
    if (isConnected && address) {
      loadOrGenerateKeys()
    } else {
      setStealthAddress(null)
      setKeys(null)
      setIsLoading(false)
    }
  }, [isConnected, address])

  const loadOrGenerateKeys = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Try to load existing keys
      const storedKeys = await SecureStore.getItemAsync(SECURE_STORE_KEY)

      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys) as StealthKeys
        setKeys(parsedKeys)

        // Generate address from stored keys
        const addr = formatStealthAddress(
          SIP_CHAIN,
          parsedKeys.spendingPublicKey,
          parsedKeys.viewingPublicKey
        )
        setStealthAddress(addr)
      } else {
        // Generate new keys
        await generateNewAddressInternal()
      }
    } catch (err) {
      console.error("Failed to load stealth keys:", err)
      setError("Failed to load stealth keys")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateNewAddressInternal = useCallback(async (): Promise<StealthAddress | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      // Generate new stealth keys
      const newKeys = generateStealthKeys()

      // Store securely
      await SecureStore.setItemAsync(SECURE_STORE_KEY, JSON.stringify(newKeys))

      setKeys(newKeys)

      // Create stealth address
      const addr = formatStealthAddress(
        SIP_CHAIN,
        newKeys.spendingPublicKey,
        newKeys.viewingPublicKey
      )

      setStealthAddress(addr)
      return addr
    } catch (err) {
      console.error("Failed to generate stealth address:", err)
      setError("Failed to generate stealth address")
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const generateNewAddress = useCallback(async (): Promise<StealthAddress | null> => {
    if (!isConnected) {
      setError("Wallet not connected")
      return null
    }
    return generateNewAddressInternal()
  }, [isConnected, generateNewAddressInternal])

  const regenerateAddress = useCallback(async (): Promise<StealthAddress | null> => {
    // Clear existing keys and generate new ones
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_KEY)
    } catch {
      // Ignore delete errors
    }
    return generateNewAddress()
  }, [generateNewAddress])

  const getKeys = useCallback(async (): Promise<StealthKeys | null> => {
    if (keys) return keys

    try {
      const storedKeys = await SecureStore.getItemAsync(SECURE_STORE_KEY)
      if (storedKeys) {
        return JSON.parse(storedKeys) as StealthKeys
      }
    } catch {
      // Ignore errors
    }
    return null
  }, [keys])

  const formatForDisplay = useCallback((addr: StealthAddress): string => {
    // Truncate for display
    const spendingShort = `${addr.spendingKey.slice(0, 8)}...${addr.spendingKey.slice(-6)}`
    const viewingShort = `${addr.viewingKey.slice(0, 8)}...${addr.viewingKey.slice(-6)}`
    return `sip:${addr.chain}:${spendingShort}:${viewingShort}`
  }, [])

  return useMemo(
    () => ({
      stealthAddress,
      isGenerating,
      isLoading,
      error,
      generateNewAddress,
      regenerateAddress,
      getKeys,
      formatForDisplay,
    }),
    [
      stealthAddress,
      isGenerating,
      isLoading,
      error,
      generateNewAddress,
      regenerateAddress,
      getKeys,
      formatForDisplay,
    ]
  )
}
