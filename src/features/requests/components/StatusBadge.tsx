import { TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import type {
  RequestDisplayTone,
  RequestStatusDisplay,
} from "@/domain/requests/requestStatusDisplay"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface StatusBadgeProps {
  display: RequestStatusDisplay
}

export function StatusBadge({ display }: StatusBadgeProps) {
  const { themed } = useAppTheme()
  const label = translate(display.labelKey)

  return (
    <View
      accessibilityLabel={translate(display.accessibilityLabelKey, { status: label })}
      accessibilityRole="text"
      style={themed([$badge, $toneStyles[display.tone]])}
    >
      <Text text={label} style={themed([$badgeText, $toneTextStyles[display.tone]])} />
    </View>
  )
}

const $badge: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignSelf: "flex-start",
  borderRadius: 4,
  borderWidth: 1,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xxxs,
})

const $badgeText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 12,
  lineHeight: 16,
})

const $toneStyles: Record<RequestDisplayTone, ThemedStyle<ViewStyle>> = {
  danger: ({ colors }) => ({
    backgroundColor: colors.dangerBackground,
    borderColor: colors.danger,
  }),
  info: ({ colors }) => ({
    backgroundColor: colors.infoBackground,
    borderColor: colors.info,
  }),
  neutral: ({ colors }) => ({
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.border,
  }),
  success: ({ colors }) => ({
    backgroundColor: colors.successBackground,
    borderColor: colors.success,
  }),
  warning: ({ colors }) => ({
    backgroundColor: colors.warningBackground,
    borderColor: colors.warning,
  }),
}

const $toneTextStyles: Record<RequestDisplayTone, ThemedStyle<TextStyle>> = {
  danger: ({ colors }) => ({ color: colors.danger }),
  info: ({ colors }) => ({ color: colors.info }),
  neutral: ({ colors }) => ({ color: colors.textMuted }),
  success: ({ colors }) => ({ color: colors.success }),
  warning: ({ colors }) => ({ color: colors.warning }),
}
