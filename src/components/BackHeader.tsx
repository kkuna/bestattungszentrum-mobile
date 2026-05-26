import { Pressable, StyleProp, ViewStyle } from "react-native"
import { router } from "expo-router"
import type { Href } from "expo-router"
import { ChevronLeft } from "lucide-react-native"

import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface BackHeaderProps {
  accessibilityLabel?: string
  fallbackHref?: Href
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

export function BackHeader({ accessibilityLabel, fallbackHref, onPress, style }: BackHeaderProps) {
  const { theme, themed } = useAppTheme()

  function handlePress() {
    if (onPress) {
      onPress()
      return
    }

    if (router.canGoBack()) {
      router.back()
      return
    }

    if (fallbackHref) {
      router.replace(fallbackHref)
    }
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? translate("common:back")}
      hitSlop={8}
      onPress={handlePress}
      style={({ pressed }) => [themed($button), pressed && themed($buttonPressed), style]}
    >
      <ChevronLeft color={theme.colors.text} size={28} strokeWidth={2.25} />
    </Pressable>
  )
}

const $button: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  alignSelf: "flex-start",
  borderRadius: 22,
  height: 44,
  justifyContent: "center",
  width: 44,
})

const $buttonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surfaceWarm,
})
