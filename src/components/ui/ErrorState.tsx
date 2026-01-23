/**
 * Error State Component
 *
 * Reusable error display with optional retry action
 */

import React from "react"
import { View, Text, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export interface ErrorStateProps {
  /** Error title */
  title?: string
  /** Error message */
  message?: string
  /** Retry callback */
  onRetry?: () => void
  /** Custom icon name */
  icon?: keyof typeof Ionicons.glyphMap
  /** Icon color */
  iconColor?: string
  /** Full screen mode */
  fullScreen?: boolean
  /** Custom className */
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  icon = "alert-circle",
  iconColor = "#ef4444",
  fullScreen = false,
  className = "",
}: ErrorStateProps) {
  const content = (
    <View className={`items-center p-8 ${className}`}>
      <View className="w-16 h-16 bg-red-500/20 rounded-full items-center justify-center mb-4">
        <Ionicons name={icon} size={32} color={iconColor} />
      </View>

      <Text className="text-white text-lg font-semibold text-center mb-2">
        {title}
      </Text>

      <Text className="text-neutral-400 text-center mb-6">{message}</Text>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="bg-green-500 px-6 py-3 rounded-xl active:bg-green-600"
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </Pressable>
      )}
    </View>
  )

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-900">
        {content}
      </View>
    )
  }

  return content
}

/**
 * Network error variant
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="No Connection"
      message="Please check your internet connection and try again."
      icon="cloud-offline"
      iconColor="#f59e0b"
      onRetry={onRetry}
    />
  )
}

/**
 * Permission denied variant
 */
export function PermissionDenied({
  permission,
  onRetry,
}: {
  permission: string
  onRetry?: () => void
}) {
  return (
    <ErrorState
      title="Permission Required"
      message={`Please grant ${permission} permission to continue.`}
      icon="lock-closed"
      iconColor="#8b5cf6"
      onRetry={onRetry}
    />
  )
}

/**
 * Transaction failed variant
 */
export function TransactionFailed({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <ErrorState
      title="Transaction Failed"
      message={message || "The transaction could not be completed. Please try again."}
      icon="close-circle"
      iconColor="#ef4444"
      onRetry={onRetry}
    />
  )
}
