/**
 * Loading State Component
 *
 * Reusable loading indicator with optional message
 */

import React from "react"
import { View, Text, ActivityIndicator } from "react-native"

export interface LoadingStateProps {
  /** Loading message */
  message?: string
  /** Size of spinner */
  size?: "small" | "large"
  /** Whether to show full screen overlay */
  fullScreen?: boolean
  /** Custom className for container */
  className?: string
}

export function LoadingState({
  message = "Loading...",
  size = "large",
  fullScreen = false,
  className = "",
}: LoadingStateProps) {
  if (fullScreen) {
    return (
      <View className="absolute inset-0 bg-neutral-900/80 items-center justify-center z-50">
        <View className="bg-neutral-800 rounded-2xl p-8 items-center">
          <ActivityIndicator size={size} color="#22c55e" />
          {message && (
            <Text className="text-neutral-300 mt-4 text-center">{message}</Text>
          )}
        </View>
      </View>
    )
  }

  return (
    <View className={`flex-1 items-center justify-center p-8 ${className}`}>
      <ActivityIndicator size={size} color="#22c55e" />
      {message && (
        <Text className="text-neutral-400 mt-4 text-center">{message}</Text>
      )}
    </View>
  )
}

/**
 * Skeleton loading placeholder
 */
export interface SkeletonProps {
  /** Width (number for pixels, string for className) */
  width?: number | string
  /** Height (number for pixels, string for className) */
  height?: number | string
  /** Border radius variant */
  variant?: "text" | "circular" | "rectangular" | "rounded"
  /** Custom className */
  className?: string
}

export function Skeleton({
  width,
  height = 16,
  variant = "text",
  className = "",
}: SkeletonProps) {
  const variantStyles = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "",
    rounded: "rounded-lg",
  }

  const style: Record<string, number | string | undefined> = {}
  if (typeof width === "number") style.width = width
  if (typeof height === "number") style.height = height

  return (
    <View
      className={`bg-neutral-700 animate-pulse ${variantStyles[variant]} ${className}`}
      style={style}
    />
  )
}

/**
 * List item skeleton for loading lists
 */
export function ListItemSkeleton() {
  return (
    <View className="flex-row items-center p-4 bg-neutral-800 rounded-xl mb-2">
      <Skeleton variant="circular" width={48} height={48} />
      <View className="flex-1 ml-3">
        <Skeleton width={120} height={16} className="mb-2" />
        <Skeleton width={80} height={12} />
      </View>
      <Skeleton width={60} height={20} />
    </View>
  )
}

/**
 * Card skeleton for loading cards
 */
export function CardSkeleton() {
  return (
    <View className="bg-neutral-800 rounded-2xl p-4 mb-4">
      <View className="flex-row items-center mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <View className="flex-1 ml-3">
          <Skeleton width={100} height={14} className="mb-1" />
          <Skeleton width={60} height={12} />
        </View>
      </View>
      <Skeleton height={40} className="w-full mb-2" variant="rounded" />
      <Skeleton height={20} width={150} />
    </View>
  )
}
