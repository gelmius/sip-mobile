/**
 * Unified Wallet Hook — External Wallet Connections
 *
 * This hook manages OPTIONAL external wallet connections (MWA, Phantom).
 * For primary wallet functionality, use useNativeWallet instead.
 *
 * Wallet Architecture:
 * - Native wallet (useNativeWallet) — PRIMARY method
 * - Seed Vault (useSeedVault) — PRIMARY for Seeker devices
 * - MWA (useMWA) — OPTIONAL for Android external wallets
 * - Phantom (usePhantomDeeplink) — OPTIONAL for iOS external wallets
 *
 * Usage:
 *   const { connect, disconnect, account, status } = useWallet()
 *   await connect('mwa')     // Android external wallet
 *   await connect('phantom') // iOS external wallet
 */

import { useState, useCallback, useEffect } from "react"
import { Platform } from "react-native"
import { useMWA } from "./useMWA"
import { usePhantomDeeplink } from "./usePhantomDeeplink"
import type {
  WalletAccount,
  WalletConnectionStatus,
  WalletProviderType,
  WalletError,
} from "@/types"

interface UseWalletReturn {
  // State
  account: WalletAccount | null
  status: WalletConnectionStatus
  error: WalletError | null
  providerType: WalletProviderType | null

  // Provider availability
  isMWAAvailable: boolean
  isPhantomAvailable: boolean

  // Actions
  connect: (provider: WalletProviderType) => Promise<WalletAccount | null>
  disconnect: () => Promise<void>
  signMessage: (message: Uint8Array) => Promise<Uint8Array | null>
  signTransaction: (serializedTx: Uint8Array) => Promise<Uint8Array | null>
}

export function useWallet(): UseWalletReturn {
  // Active provider state
  const [activeProvider, setActiveProvider] =
    useState<WalletProviderType | null>(null)
  const [unifiedAccount, setUnifiedAccount] = useState<WalletAccount | null>(
    null
  )
  const [unifiedStatus, setUnifiedStatus] =
    useState<WalletConnectionStatus>("disconnected")
  const [unifiedError, setUnifiedError] = useState<WalletError | null>(null)

  // Initialize provider hooks
  const mwa = useMWA()
  const phantom = usePhantomDeeplink()

  // Provider availability
  const isMWAAvailable = mwa.isAvailable
  const isPhantomAvailable = phantom.isAvailable

  // Sync MWA state
  useEffect(() => {
    if (activeProvider === "mwa") {
      setUnifiedAccount(mwa.account)
      setUnifiedStatus(mwa.status)
      setUnifiedError(mwa.error)
    }
  }, [activeProvider, mwa.account, mwa.status, mwa.error])

  // Sync Phantom state
  useEffect(() => {
    if (activeProvider === "phantom") {
      setUnifiedAccount(phantom.account)
      setUnifiedStatus(phantom.status)
      setUnifiedError(phantom.error)
    }
  }, [activeProvider, phantom.account, phantom.status, phantom.error])

  /**
   * Connect to a specific external wallet provider
   */
  const connect = useCallback(
    async (provider: WalletProviderType): Promise<WalletAccount | null> => {
      // Native wallet should use useNativeWallet hook directly
      if (provider === "native") {
        console.warn(
          "[useWallet] For native wallet, use useNativeWallet hook instead"
        )
        return null
      }

      setActiveProvider(provider)
      setUnifiedStatus("connecting")
      setUnifiedError(null)

      try {
        switch (provider) {
          case "mwa": {
            if (!isMWAAvailable) {
              throw new Error("MWA not available (Android only)")
            }
            const account = await mwa.connect()
            if (account) {
              setUnifiedAccount(account)
              setUnifiedStatus("connected")
            }
            return account
          }

          case "phantom": {
            if (!isPhantomAvailable) {
              throw new Error("Phantom wallet not installed")
            }
            const account = await phantom.connect()
            if (account) {
              setUnifiedAccount(account)
              setUnifiedStatus("connected")
            }
            return account
          }

          default:
            throw new Error(`Unknown provider: ${provider}`)
        }
      } catch (err) {
        const error: WalletError = {
          type: "connection_failed",
          message: err instanceof Error ? err.message : "Connection failed",
          originalError: err,
        }
        setUnifiedError(error)
        setUnifiedStatus("error")
        return null
      }
    },
    [mwa, phantom, isMWAAvailable, isPhantomAvailable]
  )

  /**
   * Disconnect from current wallet
   */
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      switch (activeProvider) {
        case "mwa":
          await mwa.disconnect()
          break
        case "phantom":
          await phantom.disconnect()
          break
      }
    } catch (err) {
      console.warn("Disconnect error:", err)
    } finally {
      setActiveProvider(null)
      setUnifiedAccount(null)
      setUnifiedStatus("disconnected")
      setUnifiedError(null)
    }
  }, [activeProvider, mwa, phantom])

  /**
   * Sign a message with current wallet
   */
  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array | null> => {
      if (!activeProvider || !unifiedAccount) {
        setUnifiedError({
          type: "signing_failed",
          message: "No wallet connected",
        })
        return null
      }

      try {
        switch (activeProvider) {
          case "mwa":
            return await mwa.signMessage(message)

          case "phantom":
            return await phantom.signMessage(message)

          default:
            throw new Error("Unknown provider")
        }
      } catch (err) {
        const error: WalletError = {
          type: "signing_failed",
          message: err instanceof Error ? err.message : "Signing failed",
          originalError: err,
        }
        setUnifiedError(error)
        return null
      }
    },
    [activeProvider, unifiedAccount, mwa, phantom]
  )

  /**
   * Sign a transaction with current wallet
   */
  const signTransaction = useCallback(
    async (serializedTx: Uint8Array): Promise<Uint8Array | null> => {
      if (!activeProvider || !unifiedAccount) {
        setUnifiedError({
          type: "signing_failed",
          message: "No wallet connected",
        })
        return null
      }

      try {
        switch (activeProvider) {
          case "mwa": {
            // MWA expects Transaction object, need to deserialize
            const { Transaction, VersionedTransaction } = await import(
              "@solana/web3.js"
            )
            let tx:
              | InstanceType<typeof Transaction>
              | InstanceType<typeof VersionedTransaction>
            try {
              tx = VersionedTransaction.deserialize(serializedTx)
            } catch {
              tx = Transaction.from(serializedTx)
            }
            const result = await mwa.signTransaction(tx)
            return result?.signedTransaction || null
          }

          case "phantom":
            return await phantom.signTransaction(serializedTx)

          default:
            throw new Error("Unknown provider")
        }
      } catch (err) {
        const error: WalletError = {
          type: "signing_failed",
          message: err instanceof Error ? err.message : "Signing failed",
          originalError: err,
        }
        setUnifiedError(error)
        return null
      }
    },
    [activeProvider, unifiedAccount, mwa, phantom]
  )

  return {
    // State
    account: unifiedAccount,
    status: unifiedStatus,
    error: unifiedError,
    providerType: activeProvider,

    // Availability
    isMWAAvailable,
    isPhantomAvailable,

    // Actions
    connect,
    disconnect,
    signMessage,
    signTransaction,
  }
}

/**
 * Get recommended external wallet provider based on platform
 */
export function getRecommendedProvider(): WalletProviderType {
  if (Platform.OS === "android") {
    return "mwa" // MWA is native on Android
  }
  return "phantom" // Deeplinks for iOS
}

/**
 * Get all available external wallet providers for current platform
 */
export function getAvailableProviders(): WalletProviderType[] {
  const providers: WalletProviderType[] = []

  if (Platform.OS === "android") {
    providers.push("mwa")
  }

  // Phantom deeplinks work on both platforms
  providers.push("phantom")

  return providers
}
