import { ReactNode } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import type { Href } from "expo-router"

import { BackHeader } from "@/components/BackHeader"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface PlaceholderAction {
  tx: TxKeyPath
  onPress?: () => void
  disabled?: boolean
  preset?: "default" | "filled" | "reversed"
}

interface PlaceholderScreenProps {
  eyebrowTx?: TxKeyPath
  titleTx: TxKeyPath
  bodyTx: TxKeyPath
  statusTx?: TxKeyPath
  actions?: PlaceholderAction[]
  backAccessibilityLabelTx?: TxKeyPath
  backFallbackHref?: Href
  children?: ReactNode
  onBackPress?: () => void
  showBack?: boolean
}

export function PlaceholderScreen(props: PlaceholderScreenProps) {
  const {
    actions = [],
    backAccessibilityLabelTx,
    backFallbackHref,
    bodyTx,
    children,
    eyebrowTx,
    onBackPress,
    showBack,
    statusTx,
    titleTx,
  } = props
  const { themed } = useAppTheme()

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed(showBack ? $contentWithBack : $content)}
    >
      {showBack ? (
        <BackHeader
          accessibilityLabel={
            backAccessibilityLabelTx ? translate(backAccessibilityLabelTx) : undefined
          }
          fallbackHref={backFallbackHref}
          onPress={onBackPress}
        />
      ) : null}
      <View style={themed($panel)}>
        {!!eyebrowTx && <Text tx={eyebrowTx} preset="formLabel" style={themed($eyebrow)} />}
        <Text tx={titleTx} preset="heading" style={themed($title)} />
        <Text tx={bodyTx} style={themed($body)} />
        {!!statusTx && (
          <View style={themed($status)}>
            <Text tx={statusTx} preset="formHelper" />
          </View>
        )}
        {children}
        {actions.length > 0 && (
          <View style={themed($actions)}>
            {actions.map((action) => (
              <Button
                key={action.tx}
                tx={action.tx}
                onPress={action.onPress}
                disabled={action.disabled}
                disabledStyle={themed($disabledAction)}
                disabledTextStyle={themed($disabledActionText)}
                preset={action.preset}
              />
            ))}
          </View>
        )}
      </View>
    </Screen>
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  justifyContent: "center",
  padding: spacing.lg,
})

const $contentWithBack: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  gap: spacing.sm,
  padding: spacing.lg,
})

const $panel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.md,
  padding: spacing.lg,
})

const $eyebrow: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  textTransform: "uppercase",
})

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.xxs,
})

const $body: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $status: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surfaceWarm,
  borderColor: colors.border,
  borderRadius: 6,
  borderWidth: 1,
  padding: spacing.sm,
})

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
  marginTop: spacing.sm,
})

const $disabledAction: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surfaceWarm,
  borderColor: colors.border,
  opacity: 0.72,
})

const $disabledActionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})
