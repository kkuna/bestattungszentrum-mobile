import { fireEvent, render } from "@testing-library/react-native"
import i18n from "i18next"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import type {
  ApiFailure,
  CategoryDto,
  QuoteRequestListItemDto,
  RequestTimelineEventDto,
} from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"
import { loadDateFnsLocale } from "@/utils/formatDate"
import { openLinkInBrowser } from "@/utils/openLinkInBrowser"

import { FuneralHomeQuoteRequestDetailScreen } from "./FuneralHomeQuoteRequestDetailScreen"
import { useFuneralHomeQuoteRequestsQuery } from "./hooks/useFuneralHomeQuoteRequestsQuery"
import { useQuoteRequestTimelineQuery } from "./hooks/useQuoteRequestTimelineQuery"

const mockRouterBack = jest.fn()
const mockRouterCanGoBack = jest.fn()
const mockRouterReplace = jest.fn()
const mockRequestsRefetch = jest.fn()
const mockTimelineRefetch = jest.fn()

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useScrollToTop: jest.fn(),
}))

jest.mock("react-native-keyboard-controller", () => {
  const { ScrollView } = require("react-native")

  return {
    KeyboardAwareScrollView: ScrollView,
  }
})

jest.mock("react-native-edge-to-edge", () => ({
  SystemBars: () => null,
}))

jest.mock("react-native-safe-area-context", () =>
  Object.assign({}, jest.requireActual("react-native-safe-area-context"), {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
  }),
)

jest.mock("expo-router", () => ({
  router: {
    back: (...args: unknown[]) => mockRouterBack(...args),
    canGoBack: (...args: unknown[]) => mockRouterCanGoBack(...args),
    replace: (...args: unknown[]) => mockRouterReplace(...args),
  },
}))

jest.mock("@/i18n/translate", () => ({
  translate: (key: string, options?: Record<string, any>) => {
    const catalog = jest.requireActual("@/i18n/de").default
    const [namespace, path] = key.split(":")
    const value = path
      .split(".")
      .reduce((current: any, segment: string) => current?.[segment], catalog[namespace])

    if (typeof value !== "string") return key

    return Object.entries(options ?? {}).reduce(
      (resolved, [option, replacement]) =>
        resolved.replace(new RegExp(`{{\\s*${option}\\s*}}`, "g"), String(replacement)),
      value,
    )
  },
}))

jest.mock("@/utils/openLinkInBrowser", () => ({
  openLinkInBrowser: jest.fn(),
}))

jest.mock("./hooks/useFuneralHomeQuoteRequestsQuery", () => ({
  useFuneralHomeQuoteRequestsQuery: jest.fn(),
}))

jest.mock("./hooks/useQuoteRequestTimelineQuery", () => ({
  useQuoteRequestTimelineQuery: jest.fn(),
}))

const category: CategoryDto = {
  id: "cat-flowers",
  slug: "flowers",
  nameDe: "Trauerfloristik",
  nameEn: "Funeral floristry",
  parentId: null,
  icon: "flower",
  quoteFormSchema: {},
  isActive: true,
}

const request: QuoteRequestListItemDto = {
  id: "request-123",
  funeralHomeId: "fh-1",
  supplierId: "supplier-1",
  categoryId: "cat-flowers",
  subject: "Trauerfloristik fuer Juni",
  message: "Bitte ein Angebot vorbereiten.",
  deadline: "2026-06-10",
  attributes: { quantity: "2" },
  attachments: [],
  documents: [
    {
      id: "document-1",
      ownerType: "QUOTE_REQUEST",
      ownerId: "request-123",
      kind: "QUOTE_REQUEST_PDF",
      fileName: "request-123.pdf",
      contentType: "application/pdf",
      storageKey: "quote-request-pdf/request-123.pdf",
      url: "/api/mobile/quote-requests/request-123/pdf",
      byteLength: 1833,
      checksum: "checksum",
      createdAt: "2026-05-26T08:01:00.000+02:00",
    },
  ],
  status: "RESPONDED",
  createdAt: "2026-05-26T08:00:00.000+02:00",
  sentAt: "2026-05-26T08:00:00.000+02:00",
  respondedAt: "2026-05-27T08:00:00.000+02:00",
  category,
  emailDispatch: { status: "SENT", sentAt: "2026-05-26T08:01:00.000+02:00" },
  responses: [
    {
      id: "response-1",
      quoteRequestId: "request-123",
      supplierId: "supplier-1",
      priceAmount: 1200,
      priceCurrency: "EUR",
      priceIsRange: false,
      priceMax: null,
      validityUntil: "2026-06-20T00:00:00.000+02:00",
      leadTimeDays: 3,
      message: "Wir können liefern.",
      attachments: [],
      status: "SENT",
      sentAt: "2026-05-27T08:00:00.000+02:00",
    },
  ],
  supplier: {
    id: "supplier-1",
    legalName: "Trauerhilfe GmbH",
    tradingName: "Trauerhilfe Berlin",
    hrCourt: null,
    hrType: null,
    hrNumber: null,
    vatId: null,
    address: { street: "Hauptstrasse 1", zip: "10115", city: "Berlin", country: "DE" },
    phone: "+4930123456",
    contactEmail: "kontakt@example.test",
    publicDescription: null,
    logoUrl: null,
    categoryIds: ["cat-flowers"],
    regionsServed: ["Berlin"],
    languages: ["de"],
    certifications: [],
    accountStatus: "ACTIVE",
    subscriptionTier: "standard",
    billingEmail: "rechnung@example.test",
    createdAt: "2026-05-24T09:00:00.000+02:00",
  },
}

const timelineEvent: RequestTimelineEventDto = {
  id: "timeline-1",
  type: "REQUEST_SENT",
  title: "Raw backend title",
  description: "Die Anfrage wurde verschickt.",
  occurredAt: "2026-05-26T08:01:00.000+02:00",
  status: "DONE",
  actorRole: "FUNERAL_HOME_USER",
  relatedEntityType: "QUOTE_REQUEST",
  relatedEntityId: "request-123",
}

function mockRequests(
  state: {
    data?: QuoteRequestListItemDto[]
    error?: ApiFailure | null
    isError?: boolean
    isFetching?: boolean
    isLoading?: boolean
    isRefetching?: boolean
  } = {},
) {
  jest.mocked(useFuneralHomeQuoteRequestsQuery).mockReturnValue({
    data: state.data,
    error: state.error ?? null,
    isError: state.isError ?? false,
    isFetching: state.isFetching ?? false,
    isLoading: state.isLoading ?? false,
    isRefetching: state.isRefetching ?? false,
    refetch: mockRequestsRefetch,
  } as unknown as ReturnType<typeof useFuneralHomeQuoteRequestsQuery>)
}

function mockTimeline(
  state: {
    data?: RequestTimelineEventDto[]
    error?: ApiFailure | null
    isError?: boolean
    isLoading?: boolean
    isRefetching?: boolean
  } = {},
) {
  jest.mocked(useQuoteRequestTimelineQuery).mockReturnValue({
    data: state.data,
    error: state.error ?? null,
    isError: state.isError ?? false,
    isLoading: state.isLoading ?? false,
    isRefetching: state.isRefetching ?? false,
    refetch: mockTimelineRefetch,
  } as unknown as ReturnType<typeof useQuoteRequestTimelineQuery>)
}

function renderDetail(requestId = "request-123") {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <FuneralHomeQuoteRequestDetailScreen requestId={requestId} />
      </ThemeProvider>
    </SafeAreaProvider>,
  )
}

describe("FuneralHomeQuoteRequestDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    i18n.language = "de"
    loadDateFnsLocale()
    mockRouterCanGoBack.mockReturnValue(true)
    mockRequests({ data: [request] })
    mockTimeline({
      data: [
        timelineEvent,
        {
          ...timelineEvent,
          id: "timeline-email-queued",
          actorRole: "SYSTEM",
          type: "REQUEST_EMAIL_QUEUED",
        },
      ],
    })
  })

  test("renders request details, response summary, dispatch, document placeholder, and timeline", () => {
    const screen = renderDetail()

    expect(screen.getByText("Trauerfloristik fuer Juni")).toBeTruthy()
    expect(screen.getByText("Trauerhilfe Berlin")).toBeTruthy()
    expect(
      screen.getAllByText(de.funeralHome.quotes.status.request.RESPONDED).length,
    ).toBeGreaterThan(0)
    expect(screen.getByText(de.funeralHome.quotes.status.dispatch.SENT)).toBeTruthy()
    expect(screen.getByText(de.funeralHome.quotes.detail.createdLabel)).toBeTruthy()
    expect(screen.getByText("10. Juni 2026")).toBeTruthy()
    expect(screen.getByText(de.funeralHome.rfq.fields.quantityLabel + ": 2")).toBeTruthy()
    expect(screen.queryByText(de.funeralHome.quotes.detail.noResponse)).toBeNull()
    expect(screen.getByText("Wir können liefern.")).toBeTruthy()
    expect(screen.getByText(de.funeralHome.quotes.detail.documentsUnavailable)).toBeTruthy()
    expect(screen.getByText(de.funeralHome.quotes.timeline.events.REQUEST_SENT)).toBeTruthy()
    expect(
      screen.getByText(de.funeralHome.quotes.timeline.events.REQUEST_EMAIL_QUEUED),
    ).toBeTruthy()
  })

  test("opens absolute document URLs only", () => {
    mockRequests({
      data: [
        {
          ...request,
          documents: [
            { ...request.documents[0], url: "https://documents.example.test/request.pdf" },
          ],
        },
      ],
    })

    const screen = renderDetail()

    expect(screen.queryByText(de.funeralHome.quotes.detail.documentsUnavailable)).toBeNull()
    fireEvent.press(screen.getByText("request-123.pdf"))
    expect(openLinkInBrowser).toHaveBeenCalledWith("https://documents.example.test/request.pdf")
  })

  test("hides unavailable document actions when URLs are not openable", () => {
    mockRequests({
      data: [
        {
          ...request,
          documents: [{ ...request.documents[0], url: "http://example.test/request.pdf" }],
        },
      ],
    })

    const screen = renderDetail()

    expect(screen.getByText(de.funeralHome.quotes.detail.documentsUnavailable)).toBeTruthy()
  })

  test("does not render cached protected detail while the list refetch confirms access", () => {
    mockRequests({ data: [request], isFetching: true })

    const screen = renderDetail()

    expect(screen.getByText(de.funeralHome.quotes.detail.loadingTitle)).toBeTruthy()
    expect(screen.queryByText("Trauerfloristik fuer Juni")).toBeNull()
    expect(useQuoteRequestTimelineQuery).toHaveBeenCalledWith(undefined)
  })

  test("renders singular response when the responses array is empty", () => {
    mockRequests({
      data: [
        {
          ...request,
          response: {
            ...request.responses![0],
            id: "response-singular",
            message: "Einzelne Antwort aus dem Detailfeld.",
          },
          responses: [],
        },
      ],
    })

    const screen = renderDetail()

    expect(screen.getByText("Einzelne Antwort aus dem Detailfeld.")).toBeTruthy()
    expect(screen.queryByText(de.funeralHome.quotes.detail.noResponse)).toBeNull()
  })

  test("sorts latest responses without mutating cached response arrays", () => {
    const responses = [
      {
        ...request.responses![0],
        id: "response-old",
        message: "Alte Antwort.",
        sentAt: "2026-05-26T08:00:00.000+02:00",
      },
      {
        ...request.responses![0],
        id: "response-new",
        message: "Neue Antwort.",
        sentAt: "2026-05-28T08:00:00.000+02:00",
      },
    ]
    mockRequests({ data: [{ ...request, responses }] })

    const screen = renderDetail()

    expect(screen.getByText("Neue Antwort.")).toBeTruthy()
    expect(responses.map((response) => response.id)).toEqual(["response-old", "response-new"])
  })

  test("falls back when response currency is invalid", () => {
    mockRequests({
      data: [
        {
          ...request,
          responses: [
            {
              ...request.responses![0],
              priceCurrency: "RAW" as "EUR",
            },
          ],
        },
      ],
    })

    const screen = renderDetail()

    expect(screen.getByText(/RAW/)).toBeTruthy()
  })

  test("shows loading instead of not-found while a missing cached target is refetching", () => {
    mockRequests({ data: [], isFetching: true })

    const screen = renderDetail()

    expect(screen.getByText(de.funeralHome.quotes.detail.loadingTitle)).toBeTruthy()
    expect(screen.queryByText(de.funeralHome.quotes.detail.notFoundTitle)).toBeNull()
    expect(useQuoteRequestTimelineQuery).toHaveBeenCalledWith(undefined)
  })

  test("renders not-found state for missing targets without protected stale detail", () => {
    mockRequests({ data: [] })

    const screen = renderDetail()

    expect(screen.getByText(de.funeralHome.quotes.detail.notFoundTitle)).toBeTruthy()
    fireEvent.press(screen.getByText(de.funeralHome.quotes.detail.backAction))
    expect(mockRouterReplace).toHaveBeenCalledWith("/funeral-home/quotes")
    expect(useQuoteRequestTimelineQuery).toHaveBeenCalledWith(undefined)
  })

  test("uses history back when available and replaces with quote history on direct entry", () => {
    const screen = renderDetail()

    fireEvent.press(screen.getByLabelText(de.common.back))
    expect(mockRouterBack).toHaveBeenCalled()

    jest.clearAllMocks()
    mockRouterCanGoBack.mockReturnValue(false)
    const directEntryScreen = renderDetail()

    fireEvent.press(directEntryScreen.getByLabelText(de.common.back))
    expect(mockRouterBack).not.toHaveBeenCalled()
    expect(mockRouterReplace).toHaveBeenCalledWith("/funeral-home/quotes")
  })

  test("falls back when timeline timestamps are malformed", () => {
    mockTimeline({ data: [{ ...timelineEvent, occurredAt: "not-a-date" }] })

    const screen = renderDetail()

    expect(screen.getByText(de.funeralHome.quotes.card.dateUnavailable)).toBeTruthy()
  })

  test("renders timeline errors with retry without hiding request details", () => {
    mockTimeline({
      error: {
        ok: false,
        problem: "network",
        messageKey: "api:error.network",
      },
      isError: true,
    })

    const screen = renderDetail()

    expect(screen.getByText("Trauerfloristik fuer Juni")).toBeTruthy()
    expect(screen.getByText(de.funeralHome.quotes.timeline.errorTitle)).toBeTruthy()
    fireEvent.press(screen.getByText(de.funeralHome.quotes.timeline.retryAction))
    expect(mockTimelineRefetch).toHaveBeenCalled()
  })
})
