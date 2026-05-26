import { useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { router } from "expo-router"
import i18n from "i18next"

import { BackHeader } from "@/components/BackHeader"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { TxKeyPath } from "@/i18n"
import type { SupportedLocaleTag } from "@/i18n/locale"
import { translate } from "@/i18n/translate"
import { useSession } from "@/services/session"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { getSettingsRouteForSession } from "./settingsNavigation"

const languageOptions: {
  tag: SupportedLocaleTag
  labelTx: TxKeyPath
  accessibilityLabelTx: TxKeyPath
}[] = [
  {
    tag: "de",
    labelTx: "shared:settings.language.german",
    accessibilityLabelTx: "shared:settings.language.germanAccessibilityLabel",
  },
  {
    tag: "en",
    labelTx: "shared:settings.language.english",
    accessibilityLabelTx: "shared:settings.language.englishAccessibilityLabel",
  },
]

export function LanguageSettingsScreen() {
  const { themed } = useAppTheme()
  const { changeLanguagePreference, session } = useSession()
  const [feedbackTx, setFeedbackTx] = useState<TxKeyPath | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const selectedLanguage =
    session.status === "authenticated" ? session.session.languagePreference : null

  async function handleLanguageChange(language: SupportedLocaleTag) {
    if (isSaving) return

    setIsSaving(true)
    setFeedbackTx(null)

    try {
      const result = await changeLanguagePreference(language)

      if (result.ok) {
        await i18n.changeLanguage(language)
        setFeedbackTx("shared:settings.language.success")
      } else {
        setFeedbackTx(result.messageKey)
      }
    } catch {
      setFeedbackTx("api:error.unknown")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($content)}
    >
      <BackHeader
        accessibilityLabel={translate("shared:settings.language.backAccessibilityLabel")}
        onPress={() => router.replace(getSettingsRouteForSession(session))}
      />
      <View style={themed($panel)}>
        <Text tx="shared:settings.language.eyebrow" preset="formLabel" style={themed($eyebrow)} />
        <Text tx="shared:settings.language.title" preset="heading" />
        <Text tx="shared:settings.language.body" style={themed($body)} />
        <View style={themed($actions)}>
          {languageOptions.map((option) => (
            <Button
              key={option.tag}
              tx={option.labelTx}
              accessibilityLabel={translate(option.accessibilityLabelTx)}
              preset={selectedLanguage === option.tag ? "filled" : "default"}
              disabled={isSaving}
              onPress={() => handleLanguageChange(option.tag)}
            />
          ))}
        </View>
        {!!feedbackTx && <Text tx={feedbackTx} preset="formHelper" />}
      </View>
    </Screen>
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
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

const $body: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})
