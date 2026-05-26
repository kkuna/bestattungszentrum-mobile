import { QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react-native"

import { quoteRequestsApi } from "@/services/api/quoteRequestsApi"
import type { QuoteRequestListItemDto } from "@/services/api/types"
import { createQueryClient } from "@/services/query/queryClient"

import { useFuneralHomeQuoteRequestsQuery } from "./useFuneralHomeQuoteRequestsQuery"

jest.mock("@/services/api/quoteRequestsApi", () => ({
  quoteRequestsApi: {
    listFuneralHomeRequests: jest.fn(),
  },
}))

const request: QuoteRequestListItemDto = {
  id: "request-123",
  funeralHomeId: "fh-1",
  supplierId: "supplier-1",
  categoryId: "cat-flowers",
  subject: "Trauerfloristik",
  message: "Bitte ein Angebot vorbereiten.",
  deadline: "2026-06-10",
  attributes: {},
  attachments: [],
  documents: [],
  status: "SENT",
  createdAt: "2026-05-26T08:00:00.000+02:00",
  sentAt: "2026-05-26T08:00:00.000+02:00",
  respondedAt: null,
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

describe("useFuneralHomeQuoteRequestsQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("loads outgoing funeral-home requests through the centralized API", async () => {
    jest.mocked(quoteRequestsApi.listFuneralHomeRequests).mockResolvedValue({
      ok: true,
      data: [request],
    })

    const { result } = renderHook(() => useFuneralHomeQuoteRequestsQuery(), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual([request]))
    expect(quoteRequestsApi.listFuneralHomeRequests).toHaveBeenCalledTimes(1)
  })

  test("surfaces normalized API failures", async () => {
    jest.mocked(quoteRequestsApi.listFuneralHomeRequests).mockResolvedValue({
      ok: false,
      problem: "network",
      messageKey: "api:error.network",
    })

    const { result } = renderHook(() => useFuneralHomeQuoteRequestsQuery(), { wrapper })

    await waitFor(() => expect(result.current.error?.messageKey).toBe("api:error.network"))
  })
})
