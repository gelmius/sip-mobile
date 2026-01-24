import "../global.css"
import { useEffect, useState, useCallback } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import * as SplashScreen from "expo-splash-screen"
import { WalletProvider } from "@/providers"

// Keep splash screen visible while we initialize
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any critical resources here
        // For now, just a minimal delay to ensure smooth transition
        await new Promise((resolve) => setTimeout(resolve, 100))
      } finally {
        setIsReady(true)
      }
    }
    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      // Hide splash screen once layout is ready
      await SplashScreen.hideAsync()
    }
  }, [isReady])

  if (!isReady) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <WalletProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0a0a0a" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </WalletProvider>
    </GestureHandlerRootView>
  )
}
