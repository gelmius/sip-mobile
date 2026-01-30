/**
 * Custom Tokens Store Tests
 */

import { describe, it, expect, beforeEach } from "vitest"
import { useCustomTokensStore, MAX_CUSTOM_TOKENS } from "@/stores/customTokens"
import type { TokenInfo } from "@/types"

describe("Custom Tokens Store", () => {
  const mockToken: TokenInfo = {
    symbol: "TEST",
    name: "Test Token",
    mint: "TestMint111111111111111111111111111111111",
    decimals: 9,
    logoUri: "https://example.com/logo.png",
  }

  const mockToken2: TokenInfo = {
    symbol: "TEST2",
    name: "Test Token 2",
    mint: "TestMint222222222222222222222222222222222",
    decimals: 6,
  }

  beforeEach(() => {
    // Reset store state
    useCustomTokensStore.setState({ tokens: [] })
  })

  describe("addToken", () => {
    it("should add a new token", () => {
      const { addToken } = useCustomTokensStore.getState()

      const result = addToken(mockToken)

      expect(result).toBe(true)
      expect(useCustomTokensStore.getState().tokens).toHaveLength(1)
      expect(useCustomTokensStore.getState().tokens[0]).toMatchObject({
        ...mockToken,
        isCustom: true,
      })
      expect(useCustomTokensStore.getState().tokens[0].importedAt).toBeDefined()
    })

    it("should not add duplicate tokens", () => {
      const { addToken } = useCustomTokensStore.getState()

      addToken(mockToken)
      const result = addToken(mockToken)

      expect(result).toBe(false)
      expect(useCustomTokensStore.getState().tokens).toHaveLength(1)
    })

    it("should add multiple different tokens", () => {
      const { addToken } = useCustomTokensStore.getState()

      addToken(mockToken)
      addToken(mockToken2)

      expect(useCustomTokensStore.getState().tokens).toHaveLength(2)
    })

    it("should add new tokens at the beginning", () => {
      const { addToken } = useCustomTokensStore.getState()

      addToken(mockToken)
      addToken(mockToken2)

      expect(useCustomTokensStore.getState().tokens[0].symbol).toBe("TEST2")
      expect(useCustomTokensStore.getState().tokens[1].symbol).toBe("TEST")
    })

    it("should respect max token limit", () => {
      const { addToken } = useCustomTokensStore.getState()

      // Add max tokens
      for (let i = 0; i < MAX_CUSTOM_TOKENS; i++) {
        addToken({
          ...mockToken,
          mint: `Mint${i.toString().padStart(40, "0")}`,
          symbol: `T${i}`,
        })
      }

      // Try to add one more
      const result = addToken({
        ...mockToken,
        mint: "ExtraMint11111111111111111111111111111111",
        symbol: "EXTRA",
      })

      expect(result).toBe(false)
      expect(useCustomTokensStore.getState().tokens).toHaveLength(MAX_CUSTOM_TOKENS)
    })
  })

  describe("removeToken", () => {
    it("should remove a token by mint", () => {
      const { addToken, removeToken } = useCustomTokensStore.getState()

      addToken(mockToken)
      addToken(mockToken2)
      removeToken(mockToken.mint)

      expect(useCustomTokensStore.getState().tokens).toHaveLength(1)
      expect(useCustomTokensStore.getState().tokens[0].symbol).toBe("TEST2")
    })

    it("should do nothing for non-existent token", () => {
      const { addToken, removeToken } = useCustomTokensStore.getState()

      addToken(mockToken)
      removeToken("NonExistentMint111111111111111111111111")

      expect(useCustomTokensStore.getState().tokens).toHaveLength(1)
    })
  })

  describe("hasToken", () => {
    it("should return true for existing token", () => {
      const { addToken, hasToken } = useCustomTokensStore.getState()

      addToken(mockToken)

      expect(hasToken(mockToken.mint)).toBe(true)
    })

    it("should return false for non-existent token", () => {
      const { hasToken } = useCustomTokensStore.getState()

      expect(hasToken("NonExistentMint111111111111111111111111")).toBe(false)
    })
  })

  describe("getToken", () => {
    it("should return token by mint", () => {
      const { addToken, getToken } = useCustomTokensStore.getState()

      addToken(mockToken)

      const token = getToken(mockToken.mint)
      expect(token).toBeDefined()
      expect(token?.symbol).toBe("TEST")
    })

    it("should return undefined for non-existent token", () => {
      const { getToken } = useCustomTokensStore.getState()

      expect(getToken("NonExistentMint111111111111111111111111")).toBeUndefined()
    })
  })

  describe("clearAll", () => {
    it("should remove all tokens", () => {
      const { addToken, clearAll } = useCustomTokensStore.getState()

      addToken(mockToken)
      addToken(mockToken2)
      clearAll()

      expect(useCustomTokensStore.getState().tokens).toHaveLength(0)
    })
  })
})
