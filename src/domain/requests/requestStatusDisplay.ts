import type { TxKeyPath } from "@/i18n"
import type {
  EmailDispatchDto,
  QuoteRequestStatusDto,
  QuoteResponseStatusDto,
  RequestTimelineEventDto,
} from "@/services/api/types"

export type RequestDisplayTone = "danger" | "info" | "neutral" | "success" | "warning"

export type RequestStatusDisplay = {
  accessibilityLabelKey: TxKeyPath
  labelKey: TxKeyPath
  tone: RequestDisplayTone
}

const quoteRequestStatusDisplay = {
  DRAFT: statusDisplay("funeralHome:quotes.status.request.DRAFT", "neutral"),
  SENT: statusDisplay("funeralHome:quotes.status.request.SENT", "info"),
  RESPONDED: statusDisplay("funeralHome:quotes.status.request.RESPONDED", "success"),
  ACCEPTED: statusDisplay("funeralHome:quotes.status.request.ACCEPTED", "success"),
  REJECTED: statusDisplay("funeralHome:quotes.status.request.REJECTED", "danger"),
  EXPIRED: statusDisplay("funeralHome:quotes.status.request.EXPIRED", "warning"),
  CANCELLED: statusDisplay("funeralHome:quotes.status.request.CANCELLED", "neutral"),
} as const satisfies Record<QuoteRequestStatusDto, RequestStatusDisplay>

const quoteResponseStatusDisplay = {
  SENT: statusDisplay("funeralHome:quotes.status.response.SENT", "info"),
  ACCEPTED: statusDisplay("funeralHome:quotes.status.response.ACCEPTED", "success"),
  REJECTED: statusDisplay("funeralHome:quotes.status.response.REJECTED", "danger"),
} as const satisfies Record<QuoteResponseStatusDto, RequestStatusDisplay>

const unavailableResponseDisplay = statusDisplay(
  "funeralHome:quotes.status.response.unavailable",
  "neutral",
)

const emailDispatchStatusDisplay = {
  QUEUED: statusDisplay("funeralHome:quotes.status.dispatch.QUEUED", "warning"),
  SENT: statusDisplay("funeralHome:quotes.status.dispatch.SENT", "success"),
  DELIVERED: statusDisplay("funeralHome:quotes.status.dispatch.DELIVERED", "success"),
  BOUNCED: statusDisplay("funeralHome:quotes.status.dispatch.BOUNCED", "danger"),
  COMPLAINED: statusDisplay("funeralHome:quotes.status.dispatch.COMPLAINED", "danger"),
} as const satisfies Record<EmailDispatchDto["status"], RequestStatusDisplay>

const unavailableDispatchDisplay = statusDisplay(
  "funeralHome:quotes.status.dispatch.unavailable",
  "neutral",
)

const timelineStatusDisplay = {
  DONE: statusDisplay("funeralHome:quotes.status.timeline.DONE", "success"),
  PENDING: statusDisplay("funeralHome:quotes.status.timeline.PENDING", "warning"),
  FAILED: statusDisplay("funeralHome:quotes.status.timeline.FAILED", "danger"),
} as const satisfies Record<RequestTimelineEventDto["status"], RequestStatusDisplay>

export function getQuoteRequestStatusDisplay(status: QuoteRequestStatusDto): RequestStatusDisplay {
  return quoteRequestStatusDisplay[status]
}

export function getQuoteResponseStatusDisplay(
  status: QuoteResponseStatusDto | null | undefined,
): RequestStatusDisplay {
  return status ? quoteResponseStatusDisplay[status] : unavailableResponseDisplay
}

export function getRequestHistoryEmailDispatchDisplay(
  dispatch: Pick<EmailDispatchDto, "status"> | null | undefined,
): RequestStatusDisplay {
  return dispatch ? emailDispatchStatusDisplay[dispatch.status] : unavailableDispatchDisplay
}

export function getTimelineEventStatusDisplay(
  event: Pick<RequestTimelineEventDto, "status">,
): RequestStatusDisplay {
  return timelineStatusDisplay[event.status]
}

function statusDisplay(labelKey: TxKeyPath, tone: RequestDisplayTone): RequestStatusDisplay {
  return {
    accessibilityLabelKey: "funeralHome:quotes.status.badgeA11y",
    labelKey,
    tone,
  }
}
