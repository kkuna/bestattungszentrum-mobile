import { TextStyle, View, ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface AppSearchHeaderProps {
  query: string
  resultCount: number
  onQueryChange: (query: string) => void
  onClearQuery: () => void
}

export function AppSearchHeader({
  onClearQuery,
  onQueryChange,
  query,
  resultCount,
}: AppSearchHeaderProps) {
  const { themed } = useAppTheme()
  const hasQuery = query.trim().length > 0

  return (
    <View style={themed($container)}>
      <View style={themed($copy)}>
        <Text
          tx="funeralHome:discover.search.eyebrow"
          preset="formLabel"
          style={themed($eyebrow)}
        />
        <Text tx="funeralHome:discover.search.title" preset="heading" style={themed($title)} />
        <Text tx="funeralHome:discover.search.body" style={themed($mutedText)} />
      </View>

      <TextField
        accessibilityLabel={translate("funeralHome:discover.search.inputAccessibilityLabel")}
        placeholderTx="funeralHome:discover.search.placeholder"
        value={query}
        onChangeText={onQueryChange}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      <View style={themed($selectedRow)}>
        <View
          style={themed($resultPill)}
          accessibilityLabel={translate(
            "funeralHome:discover.search.resultCountAccessibilityLabel",
          )}
        >
          <Text text={String(resultCount)} preset="formLabel" style={themed($resultCount)} />
          <Text tx="funeralHome:discover.search.resultCountLabel" preset="formHelper" />
        </View>
        {hasQuery ? (
          <View style={themed($queryState)}>
            <Text tx="funeralHome:discover.search.selectedLabel" preset="formHelper" />
            <Text
              text={query.trim()}
              preset="formLabel"
              numberOfLines={1}
              style={themed($queryText)}
            />
            <Button
              tx="funeralHome:discover.search.clearQueryAction"
              onPress={onClearQuery}
              preset="default"
              style={themed($compactButton)}
            />
          </View>
        ) : null}
      </View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.md,
  padding: spacing.lg,
})

const $copy: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xxs,
})

const $eyebrow: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  textTransform: "uppercase",
})

const $title: ThemedStyle<TextStyle> = () => ({
  fontSize: 30,
  lineHeight: 38,
})

const $mutedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $selectedRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
})

const $resultPill: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignItems: "center",
  backgroundColor: colors.surfaceWarm,
  borderColor: colors.border,
  borderRadius: 6,
  borderWidth: 1,
  flexDirection: "row",
  gap: spacing.xs,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $resultCount: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.primary,
})

const $queryState: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignItems: "center",
  borderColor: colors.primary,
  borderRadius: 6,
  borderWidth: 1,
  flexDirection: "row",
  flexShrink: 1,
  flexWrap: "wrap",
  gap: spacing.xs,
  padding: spacing.xs,
})

const $queryText: ThemedStyle<TextStyle> = () => ({
  maxWidth: 160,
})

const $compactButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 40,
  paddingHorizontal: spacing.sm,
})
