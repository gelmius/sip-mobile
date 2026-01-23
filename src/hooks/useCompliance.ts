/**
 * Compliance Hook
 *
 * Manages compliance features:
 * - Privacy score calculation
 * - Audit trail tracking
 * - Compliance report generation
 */

import { useMemo, useCallback, useEffect } from "react"
import { Paths, File } from "expo-file-system"
import * as Sharing from "expo-sharing"
import {
  useComplianceStore,
  usePrivacyStore,
  useSwapStore,
  type AuditEvent,
  type AuditEventType,
  type PrivacyScoreBreakdown,
  type ReportConfig,
} from "@/stores"
import { useViewingKeys } from "./useViewingKeys"

// ============================================================================
// TYPES
// ============================================================================

export interface ComplianceStats {
  totalTransactions: number
  shieldedTransactions: number
  transparentTransactions: number
  activeDisclosures: number
  totalDisclosures: number
  lastScanAge: number | null // hours since last scan
}

export interface UseComplianceReturn {
  // Privacy Score
  privacyScore: number
  scoreBreakdown: PrivacyScoreBreakdown
  scoreLabel: string
  scoreColor: string
  refreshScore: () => void

  // Stats
  stats: ComplianceStats

  // Audit Trail
  auditEvents: AuditEvent[]
  logAuditEvent: (
    type: AuditEventType,
    description: string,
    metadata?: Record<string, unknown>
  ) => void
  clearAuditTrail: () => void

  // Reports
  generateReport: (config: ReportConfig) => Promise<string | null>
  reportHistory: Array<{
    id: string
    generatedAt: number
    config: ReportConfig
  }>
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SCORE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
  poor: 20,
}

const SCAN_FREQUENCY_THRESHOLD_HOURS = 24 // Consider recent if scanned within 24h

// ============================================================================
// HELPERS
// ============================================================================

function getScoreLabel(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return "Excellent"
  if (score >= SCORE_THRESHOLDS.good) return "Good"
  if (score >= SCORE_THRESHOLDS.fair) return "Fair"
  if (score >= SCORE_THRESHOLDS.poor) return "Poor"
  return "Critical"
}

function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return "text-green-400"
  if (score >= SCORE_THRESHOLDS.good) return "text-blue-400"
  if (score >= SCORE_THRESHOLDS.fair) return "text-yellow-400"
  if (score >= SCORE_THRESHOLDS.poor) return "text-orange-400"
  return "text-red-400"
}

function formatDateForReport(timestamp: number): string {
  return new Date(timestamp).toISOString()
}

// ============================================================================
// HOOK
// ============================================================================

export function useCompliance(): UseComplianceReturn {
  const {
    privacyScore,
    scoreBreakdown,
    updatePrivacyScore,
    auditEvents,
    addAuditEvent,
    clearAuditTrail,
    reportHistory,
    addReportToHistory,
  } = useComplianceStore()

  const { payments, lastScanTimestamp } = usePrivacyStore()
  const { swaps } = useSwapStore()
  const { disclosures, getActiveDisclosures } = useViewingKeys()

  // ============================================================================
  // STATS CALCULATION
  // ============================================================================

  const stats = useMemo<ComplianceStats>(() => {
    // Count payment transactions
    const shieldedPayments = payments.filter(
      (p) => p.privacyLevel === "shielded"
    ).length
    const transparentPayments = payments.filter(
      (p) => p.privacyLevel === "transparent"
    ).length

    // Count swap transactions
    const shieldedSwaps = swaps.filter(
      (s) => s.privacyLevel === "shielded" && s.status === "completed"
    ).length
    const transparentSwaps = swaps.filter(
      (s) => s.privacyLevel === "transparent" && s.status === "completed"
    ).length

    const totalShielded = shieldedPayments + shieldedSwaps
    const totalTransparent = transparentPayments + transparentSwaps

    // Calculate last scan age in hours
    const lastScanAge = lastScanTimestamp
      ? Math.floor((Date.now() - lastScanTimestamp) / (1000 * 60 * 60))
      : null

    return {
      totalTransactions: totalShielded + totalTransparent,
      shieldedTransactions: totalShielded,
      transparentTransactions: totalTransparent,
      activeDisclosures: getActiveDisclosures().length,
      totalDisclosures: disclosures.length,
      lastScanAge,
    }
  }, [payments, swaps, disclosures, lastScanTimestamp, getActiveDisclosures])

  // ============================================================================
  // PRIVACY SCORE CALCULATION
  // ============================================================================

  const refreshScore = useCallback(() => {
    // 1. Transaction Privacy (40% weight)
    // Score based on % of shielded vs transparent transactions
    let transactionPrivacy = 100
    if (stats.totalTransactions > 0) {
      transactionPrivacy = Math.round(
        (stats.shieldedTransactions / stats.totalTransactions) * 100
      )
    }

    // 2. Key Management (25% weight)
    // Score based on having active disclosures managed properly
    let keyManagement = 50 // Base score
    if (disclosures.length > 0) {
      const revokedDisclosures = disclosures.filter((d) => d.revoked).length
      const activeDisclosures = getActiveDisclosures().length

      // Good: Have some disclosures but not too many active
      if (activeDisclosures <= 3) {
        keyManagement = 80
      } else if (activeDisclosures <= 5) {
        keyManagement = 60
      } else {
        keyManagement = 40
      }

      // Bonus for properly revoking old disclosures
      if (revokedDisclosures > 0) {
        keyManagement = Math.min(100, keyManagement + 10)
      }
    }

    // 3. Disclosure Control (20% weight)
    // Penalize for too many active disclosures without management
    let disclosureControl = 100
    const activeCount = getActiveDisclosures().length
    if (activeCount > 5) {
      disclosureControl = Math.max(20, 100 - (activeCount - 5) * 10)
    }

    // Check for expired disclosures that weren't revoked
    const expiredNotRevoked = disclosures.filter(
      (d) => !d.revoked && d.expiresAt && d.expiresAt < Date.now()
    ).length
    if (expiredNotRevoked > 0) {
      disclosureControl = Math.max(0, disclosureControl - expiredNotRevoked * 10)
    }

    // 4. Scanning Frequency (15% weight)
    // Score based on how recently payments were scanned
    let scanningFrequency = 0
    if (stats.lastScanAge !== null) {
      if (stats.lastScanAge <= 1) {
        scanningFrequency = 100
      } else if (stats.lastScanAge <= 6) {
        scanningFrequency = 80
      } else if (stats.lastScanAge <= SCAN_FREQUENCY_THRESHOLD_HOURS) {
        scanningFrequency = 60
      } else if (stats.lastScanAge <= 72) {
        scanningFrequency = 40
      } else {
        scanningFrequency = 20
      }
    }

    // Calculate weighted score
    const weightedScore = Math.round(
      transactionPrivacy * 0.4 +
        keyManagement * 0.25 +
        disclosureControl * 0.2 +
        scanningFrequency * 0.15
    )

    const breakdown: PrivacyScoreBreakdown = {
      transactionPrivacy,
      keyManagement,
      disclosureControl,
      scanningFrequency,
    }

    updatePrivacyScore(weightedScore, breakdown)
  }, [
    stats,
    disclosures,
    getActiveDisclosures,
    updatePrivacyScore,
  ])

  // Refresh score on mount and when data changes
  useEffect(() => {
    refreshScore()
  }, [refreshScore])

  // ============================================================================
  // AUDIT LOGGING
  // ============================================================================

  const logAuditEvent = useCallback(
    (
      type: AuditEventType,
      description: string,
      metadata?: Record<string, unknown>
    ) => {
      addAuditEvent(type, description, metadata)
    },
    [addAuditEvent]
  )

  // ============================================================================
  // REPORT GENERATION
  // ============================================================================

  const generateReport = useCallback(
    async (config: ReportConfig): Promise<string | null> => {
      try {
        // Calculate date range
        const now = Date.now()
        let startTime = 0
        switch (config.dateRange) {
          case "7d":
            startTime = now - 7 * 24 * 60 * 60 * 1000
            break
          case "30d":
            startTime = now - 30 * 24 * 60 * 60 * 1000
            break
          case "90d":
            startTime = now - 90 * 24 * 60 * 60 * 1000
            break
          case "all":
            startTime = 0
            break
        }

        // Build report data
        const report: Record<string, unknown> = {
          generatedAt: formatDateForReport(now),
          dateRange: {
            start: startTime > 0 ? formatDateForReport(startTime) : "All time",
            end: formatDateForReport(now),
          },
          privacyScore: {
            overall: privacyScore,
            breakdown: scoreBreakdown,
            label: getScoreLabel(privacyScore),
          },
          summary: {
            totalTransactions: stats.totalTransactions,
            shieldedPercentage:
              stats.totalTransactions > 0
                ? Math.round(
                    (stats.shieldedTransactions / stats.totalTransactions) * 100
                  )
                : 0,
            activeDisclosures: stats.activeDisclosures,
          },
        }

        // Include transactions if requested
        if (config.includeTransactions) {
          const filteredPayments = payments.filter(
            (p) => p.timestamp >= startTime
          )
          const filteredSwaps = swaps.filter(
            (s) => s.timestamp >= startTime && s.status === "completed"
          )

          report.transactions = {
            payments: filteredPayments.map((p) => ({
              id: p.id,
              type: p.type,
              amount: p.amount,
              token: p.token,
              status: p.status,
              privacyLevel: p.privacyLevel,
              timestamp: formatDateForReport(p.timestamp),
            })),
            swaps: filteredSwaps.map((s) => ({
              id: s.id,
              fromToken: s.fromToken,
              toToken: s.toToken,
              fromAmount: s.fromAmount,
              toAmount: s.toAmount,
              privacyLevel: s.privacyLevel,
              timestamp: formatDateForReport(s.timestamp),
            })),
          }
        }

        // Include disclosures if requested
        if (config.includeDisclosures) {
          const filteredDisclosures = disclosures.filter(
            (d) => d.disclosedAt >= startTime
          )

          report.disclosures = filteredDisclosures.map((d) => ({
            id: d.id,
            recipientName: d.recipientName,
            purpose: d.purpose,
            disclosedAt: formatDateForReport(d.disclosedAt),
            expiresAt: d.expiresAt ? formatDateForReport(d.expiresAt) : null,
            revoked: d.revoked,
            revokedAt: d.revokedAt ? formatDateForReport(d.revokedAt) : null,
          }))
        }

        // Include audit trail if requested
        if (config.includeAuditTrail) {
          const filteredEvents = auditEvents.filter(
            (e) => e.timestamp >= startTime
          )

          report.auditTrail = filteredEvents.map((e) => ({
            id: e.id,
            type: e.type,
            description: e.description,
            timestamp: formatDateForReport(e.timestamp),
          }))
        }

        // Convert to JSON
        const jsonContent = JSON.stringify(report, null, 2)

        // Save to file
        const filename = `sip-compliance-report-${Date.now()}.json`
        const reportFile = new File(Paths.document, filename)
        await reportFile.write(jsonContent)
        const fileUri = reportFile.uri

        // Add to report history
        addReportToHistory(config)

        // Log audit event
        logAuditEvent("report_generated", `Compliance report generated (${config.dateRange})`, {
          dateRange: config.dateRange,
          includeTransactions: config.includeTransactions,
          includeDisclosures: config.includeDisclosures,
          includeAuditTrail: config.includeAuditTrail,
        })

        // Share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/json",
            dialogTitle: "Export Compliance Report",
          })
        }

        return fileUri
      } catch (error) {
        console.error("Failed to generate report:", error)
        return null
      }
    },
    [
      privacyScore,
      scoreBreakdown,
      stats,
      payments,
      swaps,
      disclosures,
      auditEvents,
      addReportToHistory,
      logAuditEvent,
    ]
  )

  // ============================================================================
  // RETURN
  // ============================================================================

  return useMemo(
    () => ({
      privacyScore,
      scoreBreakdown,
      scoreLabel: getScoreLabel(privacyScore),
      scoreColor: getScoreColor(privacyScore),
      refreshScore,
      stats,
      auditEvents,
      logAuditEvent,
      clearAuditTrail,
      generateReport,
      reportHistory,
    }),
    [
      privacyScore,
      scoreBreakdown,
      refreshScore,
      stats,
      auditEvents,
      clearAuditTrail,
      logAuditEvent,
      generateReport,
      reportHistory,
    ]
  )
}
