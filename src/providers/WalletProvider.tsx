/**
 * Wallet Provider — DEPRECATED
 *
 * ⚠️ DEPRECATION NOTICE
 * This Privy provider is being removed as part of the native wallet pivot.
 * See: https://github.com/sip-protocol/sip-mobile/issues/71
 *
 * The app is transitioning to native key management (useNativeWallet).
 * This file will be removed once native wallet implementation is complete.
 *
 * Note: MWA and Phantom don't require providers - they use hooks directly.
 */

import { PrivyProvider } from "@privy-io/expo"

// TODO: DEPRECATED - Remove Privy integration entirely (see #71)
const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || "your-privy-app-id"
const PRIVY_CLIENT_ID =
  process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || "your-privy-client-id"

interface WalletProviderProps {
  children: React.ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <PrivyProvider appId={PRIVY_APP_ID} clientId={PRIVY_CLIENT_ID}>
      {children}
    </PrivyProvider>
  )
}
