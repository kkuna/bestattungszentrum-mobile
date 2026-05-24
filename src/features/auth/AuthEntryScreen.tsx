import { TextStyle, View, ViewStyle } from "react-native"
import { router } from "expo-router"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

function navigateTo(href: string) {
  router.push(href as Parameters<typeof router.push>[0])
}

export function AuthEntryScreen() {
  const { themed } = useAppTheme()

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($content)}
    >
      <View style={themed($panel)}>
        <Text tx="auth:entry.eyebrow" preset="formLabel" style={themed($eyebrow)} />
        <Text tx="auth:entry.title" preset="heading" />
        <Text tx="auth:entry.body" style={themed($body)} />

        <View style={themed($actions)}>
          <Button
            tx="auth:entry.loginAction"
            preset="reversed"
            onPress={() => navigateTo("/login")}
          />
          <Button tx="auth:entry.signupAction" onPress={() => navigateTo("/signup")} />
          <Button
            tx="auth:entry.forgotPasswordAction"
            onPress={() => navigateTo("/forgot-password")}
          />
          <Button tx="auth:entry.legalAction" onPress={() => navigateTo("/legal/impressum")} />
        </View>
      </View>
    </Screen>
  )
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

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
  marginTop: spacing.sm,
})
