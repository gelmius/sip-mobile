/**
 * Custom hooks for SIP Mobile
 */

// Wallet hooks
export { useMWA } from "./useMWA"
export { usePhantomDeeplink } from "./usePhantomDeeplink"
export { useWallet, getRecommendedProvider, getAvailableProviders } from "./useWallet"

// Privacy hooks
export { useStealth } from "./useStealth"
export type { StealthKeys, StealthAddress, UseStealthReturn } from "./useStealth"
