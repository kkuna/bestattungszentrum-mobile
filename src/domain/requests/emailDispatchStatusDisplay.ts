import type { TxKeyPath } from "@/i18n"
import type { EmailDispatchDto } from "@/services/api/types"

export type DispatchStatusTone = "danger" | "neutral" | "success" | "warning"

export type EmailDispatchStatusDisplay = {
  accessibilityLabelKey: TxKeyPath
  labelKey: TxKeyPath
  tone: DispatchStatusTone
}

const unavailableDisplay = {
  accessibilityLabelKey: "funeralHome:rfq.receipt.dispatch.unavailableA11y",
  labelKey: "funeralHome:rfq.receipt.dispatch.unavailable",
  tone: "neutral",
} as const satisfies EmailDispatchStatusDisplay

const displayByStatus = {
  QUEUED: {
    accessibilityLabelKey: "funeralHome:rfq.receipt.dispatch.queuedA11y",
    labelKey: "funeralHome:rfq.receipt.dispatch.queued",
    tone: "warning",
  },
  SENT: {
    accessibilityLabelKey: "funeralHome:rfq.receipt.dispatch.sentA11y",
    labelKey: "funeralHome:rfq.receipt.dispatch.sent",
    tone: "success",
  },
  DELIVERED: {
    accessibilityLabelKey: "funeralHome:rfq.receipt.dispatch.sentA11y",
    labelKey: "funeralHome:rfq.receipt.dispatch.sent",
    tone: "success",
  },
  BOUNCED: {
    accessibilityLabelKey: "funeralHome:rfq.receipt.dispatch.failedA11y",
    labelKey: "funeralHome:rfq.receipt.dispatch.failed",
    tone: "danger",
  },
  COMPLAINED: {
    accessibilityLabelKey: "funeralHome:rfq.receipt.dispatch.failedA11y",
    labelKey: "funeralHome:rfq.receipt.dispatch.failed",
    tone: "danger",
  },
} as const satisfies Record<EmailDispatchDto["status"], EmailDispatchStatusDisplay>

export function getEmailDispatchStatusDisplay(
  dispatch: Pick<EmailDispatchDto, "status"> | null | undefined,
): EmailDispatchStatusDisplay {
  if (!dispatch) return unavailableDisplay

  return displayByStatus[dispatch.status] ?? unavailableDisplay
}
