/**
 * Privacy Provider Hook
 *
 * Provides access to the currently selected privacy provider adapter.
 * Automatically initializes the adapter and handles provider switching.
 *
 * @example
 * ```tsx
 * const { adapter, isReady, send, swap } = usePrivacyProvider()
 *
 * // Send with current provider
 * const result = await send({
 *   amount: "1.0",
 *   recipient: "...",
 *   privacyLevel: "shielded",
 * })
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSettingsStore } from "@/stores/settings"
import { useWalletStore } from "@/stores/wallet"
import { useNativeWallet } from "./useNativeWallet"
import {
  initializeAdapter,
  type PrivacyProviderAdapter,
  type PrivacySendParams,
  type PrivacySendResult,
  type PrivacySendStatus,
  type PrivacySwapParams,
  type PrivacySwapResult,
  type PrivacySwapStatus,
  type AdapterOptions,
  PRIVACY_PROVIDERS,
  getProviderInfo,
} from "@/privacy-providers"
import { debug } from "@/utils/logger"

// ============================================================================
// TYPES
// ============================================================================

export interface UsePrivacyProviderReturn {
  /** Current adapter instance */
  adapter: PrivacyProviderAdapter | null
  /** Whether the adapter is initialized and ready */
  isReady: boolean
  /** Whether the adapter is currently initializing */
  isInitializing: boolean
  /** Error during initialization */
  error: string | null
  /** Current provider info */
  providerInfo: ReturnType<typeof getProviderInfo>

  // Convenience methods (wrapped adapter calls)

  /** Send a private payment */
  send: (
    params: PrivacySendParams,
    onStatusChange?: (status: PrivacySendStatus) => void
  ) => Promise<PrivacySendResult>

  /** Execute a private swap */
  swap: (
    params: PrivacySwapParams,
    onStatusChange?: (status: PrivacySwapStatus) => void
  ) => Promise<PrivacySwapResult>

  /** Check if provider supports a feature */
  supportsFeature: (feature: "send" | "swap" | "viewingKeys" | "compliance") => boolean
}

// ============================================================================
// HOOK
// ============================================================================

export function usePrivacyProvider(): UsePrivacyProviderReturn {
  const { privacyProvider, network } = useSettingsStore()
  const { address: walletAddress, isConnected } = useWalletStore()
  const { signTransaction } = useNativeWallet()

  const [adapter, setAdapter] = useState<PrivacyProviderAdapter | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Provider info for UI
  const providerInfo = useMemo(() => getProviderInfo(privacyProvider), [privacyProvider])

  // Initialize adapter when provider/network/wallet changes
  useEffect(() => {
    if (!walletAddress) {
      setAdapter(null)
      setIsReady(false)
      return
    }

    const options: AdapterOptions = {
      network,
      walletAddress,
    }

    setIsInitializing(true)
    setError(null)

    initializeAdapter(privacyProvider, options)
      .then((initializedAdapter: PrivacyProviderAdapter) => {
        setAdapter(initializedAdapter)
        setIsReady(initializedAdapter.isReady())
        debug(`Privacy provider ${privacyProvider} ready`)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to initialize provider")
        setIsReady(false)
        debug(`Privacy provider ${privacyProvider} initialization failed:`, err)
      })
      .finally(() => {
        setIsInitializing(false)
      })
  }, [privacyProvider, network, walletAddress])

  // Wrapped sign transaction for adapters
  const wrappedSignTransaction = useCallback(
    async (tx: Uint8Array): Promise<Uint8Array | null> => {
      if (!signTransaction) {
        throw new Error("Wallet not connected")
      }

      // Convert Uint8Array to Transaction for native wallet
      const { Transaction } = await import("@solana/web3.js")
      const transaction = Transaction.from(tx)
      const signed = await signTransaction(transaction)

      if (!signed) {
        return null
      }

      // Return the fully signed transaction
      // The signed transaction should have all required signatures after partialSign
      return signed.serialize()
    },
    [signTransaction]
  )

  // Send method
  const send = useCallback(
    async (
      params: PrivacySendParams,
      onStatusChange?: (status: PrivacySendStatus) => void
    ): Promise<PrivacySendResult> => {
      if (!adapter || !isReady) {
        return { success: false, error: "Provider not ready" }
      }

      if (!isConnected) {
        return { success: false, error: "Wallet not connected" }
      }

      return adapter.send(params, wrappedSignTransaction, onStatusChange)
    },
    [adapter, isReady, isConnected, wrappedSignTransaction]
  )

  // Swap method
  const swap = useCallback(
    async (
      params: PrivacySwapParams,
      onStatusChange?: (status: PrivacySwapStatus) => void
    ): Promise<PrivacySwapResult> => {
      if (!adapter || !isReady) {
        return { success: false, error: "Provider not ready" }
      }

      if (!isConnected) {
        return { success: false, error: "Wallet not connected" }
      }

      return adapter.swap(params, wrappedSignTransaction, onStatusChange)
    },
    [adapter, isReady, isConnected, wrappedSignTransaction]
  )

  // Feature support check
  const supportsFeature = useCallback(
    (feature: "send" | "swap" | "viewingKeys" | "compliance"): boolean => {
      if (!adapter) return false
      return adapter.supportsFeature(feature)
    },
    [adapter]
  )

  return useMemo(
    () => ({
      adapter,
      isReady,
      isInitializing,
      error,
      providerInfo,
      send,
      swap,
      supportsFeature,
    }),
    [adapter, isReady, isInitializing, error, providerInfo, send, swap, supportsFeature]
  )
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Get all available privacy providers
 */
export { PRIVACY_PROVIDERS, getProviderInfo }
