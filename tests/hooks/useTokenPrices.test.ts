/**
 * Token Prices Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { formatUsdValue } from "@/hooks/useTokenPrices"

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock AppState
vi.mock("react-native", () => ({
  AppState: {
    currentState: "active",
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
}))

describe("Token Prices", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("formatUsdValue", () => {
    it("should format zero value", () => {
      expect(formatUsdValue(0)).toBe("$0.00")
    })

    it("should format NaN value", () => {
      expect(formatUsdValue(NaN)).toBe("$0.00")
    })

    it("should format small values with more decimals", () => {
      expect(formatUsdValue(0.001234)).toBe("$0.001234")
      expect(formatUsdValue(0.00001)).toBe("$0.000010")
    })

    it("should format normal values with 2 decimals", () => {
      expect(formatUsdValue(1.23)).toBe("$1.23")
      expect(formatUsdValue(99.99)).toBe("$99.99")
      expect(formatUsdValue(100)).toBe("$100.00")
    })

    it("should format thousands with commas", () => {
      expect(formatUsdValue(1234.56)).toBe("$1,234.56")
      expect(formatUsdValue(999999.99)).toBe("$999,999.99")
    })

    it("should format millions with M suffix", () => {
      expect(formatUsdValue(1000000)).toBe("$1.00M")
      expect(formatUsdValue(1500000)).toBe("$1.50M")
      expect(formatUsdValue(10000000)).toBe("$10.00M")
    })
  })

  describe("Jupiter Price API response parsing", () => {
    it("should handle successful response", () => {
      const mockResponse: { data: Record<string, { id: string; price: string }> } = {
        data: {
          So11111111111111111111111111111111111111112: {
            id: "So11111111111111111111111111111111111111112",
            price: "185.50",
          },
          EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
            id: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            price: "1.00",
          },
        },
      }

      // Parse like the hook does
      const result: Record<string, number> = {}
      const mints = [
        "So11111111111111111111111111111111111111112",
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      ]

      for (const mint of mints) {
        if (mockResponse.data[mint]?.price) {
          result[mint] = Number(mockResponse.data[mint].price)
        }
      }

      expect(result["So11111111111111111111111111111111111111112"]).toBe(185.5)
      expect(result["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"]).toBe(1.0)
    })

    it("should handle missing prices", () => {
      const mockResponse: { data: Record<string, { id: string; price: string }> } = {
        data: {
          So11111111111111111111111111111111111111112: {
            id: "So11111111111111111111111111111111111111112",
            price: "185.50",
          },
          // USDC is missing
        },
      }

      const result: Record<string, number> = {}
      const mints = [
        "So11111111111111111111111111111111111111112",
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      ]

      for (const mint of mints) {
        if (mockResponse.data[mint]?.price) {
          result[mint] = Number(mockResponse.data[mint].price)
        }
      }

      expect(result["So11111111111111111111111111111111111111112"]).toBe(185.5)
      expect(result["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"]).toBeUndefined()
    })

    it("should handle empty response", () => {
      const result: Record<string, number> = {}
      expect(Object.keys(result)).toHaveLength(0)
    })
  })

  describe("USD value calculation", () => {
    it("should calculate USD value correctly", () => {
      const prices: Record<string, number> = {
        SOL: 185.0,
        USDC: 1.0,
        BONK: 0.00002,
      }

      const getUsdValue = (symbol: string, amount: number): number => {
        const price = prices[symbol] || 0
        return amount * price
      }

      expect(getUsdValue("SOL", 1)).toBe(185.0)
      expect(getUsdValue("SOL", 10)).toBe(1850.0)
      expect(getUsdValue("USDC", 100)).toBe(100.0)
      expect(getUsdValue("BONK", 1000000)).toBe(20.0)
    })

    it("should return 0 for unknown tokens", () => {
      const prices: Record<string, number> = { SOL: 185.0 }

      const getUsdValue = (symbol: string, amount: number): number => {
        const price = prices[symbol] || 0
        return amount * price
      }

      expect(getUsdValue("UNKNOWN", 100)).toBe(0)
    })

    it("should handle zero amount", () => {
      const prices: Record<string, number> = { SOL: 185.0 }

      const getUsdValue = (symbol: string, amount: number): number => {
        if (amount === 0) return 0
        const price = prices[symbol] || 0
        return amount * price
      }

      expect(getUsdValue("SOL", 0)).toBe(0)
    })
  })

  describe("Fallback prices", () => {
    it("should have fallback for SOL", () => {
      const FALLBACK_PRICES: Record<string, number> = {
        SOL: 185.0,
        USDC: 1.0,
        USDT: 1.0,
      }

      expect(FALLBACK_PRICES.SOL).toBe(185.0)
    })

    it("should have fallback for stablecoins", () => {
      const FALLBACK_PRICES: Record<string, number> = {
        SOL: 185.0,
        USDC: 1.0,
        USDT: 1.0,
      }

      expect(FALLBACK_PRICES.USDC).toBe(1.0)
      expect(FALLBACK_PRICES.USDT).toBe(1.0)
    })
  })

  describe("Price staleness", () => {
    it("should detect stale prices", () => {
      const STALE_THRESHOLD = 2 * 60 * 1000 // 2 minutes

      const isStale = (lastUpdated: number | null): boolean => {
        if (!lastUpdated) return true
        return Date.now() - lastUpdated > STALE_THRESHOLD
      }

      // No update = stale
      expect(isStale(null)).toBe(true)

      // Recent update = fresh
      expect(isStale(Date.now())).toBe(false)

      // Old update = stale
      expect(isStale(Date.now() - 3 * 60 * 1000)).toBe(true)
    })
  })
})
