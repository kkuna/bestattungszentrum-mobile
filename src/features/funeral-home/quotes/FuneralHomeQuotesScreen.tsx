import { TextStyle, View, ViewStyle } from "react-native"
import { router } from "expo-router"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { TxKeyPath } from "@/i18n"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { QuoteRequestCard } from "./components/QuoteRequestCard"
import { useFuneralHomeQuoteRequestsQuery } from "./hooks/useFuneralHomeQuoteRequestsQuery"
import { useCategoriesQuery } from "../hooks/useCategoriesQuery"

export function FuneralHomeQuotesScreen() {
  const { themed } = useAppTheme()
  const requestsQuery = useFuneralHomeQuoteRequestsQuery()
  const categoriesQuery = useCategoriesQuery()
  const requests = requestsQuery.data ?? []

  function openDiscover() {
    router.push("/funeral-home/discover")
  }

  function openRequest(requestId: string) {
    router.push({
      pathname: "/funeral-home/quotes/[requestId]",
      params: { requestId },
    })
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($content)}
    >
      <View style={themed($header)}>
        <Text tx="funeralHome:quotes.eyebrow" preset="formHelper" style={themed($eyebrow)} />
        <Text tx="funeralHome:quotes.title" preset="heading" />
        <Text tx="funeralHome:quotes.body" style={themed($mutedText)} />
      </View>

      {requestsQuery.isLoading ? (
        <LoadingState />
      ) : requestsQuery.isError ? (
        <StatePanel
          titleTx="funeralHome:quotes.states.errorTitle"
          bodyTx={requestsQuery.error?.messageKey ?? "api:error.unknown"}
          actionTx={
            requestsQuery.isRefetching
              ? "funeralHome:quotes.states.retryingAction"
              : "funeralHome:quotes.states.retryAction"
          }
          actionDisabled={requestsQuery.isRefetching}
          onAction={() => requestsQuery.refetch()}
        />
      ) : requests.length === 0 ? (
        <StatePanel
          titleTx="funeralHome:quotes.states.emptyTitle"
          bodyTx="funeralHome:quotes.states.emptyBody"
          actionTx="funeralHome:quotes.states.emptyAction"
          onAction={openDiscover}
        />
      ) : (
        <View style={themed($list)}>
          <View style={themed($listHeader)}>
            <Text
              tx="funeralHome:quotes.list.countLabel"
              txOptions={{ count: requests.length }}
              preset="formLabel"
            />
            <Button
              tx="funeralHome:quotes.list.discoverAction"
              preset="default"
              onPress={openDiscover}
              style={themed($compactButton)}
              textStyle={themed($compactButtonText)}
            />
          </View>

          {requests.map((request) => (
            <QuoteRequestCard
              key={request.id}
              categories={categoriesQuery.data}
              request={request}
              onPress={() => openRequest(request.id)}
            />
          ))}
        </View>
      )}
    </Screen>
  )
}

function LoadingState() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($list)}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={themed($loadingCard)}
        >
          <Text tx="funeralHome:quotes.states.loadingCard" style={themed($loadingText)} />
          <View style={themed($loadingLine)} />
          <View style={themed($loadingLineShort)} />
        </View>
      ))}
    </View>
  )
}

function StatePanel({
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
    <View style={themed($statePanel)}>
      <Text tx={titleTx} preset="subheading" />
      <Text tx={bodyTx} style={themed($mutedText)} />
      {actionTx ? (
        <Button tx={actionTx} onPress={onAction} disabled={actionDisabled} preset="filled" />
      ) : null}
    </View>
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
  gap: spacing.lg,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $eyebrow: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.primary,
  fontFamily: typography.primary.medium,
})

const $mutedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $list: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $listHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $compactButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignSelf: "flex-start",
  minHeight: 44,
  paddingHorizontal: spacing.md,
})

const $compactButtonText: ThemedStyle<TextStyle> = () => ({
  fontSize: 14,
  lineHeight: 18,
})

const $statePanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.sm,
  padding: spacing.md,
})

const $loadingCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.sm,
  minHeight: 132,
  padding: spacing.md,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})

const $loadingLine: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surfaceWarm,
  borderRadius: 4,
  height: 14,
  width: "88%",
})

const $loadingLineShort: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surfaceWarm,
  borderRadius: 4,
  height: 14,
  width: "52%",
})
