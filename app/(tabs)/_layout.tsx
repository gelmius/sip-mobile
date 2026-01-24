import { Tabs } from 'expo-router'
import { View, Text } from 'react-native'
import {
  House,
  PaperPlaneTilt,
  Download,
  ArrowsLeftRight,
  GearSix,
} from 'phosphor-react-native'
import type { IconProps } from 'phosphor-react-native'
import type { ComponentType } from 'react'

type TabIconProps = {
  focused: boolean
  label: string
  Icon: ComponentType<IconProps>
}

function TabIcon({ focused, label, Icon }: TabIconProps) {
  return (
    <View className="items-center justify-center">
      <Icon
        size={24}
        weight={focused ? 'fill' : 'regular'}
        color={focused ? '#8b5cf6' : '#71717a'}
      />
      <Text
        className={`text-xs mt-1 ${
          focused ? 'text-brand-500 font-medium' : 'text-dark-400'
        }`}
      >
        {label}
      </Text>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#27272a',
          borderTopWidth: 1,
          height: 80,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Home" Icon={House} />
          ),
        }}
      />
      <Tabs.Screen
        name="send"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Send" Icon={PaperPlaneTilt} />
          ),
        }}
      />
      <Tabs.Screen
        name="receive"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Receive" Icon={Download} />
          ),
        }}
      />
      <Tabs.Screen
        name="swap"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Swap" Icon={ArrowsLeftRight} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Settings" Icon={GearSix} />
          ),
        }}
      />
    </Tabs>
  )
}
