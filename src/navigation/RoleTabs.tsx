import { Tabs } from "expo-router"
import { useTranslation } from "react-i18next"

import { Icon, type IconTypes } from "@/components/Icon"
import type { TxKeyPath } from "@/i18n"
import { useAppTheme } from "@/theme/context"

type RoleTabConfig = {
  name: string
  titleTx: TxKeyPath
  accessibilityLabelTx: TxKeyPath
  icon: IconTypes
}

const funeralHomeTabs: RoleTabConfig[] = [
  {
    name: "index",
    titleTx: "funeralHome:tabs.home",
    accessibilityLabelTx: "funeralHome:tabAccessibility.home",
    icon: "menu",
  },
  {
    name: "discover",
    titleTx: "funeralHome:tabs.discover",
    accessibilityLabelTx: "funeralHome:tabAccessibility.discover",
    icon: "view",
  },
  {
    name: "quotes",
    titleTx: "funeralHome:tabs.quotes",
    accessibilityLabelTx: "funeralHome:tabAccessibility.quotes",
    icon: "bell",
  },
  {
    name: "profile",
    titleTx: "shared:tabs.profile",
    accessibilityLabelTx: "shared:tabAccessibility.profile",
    icon: "lock",
  },
  {
    name: "settings",
    titleTx: "shared:tabs.settings",
    accessibilityLabelTx: "shared:tabAccessibility.settings",
    icon: "settings",
  },
]

const supplierTabs: RoleTabConfig[] = [
  {
    name: "index",
    titleTx: "supplier:tabs.home",
    accessibilityLabelTx: "supplier:tabAccessibility.home",
    icon: "menu",
  },
  {
    name: "requests",
    titleTx: "supplier:tabs.requests",
    accessibilityLabelTx: "supplier:tabAccessibility.requests",
    icon: "bell",
  },
  {
    name: "catalog",
    titleTx: "supplier:tabs.catalog",
    accessibilityLabelTx: "supplier:tabAccessibility.catalog",
    icon: "view",
  },
  {
    name: "profile",
    titleTx: "shared:tabs.profile",
    accessibilityLabelTx: "shared:tabAccessibility.profile",
    icon: "lock",
  },
  {
    name: "settings",
    titleTx: "shared:tabs.settings",
    accessibilityLabelTx: "shared:tabAccessibility.settings",
    icon: "settings",
  },
]

export function FuneralHomeTabs() {
  return <RoleTabs tabs={funeralHomeTabs} />
}

export function SupplierTabs() {
  return <RoleTabs tabs={supplierTabs} />
}

function RoleTabs({ tabs }: { tabs: RoleTabConfig[] }) {
  const { t } = useTranslation()
  const { theme } = useAppTheme()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tint,
        tabBarInactiveTintColor: theme.colors.tintInactive,
        tabBarActiveBackgroundColor: theme.colors.surfaceWarm,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          minHeight: 64,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarItemStyle: {
          minHeight: 52,
          paddingHorizontal: 2,
        },
        tabBarLabelPosition: "below-icon",
        tabBarLabelStyle: {
          fontFamily: theme.typography.primary.medium,
          fontSize: 11,
          lineHeight: 14,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.titleTx),
            tabBarLabel: t(tab.titleTx),
            tabBarAccessibilityLabel: t(tab.accessibilityLabelTx),
            tabBarIcon: ({ color, focused }) => (
              <Icon icon={tab.icon} color={color} size={focused ? 24 : 22} />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}
