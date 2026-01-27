// Polyfills must be imported before anything else
import "fast-text-encoding"
import "react-native-get-random-values"
import "@ethersproject/shims"
import { Buffer } from "buffer"

// Make Buffer globally available (required for Solana/Anchor)
global.Buffer = global.Buffer || Buffer

// Then import expo router
import "expo-router/entry"
