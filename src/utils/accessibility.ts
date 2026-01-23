/**
 * Accessibility Utilities
 *
 * WCAG AA compliance helpers for React Native
 */

import { AccessibilityInfo, Platform } from "react-native"

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Minimum touch target size (WCAG 2.5.5 - Target Size)
 * 44px minimum for iOS, 48dp for Android
 */
export const MIN_TOUCH_TARGET = Platform.OS === "ios" ? 44 : 48

/**
 * Minimum contrast ratio for normal text (WCAG 2.1 AA)
 */
export const MIN_CONTRAST_RATIO = 4.5

/**
 * Minimum contrast ratio for large text (WCAG 2.1 AA)
 */
export const MIN_CONTRAST_RATIO_LARGE = 3.0

// ============================================================================
// ACCESSIBILITY PROPS HELPERS
// ============================================================================

export interface A11yLabelProps {
  accessibilityLabel: string
  accessibilityHint?: string
  accessibilityRole?: "button" | "link" | "text" | "image" | "header" | "none"
}

/**
 * Generate accessibility props for buttons
 */
export function buttonA11y(
  label: string,
  hint?: string,
  disabled?: boolean
): A11yLabelProps & { accessibilityState?: { disabled: boolean } } {
  return {
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: "button",
    ...(disabled !== undefined && { accessibilityState: { disabled } }),
  }
}

/**
 * Generate accessibility props for links
 */
export function linkA11y(label: string, hint?: string): A11yLabelProps {
  return {
    accessibilityLabel: label,
    accessibilityHint: hint || `Opens ${label}`,
    accessibilityRole: "link",
  }
}

/**
 * Generate accessibility props for headers
 */
export function headerA11y(label: string, _level?: number): A11yLabelProps {
  return {
    accessibilityLabel: label,
    accessibilityRole: "header",
    // Note: accessibilityLevel is iOS only for now, _level reserved for future
  }
}

/**
 * Generate accessibility props for images
 */
export function imageA11y(label: string, isDecorative = false): A11yLabelProps {
  if (isDecorative) {
    return {
      accessibilityLabel: "",
      accessibilityRole: "none",
    }
  }
  return {
    accessibilityLabel: label,
    accessibilityRole: "image",
  }
}

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

/**
 * Announce a message to screen readers
 */
export function announce(message: string): void {
  AccessibilityInfo.announceForAccessibility(message)
}

/**
 * Announce a polite message (won't interrupt current speech)
 */
export function announcePolite(message: string): void {
  // On iOS, announceForAccessibility uses polite by default
  // On Android, we can use announceForAccessibilityWithOptions
  if (Platform.OS === "android") {
    AccessibilityInfo.announceForAccessibilityWithOptions(message, {
      queue: true,
    })
  } else {
    AccessibilityInfo.announceForAccessibility(message)
  }
}

/**
 * Announce an important/assertive message
 */
export function announceAssertive(message: string): void {
  if (Platform.OS === "android") {
    AccessibilityInfo.announceForAccessibilityWithOptions(message, {
      queue: false,
    })
  } else {
    AccessibilityInfo.announceForAccessibility(message)
  }
}

// ============================================================================
// STATUS MESSAGES
// ============================================================================

/**
 * Generate accessibility message for loading state
 */
export function loadingA11yMessage(context?: string): string {
  return context ? `Loading ${context}...` : "Loading..."
}

/**
 * Generate accessibility message for error state
 */
export function errorA11yMessage(error: string): string {
  return `Error: ${error}`
}

/**
 * Generate accessibility message for success state
 */
export function successA11yMessage(action: string): string {
  return `${action} successful`
}

// ============================================================================
// FINANCIAL FORMATTING FOR SCREEN READERS
// ============================================================================

/**
 * Format currency amount for screen readers
 * e.g., "$1,234.56" -> "one thousand two hundred thirty-four dollars and fifty-six cents"
 */
export function formatAmountForA11y(amount: string, symbol: string): string {
  const numericAmount = parseFloat(amount.replace(/[^0-9.-]/g, ""))
  if (isNaN(numericAmount)) return `${amount} ${symbol}`

  const formattedNum = numericAmount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  })

  return `${formattedNum} ${symbol}`
}

/**
 * Format address for screen readers (truncated)
 */
export function formatAddressForA11y(address: string): string {
  if (!address || address.length < 10) return address
  return `Address starting with ${address.slice(0, 4)} and ending with ${address.slice(-4)}`
}

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Generate props for focus management on containers
 */
export function focusContainerProps(label: string) {
  return {
    accessible: true,
    accessibilityLabel: label,
  }
}

/**
 * Generate props to trap focus within a modal/dialog
 */
export function modalFocusProps(title: string) {
  return {
    accessible: true,
    accessibilityLabel: `${title} dialog`,
    accessibilityViewIsModal: true,
  }
}

// ============================================================================
// LIVE REGIONS (for dynamic content)
// ============================================================================

export type LiveRegionType = "none" | "polite" | "assertive"

/**
 * Props for live regions that announce changes
 */
export function liveRegionProps(type: LiveRegionType = "polite") {
  return {
    accessibilityLiveRegion: type,
  }
}

// ============================================================================
// SEMANTIC GROUPING
// ============================================================================

/**
 * Group elements for accessibility (read as single unit)
 */
export function groupProps(label: string) {
  return {
    accessible: true,
    accessibilityLabel: label,
  }
}

/**
 * List item props
 */
export function listItemProps(index: number, total: number, label: string) {
  return {
    accessibilityLabel: `${label}, item ${index + 1} of ${total}`,
  }
}
