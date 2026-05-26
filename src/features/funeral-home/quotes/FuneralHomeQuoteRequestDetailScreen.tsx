import { TextStyle, View, ViewStyle } from "react-native"
import { router } from "expo-router"
import i18n from "i18next"

import { BackHeader } from "@/components/BackHeader"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import {
  getQuoteRequestStatusDisplay,
  getQuoteResponseStatusDisplay,
  getRequestHistoryEmailDispatchDisplay,
} from "@/domain/requests/requestStatusDisplay"
import type { TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import type { DocumentAssetDto, QuoteRequestListItemDto } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { formatDate, formatDateOnly } from "@/utils/formatDate"
import { openLinkInBrowser } from "@/utils/openLinkInBrowser"

import { useFuneralHomeQuoteRequestsQuery } from "./hooks/useFuneralHomeQuoteRequestsQuery"
import { useQuoteRequestTimelineQuery } from "./hooks/useQuoteRequestTimelineQuery"
import { StatusBadge } from "../../requests/components/StatusBadge"
import { TimelineItem } from "../../requests/components/TimelineItem"

interface FuneralHomeQuoteRequestDetailScreenProps {
  requestId?: string
}

export function FuneralHomeQuoteRequestDetailScreen({
  requestId,
}: FuneralHomeQuoteRequestDetailScreenProps) {
  const { themed } = useAppTheme()
  const normalizedRequestId = requestId?.trim()
  const requestsQuery = useFuneralHomeQuoteRequestsQuery()
  const request =
    normalizedRequestId && !requestsQuery.isError
      ? requestsQuery.data?.find((item) => item.id === normalizedRequestId)
      : undefined
  const timelineQuery = useQuoteRequestTimelineQuery(
    request && !requestsQuery.isFetching ? normalizedRequestId : undefined,
  )

  if (!normalizedRequestId) {
    return (
      <DetailState
        titleTx="funeralHome:quotes.detail.notFoundTitle"
        bodyTx="funeralHome:quotes.detail.notFoundBody"
        actionTx="funeralHome:quotes.detail.backAction"
        onAction={() => router.replace("/funeral-home/quotes")}
      />
    )
  }

  if (requestsQuery.isLoading) {
    return (
      <DetailState
        titleTx="funeralHome:quotes.detail.loadingTitle"
        bodyTx="funeralHome:quotes.detail.loadingBody"
      />
    )
  }

  if (requestsQuery.isError) {
    return (
      <DetailState
        titleTx="funeralHome:quotes.detail.errorTitle"
        bodyTx={requestsQuery.error?.messageKey ?? "api:error.unknown"}
        actionTx={
          requestsQuery.isRefetching
            ? "funeralHome:quotes.detail.retryingAction"
            : "funeralHome:quotes.detail.retryAction"
        }
        actionDisabled={requestsQuery.isRefetching}
        onAction={() => requestsQuery.refetch()}
      />
    )
  }

  if (requestsQuery.isFetching) {
    return (
      <DetailState
        titleTx="funeralHome:quotes.detail.loadingTitle"
        bodyTx="funeralHome:quotes.detail.loadingBody"
      />
    )
  }

  if (!request) {
    return (
      <DetailState
        titleTx="funeralHome:quotes.detail.notFoundTitle"
        bodyTx="funeralHome:quotes.detail.notFoundBody"
        actionTx="funeralHome:quotes.detail.backAction"
        onAction={() => router.replace("/funeral-home/quotes")}
      />
    )
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($content)}
    >
      <View style={themed($header)}>
        <BackHeader fallbackHref="/funeral-home/quotes" />
        <Text text={request.subject} preset="heading" />
        <StatusBadge display={getQuoteRequestStatusDisplay(request.status)} />
      </View>

      <InfoSection titleTx="funeralHome:quotes.detail.sections.request">
        <InfoLine
          labelTx="funeralHome:quotes.detail.supplierLabel"
          value={getSupplierName(request)}
        />
        <InfoLine
          labelTx="funeralHome:quotes.detail.categoryLabel"
          value={getCategoryName(request)}
        />
        <InfoLine
          labelTx="funeralHome:quotes.detail.deadlineLabel"
          value={safeFormatDateOnly(request.deadline, "dd. MMM yyyy")}
        />
        <InfoLine
          labelTx="funeralHome:quotes.detail.createdLabel"
          value={safeFormatDate(request.createdAt)}
        />
        <InfoLine
          labelTx="funeralHome:quotes.detail.sentLabel"
          value={safeFormatDate(request.sentAt)}
        />
        {request.respondedAt ? (
          <InfoLine
            labelTx="funeralHome:quotes.detail.respondedLabel"
            value={safeFormatDate(request.respondedAt)}
          />
        ) : null}
        <Text text={request.message} style={themed($bodyText)} />
        <AttributeSummary attributes={request.attributes} />
      </InfoSection>

      <InfoSection titleTx="funeralHome:quotes.detail.sections.response">
        <ResponseSummary request={request} />
      </InfoSection>

      <InfoSection titleTx="funeralHome:quotes.detail.sections.dispatch">
        <StatusBadge display={getRequestHistoryEmailDispatchDisplay(request.emailDispatch)} />
        <InfoLine
          labelTx="funeralHome:quotes.detail.dispatchTimeLabel"
          value={safeFormatDate(
            request.emailDispatch?.deliveredAt ??
              request.emailDispatch?.sentAt ??
              request.emailDispatch?.lastEventAt,
          )}
        />
      </InfoSection>

      <InfoSection titleTx="funeralHome:quotes.detail.sections.documents">
        <DocumentSummary request={request} />
      </InfoSection>

      <InfoSection titleTx="funeralHome:quotes.detail.sections.timeline">
        {timelineQuery.isLoading ? (
          <Text tx="funeralHome:quotes.timeline.loading" style={themed($mutedText)} />
        ) : timelineQuery.isError ? (
          <View style={themed($inlineState)}>
            <Text tx="funeralHome:quotes.timeline.errorTitle" preset="formLabel" />
            <Text
              tx={timelineQuery.error?.messageKey ?? "api:error.unknown"}
              style={themed($mutedText)}
            />
            <Button
              tx={
                timelineQuery.isRefetching
                  ? "funeralHome:quotes.timeline.retryingAction"
                  : "funeralHome:quotes.timeline.retryAction"
              }
              disabled={timelineQuery.isRefetching}
              onPress={() => timelineQuery.refetch()}
              preset="default"
            />
          </View>
        ) : timelineQuery.data?.length ? (
          <View style={themed($timelineList)}>
            {timelineQuery.data.map((event) => (
              <TimelineItem key={event.id} event={event} />
            ))}
          </View>
        ) : (
          <Text tx="funeralHome:quotes.timeline.empty" style={themed($mutedText)} />
        )}
      </InfoSection>
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
      <BackHeader fallbackHref="/funeral-home/quotes" />
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

function InfoSection({ children, titleTx }: { children: React.ReactNode; titleTx: TxKeyPath }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($section)}>
      <Text tx={titleTx} preset="formLabel" />
      {children}
    </View>
  )
}

function InfoLine({ labelTx, value }: { labelTx: TxKeyPath; value: string }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($infoLine)}>
      <Text tx={labelTx} preset="formHelper" style={themed($mutedText)} />
      <Text text={value} style={themed($infoValue)} />
    </View>
  )
}

function ResponseSummary({ request }: { request: QuoteRequestListItemDto }) {
  const { themed } = useAppTheme()
  const latestResponse = [...getResponses(request)].sort((left, right) =>
    right.sentAt.localeCompare(left.sentAt),
  )[0]

  if (!latestResponse) {
    return <Text tx="funeralHome:quotes.detail.noResponse" style={themed($mutedText)} />
  }

  return (
    <View style={themed($stack)}>
      <StatusBadge display={getQuoteResponseStatusDisplay(latestResponse.status)} />
      <InfoLine
        labelTx="funeralHome:quotes.detail.responseSentLabel"
        value={safeFormatDate(latestResponse.sentAt)}
      />
      <InfoLine
        labelTx="funeralHome:quotes.detail.responsePriceLabel"
        value={formatPrice(latestResponse.priceAmount, latestResponse.priceCurrency)}
      />
      <Text text={latestResponse.message} style={themed($bodyText)} />
    </View>
  )
}

function DocumentSummary({ request }: { request: QuoteRequestListItemDto }) {
  const { themed } = useAppTheme()
  const documents = [...(request.documents ?? []), ...(request.attachments ?? [])]
    .map((document) => ({ document, url: resolveDocumentUrl(document.url) }))
    .filter((item): item is { document: DocumentAssetDto; url: string } => !!item.url)

  if (documents.length === 0) {
    return <Text tx="funeralHome:quotes.detail.documentsUnavailable" style={themed($mutedText)} />
  }

  return (
    <View style={themed($stack)}>
      {documents.map(({ document, url }) => (
        <Button
          key={document.id}
          text={getDocumentLabel(document)}
          preset="default"
          onPress={() => openLinkInBrowser(url)}
        />
      ))}
    </View>
  )
}

function AttributeSummary({ attributes }: { attributes: QuoteRequestListItemDto["attributes"] }) {
  const { themed } = useAppTheme()
  const entries = Object.entries(attributes).filter(([, value]) => isPrimitiveValue(value))

  if (entries.length === 0) {
    return null
  }

  return (
    <View style={themed($stack)}>
      <Text
        tx="funeralHome:quotes.detail.attributesLabel"
        preset="formHelper"
        style={themed($mutedText)}
      />
      {entries.slice(0, 6).map(([key, value]) => (
        <Text
          key={key}
          text={`${getAttributeLabel(key)}: ${String(value)}`}
          style={themed($bodyText)}
        />
      ))}
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

function getCategoryName(request: QuoteRequestListItemDto) {
  return request.category
    ? i18n.language.startsWith("en")
      ? request.category.nameEn
      : request.category.nameDe
    : translate("funeralHome:quotes.card.categoryFallback")
}

function getDocumentLabel(document: DocumentAssetDto) {
  return document.fileName.trim() || translate("funeralHome:quotes.detail.openDocumentAction")
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

function getResponses(request: QuoteRequestListItemDto) {
  const responses = request.responses?.length
    ? request.responses
    : request.response
      ? [request.response]
      : []

  return responses.filter(Boolean)
}

function getAttributeLabel(key: string) {
  if (key === "quantity") return translate("funeralHome:rfq.fields.quantityLabel")

  return translate("funeralHome:rfq.dynamic.unnamedField")
}

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      currency,
      style: "currency",
    }).format(amount)
  } catch {
    return `${new Intl.NumberFormat(undefined).format(amount)} ${currency}`
  }
}

function resolveDocumentUrl(value: string | null | undefined) {
  if (!value || !/^https:\/\//i.test(value.trim())) return null

  try {
    const url = new URL(value.trim())
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function isPrimitiveValue(value: unknown) {
  return ["boolean", "number", "string"].includes(typeof value)
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
  gap: spacing.md,
})

const $stateContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  gap: spacing.sm,
  paddingHorizontal: spacing.lg,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $section: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.sm,
  padding: spacing.md,
})

const $infoLine: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xxxs,
})

const $infoValue: ThemedStyle<TextStyle> = () => ({
  flexShrink: 1,
})

const $bodyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $mutedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $stack: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $timelineList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $inlineState: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})
