import { TextStyle, View, ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import {
  type AccountAccessStatus,
  getAccountStatusDisplay,
  type StatusTone,
} from "@/domain/account/accountAccess"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { Colors, ThemedStyle } from "@/theme/types"

type AccountStatusPanelProps = {
  status: AccountAccessStatus
  onSignOut?: () => void
}

export function AccountStatusPanel({ onSignOut, status }: AccountStatusPanelProps) {
  const display = getAccountStatusDisplay(status)
  const { theme, themed } = useAppTheme()
  const toneStyle = getToneStyle(theme.colors, display.tone)

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($content)}
    >
      <View style={themed($panel)}>
        <Text tx="accountStatus:eyebrow" preset="formLabel" style={themed($eyebrow)} />
        <Text tx="accountStatus:title" preset="heading" style={themed($title)} />
        <View style={[themed($badge), toneStyle.badge]}>
          <Text
            tx={display.labelTx}
            accessibilityLabel={translate(display.accessibilityLabelTx)}
            preset="formLabel"
            style={[themed($badgeText), toneStyle.text]}
          />
        </View>
        <InfoBlock labelTx="accountStatus:sections.explanation" bodyTx={display.explanationTx} />
        <InfoBlock labelTx="accountStatus:sections.restrictions" bodyTx={display.restrictionsTx} />
        <InfoBlock labelTx="accountStatus:sections.nextStep" bodyTx={display.nextStepTx} />
        <View style={themed($actions)}>
          {!!display.contactActionTx && (
            <Button
              tx={display.contactActionTx}
              disabled
              disabledStyle={themed($disabledAction)}
              disabledTextStyle={themed($disabledActionText)}
            />
          )}
          {!!onSignOut && <Button tx="auth:session.logoutAction" onPress={onSignOut} />}
        </View>
      </View>
    </Screen>
  )
}

type InfoBlockProps = {
  labelTx: React.ComponentProps<typeof Text>["tx"]
  bodyTx: React.ComponentProps<typeof Text>["tx"]
}

function InfoBlock({ bodyTx, labelTx }: InfoBlockProps) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($infoBlock)}>
      <Text tx={labelTx} preset="formLabel" style={themed($sectionLabel)} />
      <Text tx={bodyTx} style={themed($body)} />
    </View>
  )
}

function getToneStyle(colors: Colors, tone: StatusTone) {
  const toneColors: Record<StatusTone, { backgroundColor: string; color: string }> = {
    critical: { backgroundColor: colors.dangerBackground, color: colors.danger },
    info: { backgroundColor: colors.infoBackground, color: colors.info },
    neutral: { backgroundColor: colors.surfaceWarm, color: colors.textMuted },
    warning: { backgroundColor: colors.warningBackground, color: colors.warning },
  }

  return {
    badge: {
      backgroundColor: toneColors[tone].backgroundColor,
      borderColor: toneColors[tone].color,
    },
    text: {
      color: toneColors[tone].color,
    },
  }
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  justifyContent: "center",
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

const $badge: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignSelf: "flex-start",
  borderRadius: 4,
  borderWidth: 1,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $badgeText: ThemedStyle<TextStyle> = () => ({
  textTransform: "uppercase",
})

const $infoBlock: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xxs,
})

const $sectionLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $body: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
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
