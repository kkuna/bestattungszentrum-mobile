import { QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react-native"

import { timelineApi } from "@/services/api/timelineApi"
import type { RequestTimelineEventDto } from "@/services/api/types"
import { createQueryClient } from "@/services/query/queryClient"

import { useQuoteRequestTimelineQuery } from "./useQuoteRequestTimelineQuery"

jest.mock("@/services/api/timelineApi", () => ({
  timelineApi: {
    getQuoteRequestTimeline: jest.fn(),
  },
}))

const event: RequestTimelineEventDto = {
  id: "timeline-1",
  type: "REQUEST_SENT",
  title: "Anfrage gesendet",
  description: "Die Anfrage wurde gesendet.",
  occurredAt: "2026-05-26T08:00:00.000+02:00",
  status: "DONE",
  actorRole: "FUNERAL_HOME_USER",
  relatedEntityType: "QUOTE_REQUEST",
  relatedEntityId: "request-123",
}

function wrapper({ children }: { children: React.ReactNode }) {
  const client = createQueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
      },
    },
  })

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe("useQuoteRequestTimelineQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("loads timeline events with normalized request id", async () => {
    jest.mocked(timelineApi.getQuoteRequestTimeline).mockResolvedValue({
      ok: true,
      data: [event],
    })

    const { result } = renderHook(() => useQuoteRequestTimelineQuery(" request-123 "), {
      wrapper,
    })

    await waitFor(() => expect(result.current.data).toEqual([event]))
    expect(timelineApi.getQuoteRequestTimeline).toHaveBeenCalledWith("request-123")
  })

  test("does not call the API for a missing request id", () => {
    const { result } = renderHook(() => useQuoteRequestTimelineQuery("   "), { wrapper })

    expect(result.current.fetchStatus).toBe("idle")
    expect(timelineApi.getQuoteRequestTimeline).not.toHaveBeenCalled()
  })

  test("surfaces normalized timeline failures", async () => {
    jest.mocked(timelineApi.getQuoteRequestTimeline).mockResolvedValue({
      ok: false,
      problem: "timeout",
      messageKey: "api:error.timeout",
    })

    const { result } = renderHook(() => useQuoteRequestTimelineQuery("request-123"), {
      wrapper,
    })

    await waitFor(() => expect(result.current.error?.messageKey).toBe("api:error.timeout"))
  })
})
