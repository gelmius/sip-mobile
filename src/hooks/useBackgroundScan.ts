/**
 * Background Scan Hook
 *
 * React hook for managing background payment scanning.
 * Provides state management, permission handling, and UI integration.
 */

import { useState, useCallback, useEffect } from "react"
import * as BackgroundFetch from "expo-background-fetch"
import {
  isBackgroundScanEnabled,
  setBackgroundScanEnabled,
  getBackgroundFetchStatus,
  requestNotificationPermissions,
  triggerBackgroundScan,
} from "@/services/backgroundScan"

// ============================================================================
// Types
// ============================================================================

export interface UseBackgroundScanReturn {
  /** Whether background scanning is currently enabled */
  isEnabled: boolean
  /** Whether the feature is loading */
  isLoading: boolean
  /** Current background fetch status */
  status: BackgroundFetch.BackgroundFetchStatus | null
  /** Human-readable status text */
  statusText: string
  /** Whether the device supports background fetch */
  isSupported: boolean
  /** Error message if any */
  error: string | null
  /** Enable or disable background scanning */
  setEnabled: (enabled: boolean) => Promise<void>
  /** Toggle background scanning */
  toggle: () => Promise<void>
  /** Trigger an immediate scan (for testing) */
  scanNow: () => Promise<void>
  /** Request notification permissions */
  requestPermissions: () => Promise<boolean>
  /** Refresh the status */
  refresh: () => Promise<void>
}

// ============================================================================
// Status Text Helper
// ============================================================================

function getStatusText(status: BackgroundFetch.BackgroundFetchStatus | null): string {
  if (status === null) return "Unknown"

  switch (status) {
    case BackgroundFetch.BackgroundFetchStatus.Available:
      return "Available"
    case BackgroundFetch.BackgroundFetchStatus.Denied:
      return "Denied by user"
    case BackgroundFetch.BackgroundFetchStatus.Restricted:
      return "Restricted by system"
    default:
      return "Unknown"
  }
}

// ============================================================================
// Hook
// ============================================================================

export function useBackgroundScan(): UseBackgroundScanReturn {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<BackgroundFetch.BackgroundFetchStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Compute derived state
  const isSupported = status === BackgroundFetch.BackgroundFetchStatus.Available
  const statusText = getStatusText(status)

  // Load initial state
  const loadState = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [enabled, fetchStatus] = await Promise.all([
        isBackgroundScanEnabled(),
        getBackgroundFetchStatus(),
      ])

      setIsEnabled(enabled)
      setStatus(fetchStatus)
    } catch (err) {
      console.error("[useBackgroundScan] Failed to load state:", err)
      setError(err instanceof Error ? err.message : "Failed to load state")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load on mount
  useEffect(() => {
    loadState()
  }, [loadState])

  // Set enabled
  const setEnabled = useCallback(async (enabled: boolean) => {
    setIsLoading(true)
    setError(null)

    try {
      // Request notification permissions if enabling
      if (enabled) {
        const hasPermission = await requestNotificationPermissions()
        if (!hasPermission) {
          setError("Notification permission required")
          setIsLoading(false)
          return
        }
      }

      await setBackgroundScanEnabled(enabled)
      setIsEnabled(enabled)

      // Refresh status
      const newStatus = await getBackgroundFetchStatus()
      setStatus(newStatus)
    } catch (err) {
      console.error("[useBackgroundScan] Failed to set enabled:", err)
      setError(err instanceof Error ? err.message : "Failed to update setting")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Toggle
  const toggle = useCallback(async () => {
    await setEnabled(!isEnabled)
  }, [isEnabled, setEnabled])

  // Scan now
  const scanNow = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await triggerBackgroundScan()
    } catch (err) {
      console.error("[useBackgroundScan] Failed to trigger scan:", err)
      setError(err instanceof Error ? err.message : "Failed to trigger scan")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      return await requestNotificationPermissions()
    } catch (err) {
      console.error("[useBackgroundScan] Failed to request permissions:", err)
      return false
    }
  }, [])

  // Refresh
  const refresh = useCallback(async () => {
    await loadState()
  }, [loadState])

  return {
    isEnabled,
    isLoading,
    status,
    statusText,
    isSupported,
    error,
    setEnabled,
    toggle,
    scanNow,
    requestPermissions,
    refresh,
  }
}
