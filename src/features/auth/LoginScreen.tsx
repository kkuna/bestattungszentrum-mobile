import { useRef, useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { router } from "expo-router"
import i18n from "i18next"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import {
  defaultLocale,
  getPrimaryLanguageTag,
  isSupportedLanguageTag,
  type SupportedLocaleTag,
} from "@/i18n/locale"
import { translate } from "@/i18n/translate"
import { getWorkspacePathForSession, useSession } from "@/services/session"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export function LoginScreen() {
  const { themed } = useAppTheme()
  const { login } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)

  async function handleSubmit() {
    if (isSubmittingRef.current) return

    if (!email.trim() || !password) {
      setFeedback(translate("auth:login.missingFields"))
      return
    }

    isSubmittingRef.current = true
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const result = await login({ email: email.trim(), password }, getActiveLoginLocale())

      if (result.ok) {
        setFeedback(translate("auth:login.success"))
        router.replace(getWorkspacePathForSession(result.data))
      } else {
        setFeedback(translate(result.messageKey))
      }
    } catch {
      setFeedback(translate("api:error.unknown"))
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($content)}
    >
      <View style={themed($panel)}>
        <Text tx="auth:login.eyebrow" preset="formLabel" style={themed($eyebrow)} />
        <Text tx="auth:login.title" preset="heading" />
        <Text tx="auth:login.body" style={themed($body)} />

        <View style={themed($fields)}>
          <TextField
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            labelTx="auth:login.emailLabel"
            onChangeText={setEmail}
            placeholderTx="auth:login.emailPlaceholder"
            value={email}
          />
          <TextField
            autoCapitalize="none"
            autoComplete="password"
            labelTx="auth:login.passwordLabel"
            onChangeText={setPassword}
            placeholderTx="auth:login.passwordPlaceholder"
            secureTextEntry
            value={password}
          />
        </View>

        {!!feedback && <Text text={feedback} style={themed($feedback)} />}
        <Text tx="auth:login.status" style={themed($body)} />

        <Button
          tx={isSubmitting ? "auth:login.submitting" : "auth:login.primaryAction"}
          preset="reversed"
          disabled={isSubmitting}
          onPress={handleSubmit}
        />
      </View>
    </Screen>
  )
}

function getActiveLoginLocale(): SupportedLocaleTag {
  const activeLanguage = i18n.language ?? defaultLocale
  const primaryLanguage = getPrimaryLanguageTag(activeLanguage)

  if (isSupportedLanguageTag(primaryLanguage)) {
    return primaryLanguage
  }

  return defaultLocale
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

const $body: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $fields: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
})

const $feedback: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})
