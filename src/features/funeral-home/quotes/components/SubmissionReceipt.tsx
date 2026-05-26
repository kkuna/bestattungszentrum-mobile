import { TextStyle, View, ViewStyle } from "react-native"
import i18n from "i18next"

import { Button } from "@/components/Button"
import { Text } from "@/components/Text"
import { getEmailDispatchStatusDisplay } from "@/domain/requests/emailDispatchStatusDisplay"
import { translate } from "@/i18n/translate"
import type { QuoteRequestDto } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type SubmissionReceiptProps = {
  onStartAnotherSearch: () => void
  onViewRequests: () => void
  request: QuoteRequestDto
}

export function SubmissionReceipt({
  onStartAnotherSearch,
  onViewRequests,
  request,
}: SubmissionReceiptProps) {
  const { themed } = useAppTheme()
  const dispatchDisplay = getEmailDispatchStatusDisplay(request.emailDispatch)

  return (
    <View style={themed($container)}>
      <View style={themed($header)}>
        <Text tx="funeralHome:rfq.receipt.title" preset="subheading" />
        <Text tx="funeralHome:rfq.receipt.body" style={themed($mutedText)} />
      </View>

      <View
        accessibilityLabel={translate("funeralHome:rfq.receipt.savedStatusA11y")}
        style={themed($savedPanel)}
      >
        <Text tx="funeralHome:rfq.receipt.savedStatus" preset="formLabel" />
        <ReceiptRow
          label={translate("funeralHome:rfq.receipt.referenceLabel")}
          value={request.id}
        />
        <ReceiptRow
          label={translate("funeralHome:rfq.receipt.timestampLabel")}
          value={formatReceiptTimestamp(request.createdAt)}
        />
      </View>

      <View
        accessibilityLabel={translate(dispatchDisplay.accessibilityLabelKey)}
        style={themed($dispatchPanel[dispatchDisplay.tone])}
      >
        <Text tx="funeralHome:rfq.receipt.dispatch.title" preset="formLabel" />
        <Text tx={dispatchDisplay.labelKey} style={themed($mutedText)} />
      </View>

      <View style={themed($section)}>
        <Text tx="funeralHome:rfq.receipt.nextActionsTitle" preset="formLabel" />
        <View style={themed($actions)}>
          <Button
            accessibilityLabel={translate("funeralHome:rfq.receipt.actions.viewRequestsA11y")}
            onPress={onViewRequests}
            preset="filled"
            tx="funeralHome:rfq.receipt.actions.viewRequests"
          />
          <Button
            accessibilityLabel={translate("funeralHome:rfq.receipt.actions.startSearchA11y")}
            onPress={onStartAnotherSearch}
            tx="funeralHome:rfq.receipt.actions.startSearch"
          />
        </View>
      </View>
    </View>
  )
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($row)}>
      <Text text={label} preset="formHelper" style={themed($mutedText)} />
      <Text text={value} preset="formLabel" />
    </View>
  )
}

export function formatReceiptTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString(i18n.language || undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.md,
  padding: spacing.md,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $savedPanel: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.successBackground,
  borderRadius: 8,
  gap: spacing.sm,
  padding: spacing.sm,
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xxxs,
})

const $dispatchPanel: Record<string, ThemedStyle<ViewStyle>> = {
  danger: ({ colors, spacing }) => ({
    backgroundColor: colors.dangerBackground,
    borderRadius: 8,
    gap: spacing.xs,
    padding: spacing.sm,
  }),
  neutral: ({ colors, spacing }) => ({
    backgroundColor: colors.surfaceWarm,
    borderRadius: 8,
    gap: spacing.xs,
    padding: spacing.sm,
  }),
  success: ({ colors, spacing }) => ({
    backgroundColor: colors.successBackground,
    borderRadius: 8,
    gap: spacing.xs,
    padding: spacing.sm,
  }),
  warning: ({ colors, spacing }) => ({
    backgroundColor: colors.warningBackground,
    borderRadius: 8,
    gap: spacing.xs,
    padding: spacing.sm,
  }),
}

const $mutedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textMuted,
})
