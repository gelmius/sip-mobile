/**
 * Accessibility Utilities Tests
 */

import { describe, it, expect } from "vitest"
import {
  MIN_TOUCH_TARGET,
  MIN_CONTRAST_RATIO,
  MIN_CONTRAST_RATIO_LARGE,
  buttonA11y,
  linkA11y,
  headerA11y,
  imageA11y,
  loadingA11yMessage,
  errorA11yMessage,
  successA11yMessage,
  formatAmountForA11y,
  formatAddressForA11y,
  focusContainerProps,
  modalFocusProps,
  liveRegionProps,
  groupProps,
  listItemProps,
} from "@/utils/accessibility"

describe("Accessibility Constants", () => {
  it("should have minimum touch target size", () => {
    expect(MIN_TOUCH_TARGET).toBeGreaterThanOrEqual(44)
  })

  it("should have minimum contrast ratio for normal text", () => {
    expect(MIN_CONTRAST_RATIO).toBe(4.5)
  })

  it("should have minimum contrast ratio for large text", () => {
    expect(MIN_CONTRAST_RATIO_LARGE).toBe(3.0)
  })
})

describe("Accessibility Props Helpers", () => {
  describe("buttonA11y", () => {
    it("should generate button accessibility props", () => {
      const props = buttonA11y("Submit form")
      expect(props.accessibilityLabel).toBe("Submit form")
      expect(props.accessibilityRole).toBe("button")
    })

    it("should include hint when provided", () => {
      const props = buttonA11y("Submit", "Sends the form data")
      expect(props.accessibilityHint).toBe("Sends the form data")
    })

    it("should include disabled state", () => {
      const props = buttonA11y("Submit", undefined, true)
      expect(props.accessibilityState?.disabled).toBe(true)
    })
  })

  describe("linkA11y", () => {
    it("should generate link accessibility props", () => {
      const props = linkA11y("Privacy Policy")
      expect(props.accessibilityLabel).toBe("Privacy Policy")
      expect(props.accessibilityRole).toBe("link")
    })

    it("should generate default hint", () => {
      const props = linkA11y("Settings")
      expect(props.accessibilityHint).toBe("Opens Settings")
    })

    it("should use custom hint when provided", () => {
      const props = linkA11y("Help", "Opens help documentation")
      expect(props.accessibilityHint).toBe("Opens help documentation")
    })
  })

  describe("headerA11y", () => {
    it("should generate header accessibility props", () => {
      const props = headerA11y("Account Settings")
      expect(props.accessibilityLabel).toBe("Account Settings")
      expect(props.accessibilityRole).toBe("header")
    })
  })

  describe("imageA11y", () => {
    it("should generate image accessibility props", () => {
      const props = imageA11y("User profile photo")
      expect(props.accessibilityLabel).toBe("User profile photo")
      expect(props.accessibilityRole).toBe("image")
    })

    it("should handle decorative images", () => {
      const props = imageA11y("", true)
      expect(props.accessibilityLabel).toBe("")
      expect(props.accessibilityRole).toBe("none")
    })
  })
})

describe("Status Messages", () => {
  describe("loadingA11yMessage", () => {
    it("should return default loading message", () => {
      expect(loadingA11yMessage()).toBe("Loading...")
    })

    it("should include context when provided", () => {
      expect(loadingA11yMessage("transactions")).toBe("Loading transactions...")
    })
  })

  describe("errorA11yMessage", () => {
    it("should format error message", () => {
      expect(errorA11yMessage("Network timeout")).toBe("Error: Network timeout")
    })
  })

  describe("successA11yMessage", () => {
    it("should format success message", () => {
      expect(successA11yMessage("Payment sent")).toBe("Payment sent successful")
    })
  })
})

describe("Financial Formatting", () => {
  describe("formatAmountForA11y", () => {
    it("should format simple amounts", () => {
      expect(formatAmountForA11y("100", "SOL")).toBe("100 SOL")
    })

    it("should format amounts with decimals", () => {
      expect(formatAmountForA11y("1.5", "SOL")).toBe("1.5 SOL")
    })

    it("should format large amounts with separators", () => {
      expect(formatAmountForA11y("1000000", "USDC")).toBe("1,000,000 USDC")
    })

    it("should handle invalid amounts", () => {
      expect(formatAmountForA11y("invalid", "SOL")).toBe("invalid SOL")
    })
  })

  describe("formatAddressForA11y", () => {
    it("should format long addresses", () => {
      const result = formatAddressForA11y("ABC123DEF456GHI789")
      expect(result).toBe("Address starting with ABC1 and ending with I789")
    })

    it("should return short addresses as-is", () => {
      expect(formatAddressForA11y("ABC")).toBe("ABC")
    })

    it("should handle empty addresses", () => {
      expect(formatAddressForA11y("")).toBe("")
    })
  })
})

describe("Focus Management", () => {
  describe("focusContainerProps", () => {
    it("should generate focus container props", () => {
      const props = focusContainerProps("Main content")
      expect(props.accessible).toBe(true)
      expect(props.accessibilityLabel).toBe("Main content")
    })
  })

  describe("modalFocusProps", () => {
    it("should generate modal focus props", () => {
      const props = modalFocusProps("Settings")
      expect(props.accessible).toBe(true)
      expect(props.accessibilityLabel).toBe("Settings dialog")
      expect(props.accessibilityViewIsModal).toBe(true)
    })
  })
})

describe("Live Regions", () => {
  describe("liveRegionProps", () => {
    it("should default to polite", () => {
      const props = liveRegionProps()
      expect(props.accessibilityLiveRegion).toBe("polite")
    })

    it("should support assertive", () => {
      const props = liveRegionProps("assertive")
      expect(props.accessibilityLiveRegion).toBe("assertive")
    })

    it("should support none", () => {
      const props = liveRegionProps("none")
      expect(props.accessibilityLiveRegion).toBe("none")
    })
  })
})

describe("Semantic Grouping", () => {
  describe("groupProps", () => {
    it("should generate group props", () => {
      const props = groupProps("Transaction details")
      expect(props.accessible).toBe(true)
      expect(props.accessibilityLabel).toBe("Transaction details")
    })
  })

  describe("listItemProps", () => {
    it("should generate list item props", () => {
      const props = listItemProps(0, 5, "Transaction")
      expect(props.accessibilityLabel).toBe("Transaction, item 1 of 5")
    })

    it("should handle different positions", () => {
      const props = listItemProps(4, 10, "Payment")
      expect(props.accessibilityLabel).toBe("Payment, item 5 of 10")
    })
  })
})
