import { fireEvent, render } from "@testing-library/react-native"
import i18n from "i18next"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import type { ApiFailure, CategoryDto, SupplierDto } from "@/services/api/types"
import { useSession } from "@/services/session"
import type { AuthenticatedSession } from "@/services/session/types"
import { ThemeProvider } from "@/theme/context"

import { useSupplierDetailQuery } from "./hooks/useSupplierDetailQuery"
import { SupplierDetailScreen } from "./SupplierDetailScreen"
import { useCategoriesQuery } from "../hooks/useCategoriesQuery"

const mockRouterPush = jest.fn()
const mockRouterBack = jest.fn()
const mockRouterCanGoBack = jest.fn()
const mockRouterReplace = jest.fn()
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
    back: (...args: unknown[]) => mockRouterBack(...args),
    canGoBack: (...args: unknown[]) => mockRouterCanGoBack(...args),
    push: (...args: unknown[]) => mockRouterPush(...args),
    replace: (...args: unknown[]) => mockRouterReplace(...args),
  },
}))

jest.mock("@/i18n/translate", () => ({
  translate: (key: string, options?: Record<string, any>) => {
    const i18next = require("i18next")
    const catalog = i18next.language.startsWith("en")
      ? jest.requireActual("@/i18n/en").default
      : jest.requireActual("@/i18n/de").default
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

jest.mock("@/services/session", () => ({
  useSession: jest.fn(),
}))

jest.mock("../hooks/useCategoriesQuery", () => ({
  useCategoriesQuery: jest.fn(),
}))

jest.mock("./hooks/useSupplierDetailQuery", () => ({
  useSupplierDetailQuery: jest.fn(),
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

const supplier: SupplierDto = {
  id: "supplier-1",
  legalName: "Trauerhilfe GmbH",
  tradingName: "Trauerhilfe Berlin",
  hrCourt: "AG Berlin",
  hrType: "HRB",
  hrNumber: "12345",
  vatId: "DE123456789",
  address: {
    street: "Hauptstrasse 1",
    zip: "10115",
    city: "Berlin",
    country: "DE",
  },
  phone: "+4930123456",
  contactEmail: "kontakt@trauerhilfe.example",
  publicDescription: "Regionale Begleitung fuer Bestattungsinstitute.",
  logoUrl: null,
  categoryIds: ["cat-flowers"],
  regionsServed: ["Berlin", "Brandenburg"],
  languages: ["de", "en"],
  certifications: ["DIN 15017"],
  accountStatus: "ACTIVE",
  subscriptionTier: "standard",
  billingEmail: "rechnung@trauerhilfe.example",
  createdAt: "2026-05-24T09:00:00.000Z",
}

const activeSession: AuthenticatedSession = {
  isAuthenticated: true,
  accessTokenExpiresAt: "2026-05-25T12:00:00.000Z",
  refreshTokenExpiresAt: "2026-06-25T12:00:00.000Z",
  userId: "user-1",
  email: "bestatter@example.de",
  role: "FUNERAL_HOME_USER",
  tenantId: "fh-1",
  accountStatus: "ACTIVE",
  verificationStatus: "VERIFIED",
  userStatus: "ACTIVE",
  languagePreference: "de",
}

function mockSession(session: AuthenticatedSession = activeSession) {
  jest.mocked(useSession).mockReturnValue({
    session: { status: "authenticated", session },
    login: jest.fn(),
    changeLanguagePreference: jest.fn(),
    retryHydration: jest.fn(),
    signOut: jest.fn(),
  } as unknown as ReturnType<typeof useSession>)
}

function mockCategories(state: Partial<ReturnType<typeof useCategoriesQuery>> = {}) {
  jest.mocked(useCategoriesQuery).mockReturnValue({
    data: [category],
    error: null,
    isError: false,
    isLoading: false,
    isRefetching: false,
    refetch: jest.fn(),
    ...state,
  } as unknown as ReturnType<typeof useCategoriesQuery>)
}

function mockSupplierDetail(
  state: {
    data?: SupplierDto
    error?: ApiFailure | null
    isError?: boolean
    isLoading?: boolean
    isMissingSupplierId?: boolean
    isRefetching?: boolean
  } = {},
) {
  jest.mocked(useSupplierDetailQuery).mockReturnValue({
    data: state.data,
    error: state.error ?? null,
    isError: state.isError ?? false,
    isLoading: state.isLoading ?? false,
    isMissingSupplierId: state.isMissingSupplierId ?? false,
    isRefetching: state.isRefetching ?? false,
    refetch: mockRefetch,
    supplierId: state.data?.id ?? "supplier-1",
  } as unknown as ReturnType<typeof useSupplierDetailQuery>)
}

function renderDetail(props: { supplierId?: string; categoryId?: string } = {}) {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <SupplierDetailScreen
          supplierId={props.supplierId ?? "supplier-1"}
          categoryId={props.categoryId ?? "cat-flowers"}
        />
      </ThemeProvider>
    </SafeAreaProvider>,
  )
}

describe("SupplierDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    i18n.language = "de"
    mockRouterCanGoBack.mockReturnValue(true)
    mockSession()
    mockCategories()
    mockSupplierDetail({ data: supplier })
  })

  test("renders active supplier detail without exposing private fields and enters RFQ with context", () => {
    const screen = renderDetail()

    expect(screen.getByText("Trauerhilfe Berlin")).toBeTruthy()
    expect(screen.getByText("Trauerhilfe GmbH")).toBeTruthy()
    expect(screen.getAllByText("Trauerfloristik").length).toBeGreaterThan(0)
    expect(screen.getByText("Berlin, Brandenburg")).toBeTruthy()
    expect(screen.getByText("DE, EN")).toBeTruthy()
    expect(screen.getByText("DIN 15017")).toBeTruthy()
    expect(screen.getByText("+4930123456")).toBeTruthy()
    expect(screen.getByText("kontakt@trauerhilfe.example")).toBeTruthy()
    expect(screen.queryByText("rechnung@trauerhilfe.example")).toBeNull()

    fireEvent.press(screen.getByText(de.funeralHome.discover.detail.requestAction))
    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: "/funeral-home/quotes/new",
      params: { categoryId: "cat-flowers", supplierId: "supplier-1" },
    })
  })

  test("uses the header back action when history is available", () => {
    const screen = renderDetail()

    fireEvent.press(screen.getByLabelText(de.common.back))

    expect(mockRouterBack).toHaveBeenCalledTimes(1)
  })

  test("falls back to the supplier category when a deep link carries unrelated category context", () => {
    const screen = renderDetail({ categoryId: "cat-transport" })

    fireEvent.press(screen.getByText(de.funeralHome.discover.detail.requestAction))

    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: "/funeral-home/quotes/new",
      params: { categoryId: "cat-flowers", supplierId: "supplier-1" },
    })
  })

  test("blocks RFQ entry when the supplier has no resolvable category", () => {
    mockSupplierDetail({ data: { ...supplier, categoryIds: [] } })

    const screen = renderDetail({ categoryId: undefined })

    expect(screen.getByText(de.funeralHome.discover.detail.blockedCategoryTitle)).toBeTruthy()
    fireEvent.press(screen.getByText(de.funeralHome.discover.detail.requestBlockedAction))
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  test("renders calm fallback copy for missing optional public fields", () => {
    mockSupplierDetail({
      data: {
        ...supplier,
        phone: "",
        publicDescription: null,
        logoUrl: "javascript:alert(1)",
        certifications: [],
      },
    })

    const screen = renderDetail()

    expect(screen.getByText(de.funeralHome.discover.detail.descriptionFallback)).toBeTruthy()
    expect(screen.getByText(de.funeralHome.discover.detail.phoneFallback)).toBeTruthy()
    expect(screen.getByText(de.funeralHome.discover.detail.certificationsFallback)).toBeTruthy()
  })

  test("blocks RFQ entry for unavailable suppliers and suspended funeral-home sessions", () => {
    mockSupplierDetail({ data: { ...supplier, accountStatus: "SUSPENDED" } })
    const unavailableScreen = renderDetail()

    expect(
      unavailableScreen.getByText(de.funeralHome.discover.detail.blockedSupplierTitle),
    ).toBeTruthy()
    fireEvent.press(
      unavailableScreen.getByText(de.funeralHome.discover.detail.requestBlockedAction),
    )
    expect(mockRouterPush).not.toHaveBeenCalled()

    unavailableScreen.unmount()
    mockSession({ ...activeSession, accountStatus: "SUSPENDED" })
    mockSupplierDetail({ data: supplier })
    const suspendedScreen = renderDetail()

    expect(
      suspendedScreen.getByText(de.funeralHome.discover.detail.blockedAccountTitle),
    ).toBeTruthy()
    fireEvent.press(suspendedScreen.getByText(de.funeralHome.discover.detail.requestBlockedAction))
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  test("renders loading, not-found, and recoverable error states", () => {
    mockSupplierDetail({ isLoading: true })
    const loadingScreen = renderDetail()
    expect(loadingScreen.getByText(de.funeralHome.discover.detail.loadingTitle)).toBeTruthy()

    loadingScreen.unmount()
    mockSupplierDetail({ isMissingSupplierId: true })
    const missingScreen = renderDetail({ supplierId: undefined })
    expect(missingScreen.getByText(de.funeralHome.discover.detail.notFoundTitle)).toBeTruthy()
    fireEvent.press(missingScreen.getByText(de.funeralHome.discover.detail.backToDiscoverAction))
    expect(mockRouterReplace).toHaveBeenCalledWith("/funeral-home/discover")

    missingScreen.unmount()
    mockSupplierDetail({
      isError: true,
      error: { ok: false, problem: "network", messageKey: "api:error.network" },
    })
    const errorScreen = renderDetail()
    expect(errorScreen.getByText(de.api.error.network)).toBeTruthy()
    fireEvent.press(errorScreen.getByText(de.funeralHome.discover.detail.retryAction))
    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })
})
