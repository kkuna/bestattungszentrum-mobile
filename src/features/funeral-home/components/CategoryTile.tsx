import { TextStyle, View, ViewStyle } from "react-native"

import { Card } from "@/components/Card"
import { Text } from "@/components/Text"
import type { CategoryDto } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface CategoryTileProps {
  category: CategoryDto
  label: string
  accessibilityLabel: string
  onPress: (category: CategoryDto) => void
}

export function CategoryTile({ accessibilityLabel, category, label, onPress }: CategoryTileProps) {
  const { themed } = useAppTheme()
  const fallbackMark = label.trim().charAt(0).toLocaleUpperCase()

  return (
    <Card
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress(category)}
      style={themed($tile)}
      ContentComponent={
        <View style={themed($content)}>
          <View style={themed($mark)}>
            <Text text={fallbackMark} preset="formLabel" style={themed($markText)} />
          </View>
          <Text text={label} weight="medium" style={themed($label)} numberOfLines={3} />
        </View>
      }
    />
  )
}

const $tile: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  elevation: 0,
  flexBasis: "47%",
  flexGrow: 1,
  minHeight: 112,
  minWidth: 148,
  padding: spacing.md,
  shadowOpacity: 0,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "flex-start",
  gap: spacing.sm,
})

const $mark: ThemedStyle<ViewStyle> = ({ colors }) => ({
  alignItems: "center",
  backgroundColor: colors.surfaceWarm,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  height: 40,
  justifyContent: "center",
  width: 40,
})

const $markText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.primary,
})

const $label: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  flexShrink: 1,
})
