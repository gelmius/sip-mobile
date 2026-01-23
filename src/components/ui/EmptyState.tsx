/**
 * Empty State Component
 *
 * Reusable empty state display with optional action
 */

import React from "react"
import { View, Text, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export interface EmptyStateProps {
  /** Title */
  title: string
  /** Description message */
  message?: string
  /** Icon name */
  icon?: keyof typeof Ionicons.glyphMap
  /** Icon color */
  iconColor?: string
  /** Action button text */
  actionLabel?: string
  /** Action callback */
  onAction?: () => void
  /** Custom className */
  className?: string
}

export function EmptyState({
  title,
  message,
  icon = "folder-open",
  iconColor = "#6b7280",
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <View className={`items-center justify-center p-8 ${className}`}>
      <View className="w-20 h-20 bg-neutral-800 rounded-full items-center justify-center mb-4">
        <Ionicons name={icon} size={40} color={iconColor} />
      </View>

      <Text className="text-white text-lg font-semibold text-center mb-2">
        {title}
      </Text>

      {message && (
        <Text className="text-neutral-400 text-center mb-6 max-w-[280px]">
          {message}
        </Text>
      )}

      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="bg-green-500 px-6 py-3 rounded-xl active:bg-green-600"
        >
          <Text className="text-white font-semibold">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  )
}

/**
 * No transactions empty state
 */
export function NoTransactions({ onSend }: { onSend?: () => void }) {
  return (
    <EmptyState
      title="No Transactions Yet"
      message="Your transaction history will appear here once you send or receive payments."
      icon="receipt-outline"
      iconColor="#22c55e"
      actionLabel={onSend ? "Send Payment" : undefined}
      onAction={onSend}
    />
  )
}

/**
 * No payments empty state
 */
export function NoPayments({ onReceive }: { onReceive?: () => void }) {
  return (
    <EmptyState
      title="No Payments Found"
      message="Scan for incoming payments or generate a receive address to get started."
      icon="wallet-outline"
      iconColor="#22c55e"
      actionLabel={onReceive ? "Receive" : undefined}
      onAction={onReceive}
    />
  )
}

/**
 * No swaps empty state
 */
export function NoSwaps({ onSwap }: { onSwap?: () => void }) {
  return (
    <EmptyState
      title="No Swaps Yet"
      message="Your swap history will appear here. Start by exchanging tokens."
      icon="swap-horizontal"
      iconColor="#3b82f6"
      actionLabel={onSwap ? "Swap Now" : undefined}
      onAction={onSwap}
    />
  )
}

/**
 * No audit events empty state
 */
export function NoAuditEvents() {
  return (
    <EmptyState
      title="No Audit Events"
      message="Activity will be recorded here as you use the app."
      icon="document-text-outline"
      iconColor="#8b5cf6"
    />
  )
}

/**
 * No disclosures empty state
 */
export function NoDisclosures({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      title="No Disclosures"
      message="You haven't shared any viewing keys yet. Disclosures allow trusted parties to view your transaction history."
      icon="key-outline"
      iconColor="#f59e0b"
      actionLabel={onCreate ? "Create Disclosure" : undefined}
      onAction={onCreate}
    />
  )
}

/**
 * Search no results
 */
export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      title="No Results"
      message={`No results found for "${query}". Try a different search term.`}
      icon="search-outline"
      iconColor="#6b7280"
    />
  )
}

/**
 * Wallet not connected
 */
export function WalletNotConnected({ onConnect }: { onConnect?: () => void }) {
  return (
    <EmptyState
      title="Wallet Not Connected"
      message="Connect your wallet to view your balances and make transactions."
      icon="wallet-outline"
      iconColor="#22c55e"
      actionLabel={onConnect ? "Connect Wallet" : undefined}
      onAction={onConnect}
    />
  )
}
