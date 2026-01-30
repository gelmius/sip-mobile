/**
 * Services for SIP Mobile
 */

// Background Payment Scanning
export {
  BACKGROUND_SCAN_TASK,
  registerBackgroundScan,
  unregisterBackgroundScan,
  isBackgroundScanEnabled,
  setBackgroundScanEnabled,
  getBackgroundFetchStatus,
  requestNotificationPermissions,
  triggerBackgroundScan,
} from "./backgroundScan"
