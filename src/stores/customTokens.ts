/**
 * Custom Tokens Store
 *
 * Manages user-imported custom SPL tokens.
 * Persists tokens across sessions using AsyncStorage.
 */

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { TokenInfo } from "@/types"

// ============================================================================
// CONSTANTS
// ============================================================================

/** Maximum custom tokens a user can import */
export const MAX_CUSTOM_TOKENS = 50

// ============================================================================
// TYPES
// ============================================================================

export interface CustomToken extends TokenInfo {
  /** When the token was imported */
  importedAt: number
  /** Whether this is a custom import (always true) */
  isCustom: true
}

interface CustomTokensState {
  /** User's custom imported tokens */
  tokens: CustomToken[]

  /** Add a new custom token */
  addToken: (token: TokenInfo) => boolean

  /** Remove a custom token by mint address */
  removeToken: (mint: string) => void

  /** Check if a token is already imported */
  hasToken: (mint: string) => boolean

  /** Get a custom token by mint */
  getToken: (mint: string) => CustomToken | undefined

  /** Clear all custom tokens */
  clearAll: () => void
}

// ============================================================================
// STORE
// ============================================================================

export const useCustomTokensStore = create<CustomTokensState>()(
  persist(
    (set, get) => ({
      tokens: [],

      addToken: (token: TokenInfo) => {
        const { tokens, hasToken } = get()

        // Check if already exists
        if (hasToken(token.mint)) {
          return false
        }

        // Check limit
        if (tokens.length >= MAX_CUSTOM_TOKENS) {
          return false
        }

        const customToken: CustomToken = {
          ...token,
          importedAt: Date.now(),
          isCustom: true,
        }

        set({ tokens: [customToken, ...tokens] })
        return true
      },

      removeToken: (mint: string) => {
        set((state) => ({
          tokens: state.tokens.filter((t) => t.mint !== mint),
        }))
      },

      hasToken: (mint: string) => {
        return get().tokens.some((t) => t.mint === mint)
      },

      getToken: (mint: string) => {
        return get().tokens.find((t) => t.mint === mint)
      },

      clearAll: () => {
        set({ tokens: [] })
      },
    }),
    {
      name: "sip-custom-tokens",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
