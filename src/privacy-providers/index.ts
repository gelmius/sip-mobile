/**
 * Privacy Providers
 *
 * "OpenRouter for Privacy" - pluggable privacy engines.
 *
 * @see https://github.com/sip-protocol/sip-mobile/issues/73
 */

// Types
export * from "./types"

// Adapters
export { SipNativeAdapter, createSipNativeAdapter } from "./sip-native"
export { PrivacyCashAdapter, createPrivacyCashAdapter } from "./privacy-cash"
export { ShadowWireAdapter, createShadowWireAdapter } from "./shadowwire"

// Registry & Factory
export { createAdapter, getAdapter, initializeAdapter } from "./registry"
