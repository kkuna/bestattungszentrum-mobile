import { useState } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { router } from "expo-router"
import i18n from "i18next"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { normalizeAccountAccess } from "@/domain/account/accountAccess"
import type { TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import type { AccountStatusDto, CategoryDto, SupplierDto } from "@/services/api/types"
import { useSession } from "@/services/session"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { useSupplierDetailQuery } from "./hooks/useSupplierDetailQuery"
import { useCategoriesQuery } from "../hooks/useCategoriesQuery"

interface SupplierDetailScreenProps {
  supplierId?: string
  categoryId?: string
}

export function SupplierDetailScreen({ categoryId, supplierId }: SupplierDetailScreenProps) {
  const { themed } = useAppTheme()
  const { session } = useSession()
  const supplierQuery = useSupplierDetailQuery(supplierId)
  const categoriesQuery = useCategoriesQuery()

  if (supplierQuery.isLoading) {
    return (
      <DetailState
        titleTx="funeralHome:discover.detail.loadingTitle"
        bodyTx="funeralHome:discover.detail.loadingBody"
      />
    )
  }

  if (supplierQuery.isMissingSupplierId || supplierQuery.error?.problem === "not-found") {
    return (
      <DetailState
        titleTx="funeralHome:discover.detail.notFoundTitle"
        bodyTx="funeralHome:discover.detail.notFoundBody"
        actionTx="funeralHome:discover.detail.backToDiscoverAction"
        onAction={() => router.replace("/funeral-home/discover")}
      />
    )
  }

  if (supplierQuery.isError) {
    return (
      <DetailState
        titleTx="funeralHome:discover.detail.errorTitle"
        bodyTx={supplierQuery.error?.messageKey ?? "api:error.unknown"}
        actionTx={
          supplierQuery.isRefetching
            ? "funeralHome:discover.detail.retryingAction"
            : "funeralHome:discover.detail.retryAction"
        }
        actionDisabled={supplierQuery.isRefetching}
        onAction={() => supplierQuery.refetch()}
      />
    )
  }

  const supplier = supplierQuery.data
  if (!supplier) {
    return (
      <DetailState
        titleTx="funeralHome:discover.detail.notFoundTitle"
        bodyTx="funeralHome:discover.detail.notFoundBody"
        actionTx="funeralHome:discover.detail.backToDiscoverAction"
        onAction={() => router.replace("/funeral-home/discover")}
      />
    )
  }

  const loadedSupplier: SupplierDto = supplier
  const accountAccess =
    session.status === "authenticated" ? normalizeAccountAccess(session.session) : null
  const categories = categoriesQuery.data ?? []
  const routeCategoryId = categoryId?.trim()
  const resolvedCategoryId =
    routeCategoryId && loadedSupplier.categoryIds.includes(routeCategoryId)
      ? routeCategoryId
      : loadedSupplier.categoryIds[0]
  const categoryLabels = getCategoryLabels(loadedSupplier, categories)
  const isSupplierRequestable = loadedSupplier.accountStatus === "ACTIVE"
  const isAccountRequestable = accountAccess?.status === "active"
  const canRequest = isSupplierRequestable && isAccountRequestable

  function startRfq() {
    if (!canRequest) return

    router.push({
      pathname: "/funeral-home/quotes",
      params: {
        entry: "new",
        supplierId: loadedSupplier.id,
        ...(resolvedCategoryId ? { categoryId: resolvedCategoryId } : {}),
      },
    })
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($content)}
    >
      <SupplierHero supplier={loadedSupplier} categoryLabels={categoryLabels} />

      <View style={themed($section)}>
        <Text tx="funeralHome:discover.detail.sections.trust" preset="formLabel" />
        <StatusPill status={loadedSupplier.accountStatus} />
        <InfoLine
          labelTx="funeralHome:discover.detail.legalNameLabel"
          value={loadedSupplier.legalName}
        />
        <InfoLine
          labelTx="funeralHome:discover.detail.addressLabel"
          value={formatAddress(loadedSupplier)}
        />
      </View>

      <View style={themed($section)}>
        <Text tx="funeralHome:discover.detail.sections.coverage" preset="formLabel" />
        <BadgeInfoLine
          labelTx="funeralHome:discover.detail.categoriesLabel"
          labels={categoryLabels}
        />
        <InfoLine
          labelTx="funeralHome:discover.detail.regionsLabel"
          value={loadedSupplier.regionsServed.join(", ")}
          fallbackTx="funeralHome:discover.detail.regionsFallback"
        />
        <InfoLine
          labelTx="funeralHome:discover.detail.languagesLabel"
          value={loadedSupplier.languages
            .map((language) => language.toLocaleUpperCase())
            .join(", ")}
          fallbackTx="funeralHome:discover.detail.languagesFallback"
        />
        <InfoLine
          labelTx="funeralHome:discover.detail.certificationsLabel"
          value={loadedSupplier.certifications.join(", ")}
          fallbackTx="funeralHome:discover.detail.certificationsFallback"
        />
      </View>

      <View style={themed($section)}>
        <Text tx="funeralHome:discover.detail.sections.description" preset="formLabel" />
        <Text
          text={
            loadedSupplier.publicDescription?.trim() ||
            translate("funeralHome:discover.detail.descriptionFallback")
          }
          style={themed($mutedText)}
        />
      </View>

      <View style={themed($section)}>
        <Text tx="funeralHome:discover.detail.sections.contact" preset="formLabel" />
        <InfoLine
          labelTx="funeralHome:discover.detail.phoneLabel"
          value={loadedSupplier.phone}
          fallbackTx="funeralHome:discover.detail.phoneFallback"
        />
        <InfoLine
          labelTx="funeralHome:discover.detail.emailLabel"
          value={loadedSupplier.contactEmail}
        />
      </View>

      {!canRequest ? (
        <View style={themed($blockedPanel)}>
          <Text
            tx={
              !isSupplierRequestable
                ? "funeralHome:discover.detail.blockedSupplierTitle"
                : "funeralHome:discover.detail.blockedAccountTitle"
            }
            preset="formLabel"
          />
          <Text
            tx={
              !isSupplierRequestable
                ? "funeralHome:discover.detail.blockedSupplierBody"
                : "funeralHome:discover.detail.blockedAccountBody"
            }
            style={themed($mutedText)}
          />
        </View>
      ) : null}

      <View style={themed($actions)}>
        <Button
          tx={
            canRequest
              ? "funeralHome:discover.detail.requestAction"
              : "funeralHome:discover.detail.requestBlockedAction"
          }
          accessibilityLabel={translate("funeralHome:discover.detail.requestA11y")}
          onPress={startRfq}
          disabled={!canRequest}
          preset={canRequest ? "filled" : "default"}
          disabledStyle={themed($disabledButton)}
          disabledTextStyle={themed($disabledButtonText)}
        />
        <Button
          tx="funeralHome:discover.detail.backToDiscoverAction"
          onPress={() => router.replace("/funeral-home/discover")}
          preset="default"
        />
      </View>
    </Screen>
  )
}

function DetailState({
  actionDisabled,
  actionTx,
  bodyTx,
  onAction,
  titleTx,
}: {
  actionDisabled?: boolean
  actionTx?: TxKeyPath
  bodyTx: TxKeyPath
  onAction?: () => void
  titleTx: TxKeyPath
}) {
  const { themed } = useAppTheme()

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($stateContent)}
    >
      <View style={themed($section)}>
        <Text tx={titleTx} preset="subheading" />
        <Text tx={bodyTx} style={themed($mutedText)} />
        {actionTx ? (
          <Button tx={actionTx} onPress={onAction} disabled={actionDisabled} preset="filled" />
        ) : null}
      </View>
    </Screen>
  )
}

function SupplierHero({
  categoryLabels,
  supplier,
}: {
  categoryLabels: string[]
  supplier: SupplierDto
}) {
  const { themed } = useAppTheme()
  const [logoFailed, setLogoFailed] = useState(false)
  const supplierName = getSupplierName(supplier)
  const fallbackMark = supplierName.charAt(0).toLocaleUpperCase()

  return (
    <View style={themed($hero)}>
      <View style={themed($logoFrame)}>
        {isSafeLogoUrl(supplier.logoUrl) && !logoFailed ? (
          <Image
            source={{ uri: supplier.logoUrl! }}
            onError={() => setLogoFailed(true)}
            style={themed($logo)}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Text text={fallbackMark} preset="heading" style={themed($logoText)} />
        )}
      </View>
      <View style={themed($heroText)}>
        <Text text={supplierName} preset="heading" />
        <CategoryBadgeRow labels={categoryLabels} />
      </View>
    </View>
  )
}

function StatusPill({ status }: { status: AccountStatusDto }) {
  const { themed } = useAppTheme()
  const active = status === "ACTIVE"

  return (
    <View style={themed(active ? $statusReady : $statusBlocked)}>
      <Text
        tx={`funeralHome:discover.detail.accountStatus.${status}` as TxKeyPath}
        preset="formHelper"
        style={themed(active ? $statusReadyText : $statusBlockedText)}
      />
    </View>
  )
}

function BadgeInfoLine({ labelTx, labels }: { labelTx: TxKeyPath; labels: string[] }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($infoLine)}>
      <Text tx={labelTx} preset="formHelper" style={themed($label)} />
      <CategoryBadgeRow labels={labels} />
    </View>
  )
}

function CategoryBadgeRow({ labels }: { labels: string[] }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($badgeRow)}>
      {labels.map((label) => (
        <View key={label} style={themed($categoryBadge)}>
          <Text text={label} preset="formHelper" style={themed($categoryBadgeText)} />
        </View>
      ))}
    </View>
  )
}

function InfoLine({
  fallbackTx,
  labelTx,
  value,
}: {
  fallbackTx?: TxKeyPath
  labelTx: TxKeyPath
  value?: string | null
}) {
  const { themed } = useAppTheme()
  const resolvedValue = value?.trim()

  return (
    <View style={themed($infoLine)}>
      <Text tx={labelTx} preset="formHelper" style={themed($label)} />
      <Text
        text={resolvedValue || (fallbackTx ? translate(fallbackTx) : "")}
        preset="formLabel"
        style={themed($infoValue)}
      />
    </View>
  )
}

function getSupplierName(supplier: SupplierDto) {
  return supplier.tradingName.trim() || supplier.legalName
}

function getCategoryLabels(supplier: SupplierDto, categories: CategoryDto[]) {
  const categoryMap = new Map(categories.map((category) => [category.id, category]))
  const labels = supplier.categoryIds.flatMap((categoryId) => {
    const category = categoryMap.get(categoryId)
    if (!category) return []

    const primaryName = i18n.language.startsWith("en") ? category.nameEn : category.nameDe
    const fallbackName = i18n.language.startsWith("en") ? category.nameDe : category.nameEn
    const label = primaryName.trim() || fallbackName.trim()

    return label ? [label] : []
  })

  return labels.length > 0 ? labels : [translate("funeralHome:discover.detail.categoryFallback")]
}

function formatAddress(supplier: SupplierDto) {
  const { address } = supplier

  return [address.street, `${address.zip} ${address.city}`.trim(), address.country]
    .filter(Boolean)
    .join(", ")
}

function isSafeLogoUrl(logoUrl: string | null) {
  return !!logoUrl && /^https?:\/\//i.test(logoUrl)
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
  padding: spacing.md,
  paddingBottom: spacing.xl,
})

const $stateContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  justifyContent: "center",
  padding: spacing.lg,
})

const $hero: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.md,
  padding: spacing.md,
})

const $logoFrame: ThemedStyle<ViewStyle> = ({ colors }) => ({
  alignItems: "center",
  alignSelf: "flex-start",
  backgroundColor: colors.surfaceWarm,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  height: 72,
  justifyContent: "center",
  overflow: "hidden",
  width: 72,
})

const $logo: ThemedStyle<ImageStyle> = () => ({
  height: 72,
  width: 72,
})

const $logoText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.primary,
})

const $heroText: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $badgeRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
})

const $categoryBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignSelf: "flex-start",
  backgroundColor: colors.palette.neutral100,
  borderColor: colors.border,
  borderRadius: 6,
  borderWidth: 1,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
})

const $categoryBadgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $section: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.sm,
  padding: spacing.md,
})

const $mutedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $infoLine: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xxxs,
})

const $label: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $infoValue: ThemedStyle<TextStyle> = () => ({
  flexShrink: 1,
})

const $statusReady: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignSelf: "flex-start",
  backgroundColor: colors.successBackground,
  borderColor: colors.success,
  borderRadius: 6,
  borderWidth: 1,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $statusBlocked: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignSelf: "flex-start",
  backgroundColor: colors.warningBackground,
  borderColor: colors.warning,
  borderRadius: 6,
  borderWidth: 1,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $statusReadyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.success,
})

const $statusBlockedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.warning,
})

const $blockedPanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.warningBackground,
  borderColor: colors.warning,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.xs,
  padding: spacing.md,
})

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $disabledButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surfaceWarm,
  borderColor: colors.border,
})

const $disabledButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})
