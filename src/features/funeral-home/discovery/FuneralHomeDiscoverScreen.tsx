import { useEffect, useMemo, useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import i18n from "i18next"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import type { CategoryDto, SupplierDto } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { AppSearchHeader } from "./components/AppSearchHeader"
import { SupplierCard } from "./components/SupplierCard"
import { useSuppliersQuery } from "./hooks/useSuppliersQuery"
import { useCategoriesQuery } from "../hooks/useCategoriesQuery"

const defaultRegionFilters = ["NRW", "HE", "RP"]
const emptySuppliers: SupplierDto[] = []
const languageFilters = [
  { labelTx: "funeralHome:discover.filters.languages.german", value: "de" },
  { labelTx: "funeralHome:discover.filters.languages.english", value: "en" },
] as const

export function FuneralHomeDiscoverScreen() {
  const { themed } = useAppTheme()
  const routeParams = useLocalSearchParams()
  const routeCategoryId = getFirstParam(routeParams.categoryId)
  const [query, setQuery] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(routeCategoryId)
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>()
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>()
  const categoriesQuery = useCategoriesQuery()
  const categories = useMemo(
    () => categoriesQuery.data?.filter((category) => category.isActive) ?? [],
    [categoriesQuery.data],
  )
  const suppliersQuery = useSuppliersQuery({
    categoryId: selectedCategoryId,
    language: selectedLanguage,
    query,
    region: selectedRegion,
  })
  const suppliers = suppliersQuery.data ?? emptySuppliers
  const regionFilters = useMemo(
    () => getRegionFilters(suppliers, selectedRegion),
    [selectedRegion, suppliers],
  )
  const hasActiveFilters = !!(
    query.trim() ||
    selectedCategoryId ||
    selectedRegion ||
    selectedLanguage
  )
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId)

  useEffect(() => {
    setSelectedCategoryId(routeCategoryId)
  }, [routeCategoryId])

  function clearAllFilters() {
    setQuery("")
    setSelectedCategoryId(undefined)
    setSelectedRegion(undefined)
    setSelectedLanguage(undefined)
  }

  function openSupplierDetail(supplier: SupplierDto) {
    router.push({
      pathname: "/funeral-home/discover/[supplierId]",
      params: {
        supplierId: supplier.id,
        ...((selectedCategoryId ?? supplier.categoryIds[0])
          ? { categoryId: selectedCategoryId ?? supplier.categoryIds[0] }
          : {}),
      },
    })
  }

  function browseCategories() {
    router.push("/funeral-home")
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($content)}
    >
      <AppSearchHeader
        query={query}
        resultCount={suppliers.length}
        onQueryChange={setQuery}
        onClearQuery={() => setQuery("")}
      />

      <View style={themed($module)}>
        <View style={themed($sectionHeader)}>
          <Text tx="funeralHome:discover.filters.title" preset="subheading" />
          <Text tx="funeralHome:discover.filters.body" style={themed($mutedText)} />
        </View>

        <FilterGroup titleTx="funeralHome:discover.filters.categoryTitle">
          {categories.map((category) => {
            const label = getCategoryLabel(category)
            const selected = selectedCategoryId === category.id

            return (
              <FilterChip
                key={category.id}
                label={label}
                selected={selected}
                onPress={() => setSelectedCategoryId(selected ? undefined : category.id)}
              />
            )
          })}
        </FilterGroup>

        <FilterGroup titleTx="funeralHome:discover.filters.regionTitle">
          {regionFilters.map((region) => (
            <FilterChip
              key={region}
              label={region}
              selected={selectedRegion === region}
              onPress={() => setSelectedRegion(selectedRegion === region ? undefined : region)}
            />
          ))}
        </FilterGroup>

        <FilterGroup titleTx="funeralHome:discover.filters.languageTitle">
          {languageFilters.map((language) => (
            <FilterChip
              key={language.value}
              label={translate(language.labelTx)}
              selected={selectedLanguage === language.value}
              onPress={() =>
                setSelectedLanguage(
                  selectedLanguage === language.value ? undefined : language.value,
                )
              }
            />
          ))}
        </FilterGroup>

        <View style={themed($pendingPanel)}>
          <Text tx="funeralHome:discover.filters.certificationPendingTitle" preset="formLabel" />
          <Text
            tx="funeralHome:discover.filters.certificationPendingBody"
            preset="formHelper"
            style={themed($mutedText)}
          />
        </View>

        {hasActiveFilters ? (
          <View style={themed($clearRow)}>
            {selectedCategory ? (
              <Button
                tx="funeralHome:discover.filters.clearCategoryAction"
                onPress={() => setSelectedCategoryId(undefined)}
                preset="default"
                style={themed($compactButton)}
              />
            ) : null}
            {selectedRegion ? (
              <Button
                tx="funeralHome:discover.filters.clearRegionAction"
                onPress={() => setSelectedRegion(undefined)}
                preset="default"
                style={themed($compactButton)}
              />
            ) : null}
            {selectedLanguage ? (
              <Button
                tx="funeralHome:discover.filters.clearLanguageAction"
                onPress={() => setSelectedLanguage(undefined)}
                preset="default"
                style={themed($compactButton)}
              />
            ) : null}
            <Button
              tx="funeralHome:discover.filters.clearAllAction"
              onPress={clearAllFilters}
              preset="filled"
              style={themed($compactButton)}
            />
          </View>
        ) : null}
      </View>

      <SupplierResults
        categories={categories}
        errorTx={suppliersQuery.error?.messageKey}
        isError={suppliersQuery.isError}
        isLoading={suppliersQuery.isLoading}
        isRefetching={suppliersQuery.isRefetching}
        suppliers={suppliers}
        onBrowseCategories={browseCategories}
        onClearFilters={clearAllFilters}
        onOpenSupplierDetail={openSupplierDetail}
        onRetry={() => suppliersQuery.refetch()}
      />
    </Screen>
  )
}

function SupplierResults({
  categories,
  errorTx,
  isError,
  isLoading,
  isRefetching,
  onBrowseCategories,
  onClearFilters,
  onOpenSupplierDetail,
  onRetry,
  suppliers,
}: {
  categories: CategoryDto[]
  errorTx?: TxKeyPath
  isError: boolean
  isLoading: boolean
  isRefetching: boolean
  onBrowseCategories: () => void
  onClearFilters: () => void
  onOpenSupplierDetail: (supplier: SupplierDto) => void
  onRetry: () => void
  suppliers: SupplierDto[]
}) {
  const { themed } = useAppTheme()

  if (isLoading) {
    return (
      <View style={themed($resultsList)}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={themed($loadingCard)}
          >
            <View style={themed($loadingLogo)} />
            <View style={themed($loadingLines)}>
              <Text tx="funeralHome:discover.states.loadingCard" style={themed($loadingText)} />
              <View style={themed($loadingLine)} />
              <View style={themed($loadingLineShort)} />
            </View>
          </View>
        ))}
      </View>
    )
  }

  if (isError) {
    return (
      <View style={themed($statePanel)}>
        <Text tx="funeralHome:discover.states.errorTitle" preset="formLabel" />
        <Text tx={errorTx ?? "api:error.unknown"} style={themed($mutedText)} />
        <Button
          tx={
            isRefetching
              ? "funeralHome:discover.states.retryingAction"
              : "funeralHome:discover.states.retryAction"
          }
          onPress={onRetry}
          disabled={isRefetching}
          preset="filled"
        />
      </View>
    )
  }

  if (suppliers.length === 0) {
    return (
      <View style={themed($statePanel)}>
        <Text tx="funeralHome:discover.states.emptyTitle" preset="formLabel" />
        <Text tx="funeralHome:discover.states.emptyBody" style={themed($mutedText)} />
        <View style={themed($clearRow)}>
          <Button
            tx="funeralHome:discover.states.emptyClearAction"
            onPress={onClearFilters}
            preset="filled"
            style={themed($compactButton)}
          />
          <Button
            tx="funeralHome:discover.states.emptyBrowseAction"
            onPress={onBrowseCategories}
            preset="default"
            style={themed($compactButton)}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={themed($resultsList)}>
      {suppliers.map((supplier) => (
        <SupplierCard
          key={supplier.id}
          supplier={supplier}
          categories={categories}
          onOpenDetail={() => onOpenSupplierDetail(supplier)}
        />
      ))}
    </View>
  )
}

function FilterGroup({ children, titleTx }: { children: React.ReactNode; titleTx: TxKeyPath }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($filterGroup)}>
      <Text tx={titleTx} preset="formLabel" />
      <View style={themed($chipRow)}>{children}</View>
    </View>
  )
}

function FilterChip({
  label,
  onPress,
  selected,
}: {
  label: string
  onPress: () => void
  selected: boolean
}) {
  const { themed } = useAppTheme()

  return (
    <Button
      text={label}
      onPress={onPress}
      accessibilityState={{ selected }}
      preset={selected ? "filled" : "default"}
      style={themed($chip)}
    />
  )
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function getRegionFilters(suppliers: SupplierDto[], selectedRegion: string | undefined) {
  return [
    ...new Set([
      ...defaultRegionFilters,
      ...suppliers.flatMap((supplier) => supplier.regionsServed),
      ...(selectedRegion ? [selectedRegion] : []),
    ]),
  ].filter(Boolean)
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

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
  padding: spacing.md,
  paddingBottom: spacing.xl,
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

const $mutedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $filterGroup: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $chipRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
})

const $chip: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 40,
  paddingHorizontal: spacing.sm,
})

const $pendingPanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.infoBackground,
  borderColor: colors.info,
  borderRadius: 6,
  borderWidth: 1,
  gap: spacing.xxs,
  padding: spacing.sm,
})

const $clearRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
})

const $compactButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 40,
  paddingHorizontal: spacing.sm,
})

const $resultsList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
})

const $loadingCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  flexDirection: "row",
  gap: spacing.md,
  minHeight: 150,
  padding: spacing.md,
})

const $loadingLogo: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.border,
  borderRadius: 8,
  height: 56,
  opacity: 0.45,
  width: 56,
})

const $loadingLines: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.sm,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $loadingLine: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.border,
  borderRadius: 4,
  height: 16,
  opacity: 0.4,
})

const $loadingLineShort: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.border,
  borderRadius: 4,
  height: 16,
  opacity: 0.4,
  width: "68%",
})

const $statePanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surfaceWarm,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.sm,
  padding: spacing.md,
})
