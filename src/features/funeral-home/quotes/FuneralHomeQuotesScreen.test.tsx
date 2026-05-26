import { fireEvent, render } from "@testing-library/react-native"
import i18n from "i18next"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import type { ApiFailure, CategoryDto, QuoteRequestListItemDto } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"

import { FuneralHomeQuotesScreen } from "./FuneralHomeQuotesScreen"
import { useFuneralHomeQuoteRequestsQuery } from "./hooks/useFuneralHomeQuoteRequestsQuery"
import { useCategoriesQuery } from "../hooks/useCategoriesQuery"

const mockRouterPush = jest.fn()
const mockRefetch = jest.fn()

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
    push: (...args: unknown[]) => mockRouterPush(...args),
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

jest.mock("../hooks/useCategoriesQuery", () => ({
  useCategoriesQuery: jest.fn(),
}))

jest.mock("./hooks/useFuneralHomeQuoteRequestsQuery", () => ({
  useFuneralHomeQuoteRequestsQuery: jest.fn(),
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
  documents: [],
  status: "SENT",
  createdAt: "2026-05-26T08:00:00.000+02:00",
  sentAt: "2026-05-26T08:00:00.000+02:00",
  respondedAt: null,
  category,
  emailDispatch: { status: "QUEUED" },
  responses: [],
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

function mockCategories() {
  jest.mocked(useCategoriesQuery).mockReturnValue({
    data: [category],
    isError: false,
    isLoading: false,
  } as unknown as ReturnType<typeof useCategoriesQuery>)
}

function mockRequests(
  state: {
    data?: QuoteRequestListItemDto[]
    error?: ApiFailure | null
    isError?: boolean
    isLoading?: boolean
    isRefetching?: boolean
  } = {},
) {
  jest.mocked(useFuneralHomeQuoteRequestsQuery).mockReturnValue({
    data: state.data,
    error: state.error ?? null,
    isError: state.isError ?? false,
    isLoading: state.isLoading ?? false,
    isRefetching: state.isRefetching ?? false,
    refetch: mockRefetch,
  } as unknown as ReturnType<typeof useFuneralHomeQuoteRequestsQuery>)
}

function renderQuotes() {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <FuneralHomeQuotesScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  )
}

describe("FuneralHomeQuotesScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    i18n.language = "de"
    mockCategories()
    mockRequests({ data: [request] })
  })

  test("renders stable loading cards while outgoing requests load", () => {
    mockRequests({ isLoading: true })

    const screen = renderQuotes()

    expect(
      screen.getAllByText(de.funeralHome.quotes.states.loadingCard, {
        includeHiddenElements: true,
      }),
    ).toHaveLength(3)
  })

  test("renders an empty state with a path back to discovery", () => {
    mockRequests({ data: [] })

    const screen = renderQuotes()

    expect(screen.getByText(de.funeralHome.quotes.states.emptyTitle)).toBeTruthy()
    fireEvent.press(screen.getByText(de.funeralHome.quotes.states.emptyAction))
    expect(mockRouterPush).toHaveBeenCalledWith("/funeral-home/discover")
  })

  test("renders request cards with status, metadata, dispatch, and detail navigation", () => {
    const screen = renderQuotes()

    expect(screen.getByText("Trauerfloristik fuer Juni")).toBeTruthy()
    expect(screen.getByText("Trauerhilfe Berlin")).toBeTruthy()
    expect(screen.getByText("Trauerfloristik")).toBeTruthy()
    expect(screen.getAllByText(de.funeralHome.quotes.status.request.SENT).length).toBeGreaterThan(0)
    expect(screen.getByText(de.funeralHome.quotes.status.dispatch.QUEUED)).toBeTruthy()

    fireEvent.press(screen.getByText("Trauerfloristik fuer Juni"))
    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: "/funeral-home/quotes/[requestId]",
      params: { requestId: "request-123" },
    })
  })

  test("does not advertise cleartext document URLs as available", () => {
    mockRequests({
      data: [
        {
          ...request,
          documents: [
            {
              id: "document-1",
              ownerType: "QUOTE_REQUEST",
              ownerId: "request-123",
              kind: "QUOTE_REQUEST_PDF",
              fileName: "request-123.pdf",
              contentType: "application/pdf",
              storageKey: "quote-request-pdf/request-123.pdf",
              url: "http://documents.example.test/request.pdf",
              byteLength: 1833,
              checksum: "checksum",
              createdAt: "2026-05-26T08:01:00.000+02:00",
            },
          ],
        },
      ],
    })

    const screen = renderQuotes()

    expect(screen.getByText(de.funeralHome.quotes.card.documentsUnavailable)).toBeTruthy()
    expect(screen.queryByText(de.funeralHome.quotes.card.documentsAvailable)).toBeNull()
  })

  test("sorts latest card responses without mutating cached response arrays", () => {
    const responses = [
      {
        id: "response-old",
        quoteRequestId: "request-123",
        supplierId: "supplier-1",
        priceAmount: 1200,
        priceCurrency: "EUR",
        priceIsRange: false,
        priceMax: null,
        validityUntil: "2026-06-20T00:00:00.000+02:00",
        leadTimeDays: 3,
        message: "Alte Antwort.",
        attachments: [],
        status: "SENT",
        sentAt: "2026-05-26T08:00:00.000+02:00",
      },
      {
        id: "response-new",
        quoteRequestId: "request-123",
        supplierId: "supplier-1",
        priceAmount: 1300,
        priceCurrency: "EUR",
        priceIsRange: false,
        priceMax: null,
        validityUntil: "2026-06-21T00:00:00.000+02:00",
        leadTimeDays: 4,
        message: "Neue Antwort.",
        attachments: [],
        status: "ACCEPTED",
        sentAt: "2026-05-28T08:00:00.000+02:00",
      },
    ] satisfies QuoteRequestListItemDto["responses"]
    mockRequests({ data: [{ ...request, responses }] })

    const screen = renderQuotes()

    expect(screen.getByText(de.funeralHome.quotes.status.response.ACCEPTED)).toBeTruthy()
    expect(responses.map((response) => response.id)).toEqual(["response-old", "response-new"])
  })

  test("counts singular responses when the list includes an empty responses array", () => {
    mockRequests({
      data: [
        {
          ...request,
          response: {
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
          responses: [],
        },
      ],
    })

    const screen = renderQuotes()

    expect(
      screen.getByText(de.funeralHome.quotes.card.responsesLabel.replace("{{count}}", "1")),
    ).toBeTruthy()
    expect(screen.getByText(de.funeralHome.quotes.status.response.SENT)).toBeTruthy()
  })

  test("renders normalized API errors with retry", () => {
    mockRequests({
      error: {
        ok: false,
        problem: "network",
        messageKey: "api:error.network",
      },
      isError: true,
    })

    const screen = renderQuotes()

    expect(screen.getByText(de.funeralHome.quotes.states.errorTitle)).toBeTruthy()
    fireEvent.press(screen.getByText(de.funeralHome.quotes.states.retryAction))
    expect(mockRefetch).toHaveBeenCalled()
  })
})
