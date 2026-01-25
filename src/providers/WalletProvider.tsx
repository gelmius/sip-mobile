/**
 * Wallet Provider
 *
 * Simple provider wrapper for wallet context.
 * The app uses native wallet management (useNativeWallet) as the primary method.
 *
 * Note: Privy was removed in #71. This provider now just passes through children.
 * External wallets (MWA, Phantom) use hooks directly without a provider wrapper.
 */

import { ReactNode } from "react"

interface WalletProviderProps {
  children: ReactNode
}

/**
 * WalletProvider
 *
 * This is now a simple pass-through since we removed Privy.
 * Native wallet uses SecureStore directly via useNativeWallet.
 * External wallets (MWA, Phantom) are handled by their respective hooks.
 */
export function WalletProvider({ children }: WalletProviderProps) {
  // No wrapper needed - native wallet uses SecureStore directly
  // MWA and Phantom use their own hooks without provider context
  return <>{children}</>
}
