import { Pressable, TextStyle, View, ViewStyle } from "react-native"
import { router } from "expo-router"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type SettingsRole = "funeralHome" | "supplier"

type SettingsRoute =
  | "/settings/language"
  | "/settings/session-security"
  | "/settings/notifications"
  | "/settings/offline"
  | "/settings/empty"
  | "/settings/error"
  | "/legal/impressum"
  | "/legal/privacy"
  | "/legal/terms"

type SettingsRowConfig = {
  labelTx: TxKeyPath
  descriptionTx: TxKeyPath
  accessibilityLabelTx: TxKeyPath
  route: SettingsRoute
}

const settingsRows: SettingsRowConfig[] = [
  {
    labelTx: "shared:settings.rows.language.label",
    descriptionTx: "shared:settings.rows.language.description",
    accessibilityLabelTx: "shared:settings.rows.language.accessibilityLabel",
    route: "/settings/language",
  },
  {
    labelTx: "shared:settings.rows.sessionSecurity.label",
    descriptionTx: "shared:settings.rows.sessionSecurity.description",
    accessibilityLabelTx: "shared:settings.rows.sessionSecurity.accessibilityLabel",
    route: "/settings/session-security",
  },
  {
    labelTx: "shared:settings.rows.notifications.label",
    descriptionTx: "shared:settings.rows.notifications.description",
    accessibilityLabelTx: "shared:settings.rows.notifications.accessibilityLabel",
    route: "/settings/notifications",
  },
  {
    labelTx: "shared:settings.rows.offline.label",
    descriptionTx: "shared:settings.rows.offline.description",
    accessibilityLabelTx: "shared:settings.rows.offline.accessibilityLabel",
    route: "/settings/offline",
  },
  {
    labelTx: "shared:settings.rows.empty.label",
    descriptionTx: "shared:settings.rows.empty.description",
    accessibilityLabelTx: "shared:settings.rows.empty.accessibilityLabel",
    route: "/settings/empty",
  },
  {
    labelTx: "shared:settings.rows.error.label",
    descriptionTx: "shared:settings.rows.error.description",
    accessibilityLabelTx: "shared:settings.rows.error.accessibilityLabel",
    route: "/settings/error",
  },
  {
    labelTx: "shared:settings.rows.impressum.label",
    descriptionTx: "shared:settings.rows.impressum.description",
    accessibilityLabelTx: "shared:settings.rows.impressum.accessibilityLabel",
    route: "/legal/impressum",
  },
  {
    labelTx: "shared:settings.rows.privacy.label",
    descriptionTx: "shared:settings.rows.privacy.description",
    accessibilityLabelTx: "shared:settings.rows.privacy.accessibilityLabel",
    route: "/legal/privacy",
  },
  {
    labelTx: "shared:settings.rows.terms.label",
    descriptionTx: "shared:settings.rows.terms.description",
    accessibilityLabelTx: "shared:settings.rows.terms.accessibilityLabel",
    route: "/legal/terms",
  },
]

export function SettingsListScreen({ role }: { role: SettingsRole }) {
  const { themed } = useAppTheme()
  const titleTx: TxKeyPath =
    role === "funeralHome" ? "funeralHome:settings.title" : "supplier:settings.title"
  const bodyTx: TxKeyPath =
    role === "funeralHome" ? "funeralHome:settings.body" : "supplier:settings.body"

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($content)}
    >
      <View style={themed($header)}>
        <Text tx="shared:settings.eyebrow" preset="formLabel" style={themed($eyebrow)} />
        <Text tx={titleTx} preset="heading" />
        <Text tx={bodyTx} style={themed($body)} />
      </View>

      <View style={themed($list)}>
        {settingsRows.map((row) => (
          <SettingsRow key={row.route} row={row} />
        ))}
      </View>
    </Screen>
  )
}

function SettingsRow({ row }: { row: SettingsRowConfig }) {
  const { themed } = useAppTheme()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={translate(row.accessibilityLabelTx)}
      onPress={() => router.push(row.route as never)}
      style={({ pressed }) => themed([$row, pressed && $rowPressed])}
    >
      <View style={themed($rowText)}>
        <Text tx={row.labelTx} preset="bold" style={themed($rowLabel)} />
        <Text tx={row.descriptionTx} preset="formHelper" style={themed($rowDescription)} />
      </View>
      <Text text=">" accessibilityElementsHidden importantForAccessibility="no" />
    </Pressable>
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  gap: spacing.lg,
  padding: spacing.lg,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $eyebrow: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  textTransform: "uppercase",
})

const $body: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $list: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  overflow: "hidden",
})

const $row: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignItems: "center",
  borderBottomColor: colors.separator,
  borderBottomWidth: 1,
  flexDirection: "row",
  gap: spacing.md,
  minHeight: 56,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $rowPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surfaceWarm,
})

const $rowText: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $rowLabel: ThemedStyle<TextStyle> = () => ({
  flexShrink: 1,
})

const $rowDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
  flexShrink: 1,
})
