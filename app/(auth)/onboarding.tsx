/**
 * Onboarding Screen (Mandatory)
 *
 * Education-first onboarding for new users. Cannot be skipped.
 * 5 slides covering SIP Privacy features:
 * 1. Welcome to SIP Privacy
 * 2. Private Payments
 * 3. Stealth Addresses
 * 4. Viewing Keys
 * 5. Your Keys, Your Crypto
 */

import { View, Text, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { useState, useRef } from "react"
import { Button } from "@/components/ui"
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated"
import type { Icon as PhosphorIcon } from "phosphor-react-native"
import {
  ShieldCheck,
  LockSimple,
  Ghost,
  Key,
  Fingerprint,
} from "phosphor-react-native"
import { useSettingsStore } from "@/stores/settings"

const { width } = Dimensions.get("window")

interface OnboardingSlide {
  id: string
  icon: PhosphorIcon
  title: string
  description: string
  color: string
}

const SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    icon: ShieldCheck,
    title: "Welcome to SIP Privacy",
    description:
      "The privacy standard for Solana. Your transactions, your business. No one else's.",
    color: "#8b5cf6", // brand-600
  },
  {
    id: "2",
    icon: LockSimple,
    title: "Private Payments",
    description:
      "Send and receive SOL privately. Amounts and recipients are hidden from the public blockchain.",
    color: "#06b6d4", // cyan
  },
  {
    id: "3",
    icon: Ghost,
    title: "Stealth Addresses",
    description:
      "Generate one-time addresses for each transaction. No one can link your payments together.",
    color: "#f97316", // orange
  },
  {
    id: "4",
    icon: Key,
    title: "Viewing Keys",
    description:
      "Share selective access with auditors when needed. Privacy with compliance built-in.",
    color: "#10b981", // green
  },
  {
    id: "5",
    icon: Fingerprint,
    title: "Your Keys, Your Crypto",
    description:
      "Keys stored locally with biometric protection. We never have access to your funds.",
    color: "#ec4899", // pink
  },
]

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollX = useSharedValue(0)
  const flatListRef = useRef<Animated.FlatList<OnboardingSlide>>(null)
  const setOnboardingCompleted = useSettingsStore((s) => s.setOnboardingCompleted)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x
    },
  })

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      })
      setCurrentIndex(currentIndex + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setOnboardingCompleted()
    router.replace("/(auth)/wallet-setup")
  }

  const renderSlide = ({ item }: { item: OnboardingSlide; index: number }) => {
    const IconComponent = item.icon
    return (
      <View style={{ width }} className="items-center px-8">
        {/* Icon */}
        <View
          className="w-32 h-32 rounded-3xl items-center justify-center mb-8"
          style={{ backgroundColor: `${item.color}20` }}
        >
          <IconComponent size={64} color={item.color} weight="fill" />
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-white text-center mb-4">
          {item.title}
        </Text>

        {/* Description */}
        <Text className="text-lg text-dark-400 text-center leading-7">
          {item.description}
        </Text>
      </View>
    )
  }

  const PaginationDot = ({ index }: { index: number }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * width,
        index * width,
        (index + 1) * width,
      ]

      const dotWidth = interpolate(
        scrollX.value,
        inputRange,
        [8, 24, 8],
        Extrapolation.CLAMP
      )

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.3, 1, 0.3],
        Extrapolation.CLAMP
      )

      return {
        width: dotWidth,
        opacity,
      }
    })

    return (
      <Animated.View
        className="h-2 rounded-full bg-brand-600 mx-1"
        style={animatedStyle}
      />
    )
  }

  const isLastSlide = currentIndex === SLIDES.length - 1

  return (
    <SafeAreaView className="flex-1 bg-dark-950">
      {/* Slides - Centered vertically */}
      <View className="flex-1 justify-center items-center">
        <Animated.FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width)
            setCurrentIndex(index)
          }}
        />
      </View>

      {/* Pagination & Button */}
      <View className="px-6 pb-8">
        {/* Dots */}
        <View className="flex-row justify-center mb-4">
          {SLIDES.map((_, index) => (
            <PaginationDot key={index} index={index} />
          ))}
        </View>

        {/* Slide count */}
        <Text className="text-dark-500 text-sm font-medium text-center mb-6">
          {currentIndex + 1} of {SLIDES.length}
        </Text>

        {/* Action Button */}
        <Button fullWidth size="lg" onPress={handleNext}>
          {isLastSlide ? "Get Started" : "Next"}
        </Button>
      </View>
    </SafeAreaView>
  )
}
