import { TextStyle, View, ViewStyle } from "react-native"
import i18n from "i18next"

import { Card } from "@/components/Card"
import { Text } from "@/components/Text"
import {
  getQuoteRequestStatusDisplay,
  getQuoteResponseStatusDisplay,
  getRequestHistoryEmailDispatchDisplay,
} from "@/domain/requests/requestStatusDisplay"
import { translate } from "@/i18n/translate"
import type { CategoryDto, QuoteRequestListItemDto } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { formatDate, formatDateOnly } from "@/utils/formatDate"

import { StatusBadge } from "../../../requests/components/StatusBadge"

interface QuoteRequestCardProps {
  categories?: CategoryDto[]
  onPress?: () => void
  request: QuoteRequestListItemDto
}

export function QuoteRequestCard({ categories = [], onPress, request }: QuoteRequestCardProps) {
  const { themed } = useAppTheme()
  const responseCount = getResponses(request).length
  const latestResponse = getLatestResponse(request)
  const hasDocuments = [...(request.documents ?? []), ...(request.attachments ?? [])].some(
    (document) => isOpenableUrl(document.url),
  )
  const supplierName = getSupplierName(request)
  const categoryName = getCategoryName(request, categories)

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={translate("funeralHome:quotes.card.openA11y", {
        subject: request.subject,
      })}
      style={themed($card)}
      ContentComponent={
        <View style={themed($content)}>
          <View style={themed($topRow)}>
            <Text text={request.subject} preset="subheading" style={themed($subject)} />
            <StatusBadge display={getQuoteRequestStatusDisplay(request.status)} />
          </View>

          <MetaLine labelTx="funeralHome:quotes.card.supplierLabel" value={supplierName} />
          <MetaLine labelTx="funeralHome:quotes.card.categoryLabel" value={categoryName} />
          <MetaLine
            labelTx="funeralHome:quotes.card.deadlineLabel"
            value={safeFormatDateOnly(request.deadline, "dd. MMM yyyy")}
          />
          <MetaLine
            labelTx={
              request.respondedAt
                ? "funeralHome:quotes.card.respondedLabel"
                : "funeralHome:quotes.card.sentLabel"
            }
            value={safeFormatDate(request.respondedAt ?? request.sentAt ?? request.createdAt)}
          />

          <View style={themed($badgeRow)}>
            <CompactMetric
              label={translate("funeralHome:quotes.card.responsesLabel", {
                count: responseCount,
              })}
            />
            <StatusBadge display={getQuoteResponseStatusDisplay(latestResponse?.status)} />
            <StatusBadge display={getRequestHistoryEmailDispatchDisplay(request.emailDispatch)} />
          </View>

          <Text
            tx={
              hasDocuments
                ? "funeralHome:quotes.card.documentsAvailable"
                : "funeralHome:quotes.card.documentsUnavailable"
            }
            preset="formHelper"
            style={themed($mutedText)}
          />
        </View>
      }
    />
  )
}

function MetaLine({
  labelTx,
  value,
}: {
  labelTx: Parameters<typeof Text>[0]["tx"]
  value: string
}) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($metaLine)}>
      <Text tx={labelTx} preset="formHelper" style={themed($metaLabel)} />
      <Text text={value} style={themed($metaValue)} />
    </View>
  )
}

function CompactMetric({ label }: { label: string }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($metric)}>
      <Text text={label} style={themed($metricText)} />
    </View>
  )
}

function getSupplierName(request: QuoteRequestListItemDto) {
  return (
    request.supplier?.tradingName?.trim() ||
    request.supplier?.legalName?.trim() ||
    translate("funeralHome:quotes.card.supplierFallback")
  )
}

function getCategoryName(request: QuoteRequestListItemDto, categories: CategoryDto[]) {
  const category = request.category ?? categories.find((item) => item.id === request.categoryId)
  if (!category) return translate("funeralHome:quotes.card.categoryFallback")

  return i18n.language.startsWith("en") ? category.nameEn : category.nameDe
}

function getLatestResponse(request: QuoteRequestListItemDto) {
  const responses = getResponses(request)

  return [...responses].sort((left, right) => right.sentAt.localeCompare(left.sentAt))[0]
}

function getResponses(request: QuoteRequestListItemDto) {
  const responses = request.responses?.length
    ? request.responses
    : request.response
      ? [request.response]
      : []

  return responses.filter(Boolean)
}

function safeFormatDate(value: string | null | undefined, format = "dd. MMM yyyy, HH:mm") {
  if (!value) return translate("funeralHome:quotes.card.dateUnavailable")

  try {
    return formatDate(value, format)
  } catch {
    return translate("funeralHome:quotes.card.dateUnavailable")
  }
}

function safeFormatDateOnly(value: string | null | undefined, format = "dd. MMM yyyy") {
  if (!value) return translate("funeralHome:quotes.card.dateUnavailable")

  try {
    return formatDateOnly(value, format)
  } catch {
    return translate("funeralHome:quotes.card.dateUnavailable")
  }
}

function isOpenableUrl(value: string | null | undefined) {
  if (!value || !/^https:\/\//i.test(value.trim())) return false

  try {
    const url = new URL(value.trim())
    return url.protocol === "https:"
  } catch {
    return false
  }
}

const $card: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  borderRadius: 8,
  marginBottom: spacing.sm,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $topRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $subject: ThemedStyle<TextStyle> = () => ({
  flexShrink: 1,
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

const $badgeRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
  marginTop: spacing.xs,
})

const $metric: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignSelf: "flex-start",
  backgroundColor: colors.surfaceWarm,
  borderColor: colors.border,
  borderRadius: 4,
  borderWidth: 1,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xxxs,
})

const $metricText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.textMuted,
  fontFamily: typography.primary.medium,
  fontSize: 12,
  lineHeight: 16,
})

const $mutedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})
