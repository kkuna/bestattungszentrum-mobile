import { useMemo } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { router } from "expo-router"
import i18n from "i18next"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import type { CategoryDto } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { CategoryTile } from "./components/CategoryTile"
import { useCategoriesQuery } from "./hooks/useCategoriesQuery"

export function FuneralHomeHomeScreen() {
  const { themed } = useAppTheme()
  const categoriesQuery = useCategoriesQuery()
  const activeCategories = useMemo(
    () => categoriesQuery.data?.filter((category) => category.isActive) ?? [],
    [categoriesQuery.data],
  )

  function openDiscover() {
    router.push("/funeral-home/discover")
  }

  function openQuotes() {
    router.push("/funeral-home/quotes")
  }

  function openCategory(category: CategoryDto) {
    router.push({
      pathname: "/funeral-home/discover",
      params: { categoryId: category.id, categorySlug: category.slug },
    })
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($content)}
    >
      <View style={themed($introModule)}>
        <Text tx="funeralHome:home.eyebrow" preset="formLabel" style={themed($eyebrow)} />
        <Text tx="funeralHome:home.title" preset="heading" style={themed($title)} />
        <Text tx="funeralHome:home.body" style={themed($mutedText)} />
        <View style={themed($statusPill)}>
          <Text tx="funeralHome:home.status" preset="formHelper" style={themed($statusText)} />
        </View>
      </View>

      <View style={themed($module)}>
        <View style={themed($sectionHeader)}>
          <Text tx="funeralHome:home.categories.title" preset="subheading" />
          <Text tx="funeralHome:home.categories.body" style={themed($mutedText)} />
        </View>
        <CategorySection
          categories={activeCategories}
          errorTx={categoriesQuery.error?.messageKey}
          isError={categoriesQuery.isError}
          isLoading={categoriesQuery.isLoading}
          isRefetching={categoriesQuery.isRefetching}
          onCategoryPress={openCategory}
          onDiscoverPress={openDiscover}
          onRetryPress={() => categoriesQuery.refetch()}
        />
      </View>

      <View style={themed($module)}>
        <View style={themed($sectionHeader)}>
          <Text tx="funeralHome:home.shortcuts.title" preset="subheading" />
          <Text tx="funeralHome:home.shortcuts.body" style={themed($mutedText)} />
        </View>
        <View style={themed($shortcutGrid)}>
          <Shortcut
            titleTx="funeralHome:home.shortcuts.discoverTitle"
            bodyTx="funeralHome:home.shortcuts.discoverBody"
            actionTx="funeralHome:home.shortcuts.discoverAction"
            onPress={openDiscover}
          />
          <Shortcut
            titleTx="funeralHome:home.shortcuts.quotesTitle"
            bodyTx="funeralHome:home.shortcuts.quotesBody"
            actionTx="funeralHome:home.shortcuts.quotesAction"
            onPress={openQuotes}
          />
        </View>
      </View>
    </Screen>
  )
}

function CategorySection({
  categories,
  errorTx,
  isError,
  isLoading,
  isRefetching,
  onCategoryPress,
  onDiscoverPress,
  onRetryPress,
}: {
  categories: CategoryDto[]
  errorTx?: TxKeyPath
  isError: boolean
  isLoading: boolean
  isRefetching: boolean
  onCategoryPress: (category: CategoryDto) => void
  onDiscoverPress: () => void
  onRetryPress: () => void
}) {
  const { themed } = useAppTheme()

  if (isLoading) {
    return (
      <View style={themed($categoryGrid)}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={themed($loadingTile)}
          >
            <View style={themed($loadingMark)} />
            <Text tx="funeralHome:home.categories.loading" style={themed($loadingText)} />
          </View>
        ))}
      </View>
    )
  }

  if (isError) {
    return (
      <View style={themed($statePanel)}>
        <Text tx="funeralHome:home.categories.errorTitle" preset="formLabel" />
        <Text tx={errorTx ?? "api:error.unknown"} style={themed($mutedText)} />
        <Button
          tx={
            isRefetching
              ? "funeralHome:home.categories.retryingAction"
              : "funeralHome:home.categories.retryAction"
          }
          onPress={onRetryPress}
          disabled={isRefetching}
          preset="filled"
        />
      </View>
    )
  }

  if (categories.length === 0) {
    return (
      <View style={themed($statePanel)}>
        <Text tx="funeralHome:home.categories.emptyTitle" preset="formLabel" />
        <Text tx="funeralHome:home.categories.emptyBody" style={themed($mutedText)} />
        <Button
          tx="funeralHome:home.categories.emptyAction"
          onPress={onDiscoverPress}
          preset="filled"
        />
      </View>
    )
  }

  return (
    <View style={themed($categoryGrid)}>
      {categories.map((category) => {
        const label = getCategoryLabel(category)

        return (
          <CategoryTile
            key={category.id}
            category={category}
            label={label}
            accessibilityLabel={translateCategoryA11y(label)}
            onPress={onCategoryPress}
          />
        )
      })}
    </View>
  )
}

function Shortcut({
  actionTx,
  bodyTx,
  onPress,
  titleTx,
}: {
  actionTx: TxKeyPath
  bodyTx: TxKeyPath
  onPress: () => void
  titleTx: TxKeyPath
}) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($shortcut)}>
      <Text tx={titleTx} preset="formLabel" />
      <Text tx={bodyTx} preset="formHelper" style={themed($mutedText)} />
      <Button tx={actionTx} onPress={onPress} preset="default" style={themed($shortcutButton)} />
    </View>
  )
}

function getCategoryLabel(category: CategoryDto) {
  const primaryName = i18n.language.startsWith("en") ? category.nameEn : category.nameDe
  const fallbackName = i18n.language.startsWith("en") ? category.nameDe : category.nameEn

  return (
    primaryName.trim() ||
    fallbackName.trim() ||
    translate("funeralHome:home.categories.unnamedCategory")
  )
}

function translateCategoryA11y(name: string) {
  return translate("funeralHome:home.categories.tileA11y", { name })
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
  padding: spacing.md,
  paddingBottom: spacing.xl,
})

const $introModule: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.sm,
  padding: spacing.lg,
})

const $module: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.md,
  padding: spacing.md,
})

const $sectionHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
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

const $statusPill: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignSelf: "flex-start",
  backgroundColor: colors.surfaceWarm,
  borderColor: colors.border,
  borderRadius: 6,
  borderWidth: 1,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $statusText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.primary,
})

const $categoryGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
})

const $loadingTile: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surfaceWarm,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  flexBasis: "47%",
  flexGrow: 1,
  gap: spacing.sm,
  minHeight: 112,
  minWidth: 148,
  padding: spacing.md,
})

const $loadingMark: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.border,
  borderRadius: 8,
  height: 40,
  opacity: 0.45,
  width: 40,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $statePanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surfaceWarm,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.sm,
  padding: spacing.md,
})

const $shortcutGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $shortcut: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.sm,
  padding: spacing.md,
})

const $shortcutButton: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "stretch",
})
