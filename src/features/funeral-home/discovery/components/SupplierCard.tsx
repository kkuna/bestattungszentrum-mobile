import { useMemo, useState } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import i18n from "i18next"

import { Card } from "@/components/Card"
import { Text } from "@/components/Text"
import { translate } from "@/i18n/translate"
import type { CategoryDto, SupplierDto } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface SupplierCardProps {
  supplier: SupplierDto
  categories: CategoryDto[]
  onOpenDetail: () => void
}

export function SupplierCard({ categories, onOpenDetail, supplier }: SupplierCardProps) {
  const { themed } = useAppTheme()
  const [logoFailed, setLogoFailed] = useState(false)
  const supplierName = supplier.tradingName.trim() || supplier.legalName
  const categoryLabels = useMemo(
    () => getCategoryLabels(supplier.categoryIds, categories),
    [categories, supplier.categoryIds],
  )
  const isRequestable = supplier.accountStatus === "ACTIVE"
  const fallbackMark = supplierName.trim().charAt(0).toLocaleUpperCase()

  return (
    <Card
      accessibilityLabel={translate("funeralHome:discover.card.detailA11y", {
        name: supplierName,
      })}
      onPress={onOpenDetail}
      style={themed($card)}
      ContentComponent={
        <View style={themed($content)}>
          <View style={themed($header)}>
            <View style={themed($logoFrame)}>
              {isSafeLogoUrl(supplier.logoUrl) && !logoFailed ? (
                <Image
                  source={{ uri: supplier.logoUrl! }}
                  onError={() => setLogoFailed(true)}
                  style={themed($logo)}
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <Text text={fallbackMark} preset="formLabel" style={themed($logoText)} />
              )}
            </View>
            <View style={themed($identity)}>
              <Text text={supplierName} preset="subheading" numberOfLines={2} />
              {categoryLabels.length > 0 ? (
                <Text
                  text={categoryLabels.join(", ")}
                  preset="formHelper"
                  style={themed($mutedText)}
                />
              ) : (
                <Text
                  tx="funeralHome:discover.card.categoryFallback"
                  preset="formHelper"
                  style={themed($mutedText)}
                />
              )}
            </View>
          </View>

          <View
            accessibilityLabel={
              isRequestable
                ? translate("funeralHome:discover.card.status.requestableA11y")
                : translate("funeralHome:discover.card.status.unavailableA11y")
            }
            style={themed(isRequestable ? $statusBadgeReady : $statusBadgeUnavailable)}
          >
            <Text
              tx={
                isRequestable
                  ? "funeralHome:discover.card.status.requestable"
                  : "funeralHome:discover.card.status.unavailable"
              }
              preset="formHelper"
              style={themed(isRequestable ? $statusTextReady : $statusTextUnavailable)}
            />
          </View>

          {supplier.publicDescription ? (
            <Text
              text={supplier.publicDescription}
              numberOfLines={3}
              style={themed($description)}
            />
          ) : null}

          <View style={themed($metaGrid)}>
            <MetaLine
              label={translate("funeralHome:discover.card.regionsLabel")}
              value={supplier.regionsServed.join(", ")}
            />
            <MetaLine
              label={translate("funeralHome:discover.card.languagesLabel")}
              value={supplier.languages.map((language) => language.toLocaleUpperCase()).join(", ")}
            />
            {supplier.certifications.length > 0 ? (
              <MetaLine
                label={translate("funeralHome:discover.card.certificationsLabel")}
                value={supplier.certifications.join(", ")}
              />
            ) : null}
          </View>

          <View style={themed($detailCta)}>
            <Text
              tx="funeralHome:discover.card.detailAction"
              preset="formLabel"
              style={themed($detailCtaText)}
            />
          </View>
        </View>
      }
    />
  )
}

function MetaLine({ label, value }: { label: string; value: string }) {
  const { themed } = useAppTheme()

  if (!value) return null

  return (
    <View style={themed($metaLine)}>
      <Text text={label} preset="formHelper" style={themed($metaLabel)} />
      <Text text={value} preset="formLabel" numberOfLines={2} style={themed($metaValue)} />
    </View>
  )
}

function getCategoryLabels(categoryIds: string[], categories: CategoryDto[]) {
  const categoryMap = new Map(categories.map((category) => [category.id, category]))

  return categoryIds.flatMap((categoryId) => {
    const category = categoryMap.get(categoryId)
    if (!category) return []

    const primaryName = i18n.language.startsWith("en") ? category.nameEn : category.nameDe
    const fallbackName = i18n.language.startsWith("en") ? category.nameDe : category.nameEn
    const label = primaryName.trim() || fallbackName.trim()

    return label ? [label] : []
  })
}

function isSafeLogoUrl(logoUrl: string | null) {
  return !!logoUrl && /^https?:\/\//i.test(logoUrl)
}

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  elevation: 0,
  padding: spacing.md,
  shadowOpacity: 0,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexDirection: "row",
  gap: spacing.md,
})

const $logoFrame: ThemedStyle<ViewStyle> = ({ colors }) => ({
  alignItems: "center",
  backgroundColor: colors.surfaceWarm,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  height: 56,
  justifyContent: "center",
  overflow: "hidden",
  width: 56,
})

const $logo: ThemedStyle<ImageStyle> = () => ({
  height: 56,
  width: 56,
})

const $logoText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.primary,
  fontSize: 22,
})

const $identity: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $mutedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $statusBadgeReady: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignSelf: "flex-start",
  backgroundColor: colors.successBackground,
  borderColor: colors.success,
  borderRadius: 6,
  borderWidth: 1,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $statusBadgeUnavailable: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignSelf: "flex-start",
  backgroundColor: colors.warningBackground,
  borderColor: colors.warning,
  borderRadius: 6,
  borderWidth: 1,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $statusTextReady: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.success,
})

const $statusTextUnavailable: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.warning,
})

const $description: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $metaGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $metaLine: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xxxs,
})

const $metaLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $metaValue: ThemedStyle<TextStyle> = () => ({
  flexShrink: 1,
})

const $detailCta: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignItems: "center",
  backgroundColor: colors.primary,
  borderRadius: 8,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $detailCtaText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})
