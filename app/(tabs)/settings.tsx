import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useWalletStore, formatAddress } from '@/stores/wallet'
import { useViewingKeys } from '@/hooks/useViewingKeys'
import { usePrivacyStore } from '@/stores/privacy'
import { useSwapStore } from '@/stores/swap'
import { useToastStore } from '@/stores/toast'

type SettingsItemProps = {
  icon: string
  title: string
  subtitle?: string
  onPress?: () => void
}

function SettingsItem({ icon, title, subtitle, onPress }: SettingsItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center p-4 bg-dark-900 border-b border-dark-800"
      onPress={onPress}
    >
      <Text className="text-2xl mr-4">{icon}</Text>
      <View className="flex-1">
        <Text className="text-white font-medium">{title}</Text>
        {subtitle && (
          <Text className="text-dark-500 text-sm">{subtitle}</Text>
        )}
      </View>
      <Text className="text-dark-500">›</Text>
    </TouchableOpacity>
  )
}

export default function SettingsScreen() {
  const { isConnected, address } = useWalletStore()
  const { getActiveDisclosures } = useViewingKeys()
  const { payments, clearPayments } = usePrivacyStore()
  const { swaps, clearHistory: clearSwapHistory } = useSwapStore()
  const { addToast } = useToastStore()

  const activeDisclosures = getActiveDisclosures()

  const handleClearPaymentHistory = () => {
    Alert.alert(
      'Clear Payment History',
      `This will remove ${payments.length} payment records from your device. On-chain data is not affected. You can rescan to recover.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearPayments()
            addToast({
              type: 'success',
              title: 'History Cleared',
              message: 'Payment history has been cleared. Rescan to recover.',
            })
          },
        },
      ]
    )
  }

  const handleClearSwapHistory = () => {
    Alert.alert(
      'Clear Swap History',
      `This will remove ${swaps.length} swap records from your device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearSwapHistory()
            addToast({
              type: 'success',
              title: 'History Cleared',
              message: 'Swap history has been cleared.',
            })
          },
        },
      ]
    )
  }
  const disclosureSubtitle = activeDisclosures.length > 0
    ? `${activeDisclosures.length} active disclosure${activeDisclosures.length !== 1 ? 's' : ''}`
    : 'Manage disclosure keys'

  return (
    <SafeAreaView className="flex-1 bg-dark-950">
      <ScrollView className="flex-1">
        <View className="px-4 pt-6 pb-4">
          <Text className="text-3xl font-bold text-white">Settings</Text>
        </View>

        {/* Wallet Section */}
        <View className="mt-4">
          <Text className="text-dark-400 text-sm px-4 mb-2 uppercase">
            Wallet
          </Text>
          <View className="rounded-xl overflow-hidden mx-4">
            <SettingsItem
              icon="👛"
              title="Accounts"
              subtitle={isConnected ? formatAddress(address) : 'Not connected'}
              onPress={() => router.push('/settings/accounts')}
            />
            <SettingsItem
              icon="🔑"
              title="Viewing Keys"
              subtitle={disclosureSubtitle}
              onPress={() => router.push('/settings/viewing-keys')}
            />
            <SettingsItem
              icon="🔐"
              title="Security"
              subtitle="Biometrics & PIN"
              onPress={() => router.push('/settings/security')}
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View className="mt-6">
          <Text className="text-dark-400 text-sm px-4 mb-2 uppercase">
            Privacy
          </Text>
          <View className="rounded-xl overflow-hidden mx-4">
            <SettingsItem
              icon="🛡️"
              title="Privacy Level"
              subtitle="Shielded (recommended)"
            />
            <SettingsItem
              icon="📊"
              title="Privacy Score"
              subtitle="Check wallet exposure"
            />
            <SettingsItem
              icon="🔍"
              title="Compliance Dashboard"
              subtitle="For institutions"
            />
          </View>
        </View>

        {/* Network Section */}
        <View className="mt-6">
          <Text className="text-dark-400 text-sm px-4 mb-2 uppercase">
            Network
          </Text>
          <View className="rounded-xl overflow-hidden mx-4">
            <SettingsItem
              icon="🌐"
              title="Network"
              subtitle="Devnet"
            />
            <SettingsItem
              icon="⚡"
              title="RPC Provider"
              subtitle="Helius"
            />
          </View>
        </View>

        {/* Data & Storage Section */}
        <View className="mt-6">
          <Text className="text-dark-400 text-sm px-4 mb-2 uppercase">
            Data & Storage
          </Text>
          <View className="rounded-xl overflow-hidden mx-4">
            <SettingsItem
              icon="🗑️"
              title="Clear Payment History"
              subtitle={`${payments.length} records`}
              onPress={handleClearPaymentHistory}
            />
            <SettingsItem
              icon="🔄"
              title="Clear Swap History"
              subtitle={`${swaps.length} records`}
              onPress={handleClearSwapHistory}
            />
          </View>
        </View>

        {/* About Section */}
        <View className="mt-6 mb-8">
          <Text className="text-dark-400 text-sm px-4 mb-2 uppercase">
            About
          </Text>
          <View className="rounded-xl overflow-hidden mx-4">
            <SettingsItem
              icon="ℹ️"
              title="About SIP"
              subtitle="v0.1.0"
            />
            <SettingsItem
              icon="📖"
              title="Documentation"
              subtitle="docs.sip-protocol.org"
            />
            <SettingsItem
              icon="🐛"
              title="Report Issue"
              subtitle="GitHub"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
