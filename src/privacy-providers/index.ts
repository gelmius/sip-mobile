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
// Privacy Cash disabled - privacycash SDK uses import.meta (incompatible with Hermes)
// export { PrivacyCashAdapter, createPrivacyCashAdapter } from "./privacy-cash"
export { ShadowWireAdapter, createShadowWireAdapter } from "./shadowwire"
export { MagicBlockAdapter, createMagicBlockAdapter } from "./magicblock"
// Arcium disabled - @arcium-hq/client imports Node.js 'fs' (incompatible with RN)
// export { ArciumAdapter, createArciumAdapter } from "./arcium"
// Inco disabled - @inco/solana-sdk uses ecies-geth which imports Node.js 'crypto'
// export { IncoAdapter, createIncoAdapter } from "./inco"
export { CSPLAdapter, createCSPLAdapter } from "./cspl"

// Registry & Factory
export { createAdapter, getAdapter, initializeAdapter } from "./registry"
