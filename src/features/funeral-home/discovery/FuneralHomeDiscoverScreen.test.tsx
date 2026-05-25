import { fireEvent, render } from "@testing-library/react-native"
import i18n from "i18next"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import type { ApiFailure, CategoryDto, SupplierDto } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"

import { FuneralHomeDiscoverScreen } from "./FuneralHomeDiscoverScreen"
import { useSuppliersQuery } from "./hooks/useSuppliersQuery"
import { useCategoriesQuery } from "../hooks/useCategoriesQuery"

const mockUseLocalSearchParams = jest.fn()
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
  useLocalSearchParams: () => mockUseLocalSearchParams(),
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

jest.mock("../hooks/useCategoriesQuery", () => ({
  useCategoriesQuery: jest.fn(),
}))

jest.mock("./hooks/useSuppliersQuery", () => ({
  useSuppliersQuery: jest.fn(),
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

const transportCategory: CategoryDto = {
  ...category,
  id: "cat-transport",
  slug: "transport",
  nameDe: "Ueberfuehrung",
  nameEn: "Transport",
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
  publicDescription: "Regionale Begleitung.",
  logoUrl: null,
  categoryIds: ["cat-flowers"],
  regionsServed: ["Berlin"],
  languages: ["de"],
  certifications: [],
  accountStatus: "ACTIVE",
  subscriptionTier: "standard",
  billingEmail: "rechnung@trauerhilfe.example",
  createdAt: "2026-05-24T09:00:00.000Z",
}

function mockCategories(state: Partial<ReturnType<typeof useCategoriesQuery>> = {}) {
  jest.mocked(useCategoriesQuery).mockReturnValue({
    data: [category, transportCategory],
    error: null,
    isError: false,
    isLoading: false,
    isRefetching: false,
    refetch: jest.fn(),
    ...state,
  } as unknown as ReturnType<typeof useCategoriesQuery>)
}

function mockSuppliers(
  state: {
    data?: SupplierDto[]
    error?: ApiFailure | null
    isError?: boolean
    isLoading?: boolean
    isRefetching?: boolean
  } = {},
) {
  jest.mocked(useSuppliersQuery).mockReturnValue({
    data: state.data,
    error: state.error ?? null,
    isError: state.isError ?? false,
    isLoading: state.isLoading ?? false,
    isRefetching: state.isRefetching ?? false,
    refetch: mockRefetch,
  } as unknown as ReturnType<typeof useSuppliersQuery>)
}

function renderDiscover() {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <FuneralHomeDiscoverScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  )
}

describe("FuneralHomeDiscoverScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    i18n.language = "de"
    mockUseLocalSearchParams.mockReturnValue({})
    mockCategories()
    mockSuppliers({ data: [supplier] })
  })

  test("preselects a category from route params and requests suppliers with mobile params", () => {
    mockUseLocalSearchParams.mockReturnValue({ categoryId: "cat-flowers", categorySlug: "flowers" })

    const screen = renderDiscover()

    expect(screen.getAllByText("Trauerfloristik").length).toBeGreaterThan(0)
    expect(useSuppliersQuery).toHaveBeenLastCalledWith({
      categoryId: "cat-flowers",
      language: undefined,
      query: "",
      region: undefined,
    })
  })

  test("updates category selection when route params change on an already mounted screen", () => {
    mockUseLocalSearchParams.mockReturnValue({ categoryId: "cat-flowers", categorySlug: "flowers" })
    const screen = renderDiscover()

    mockUseLocalSearchParams.mockReturnValue({
      categoryId: "cat-transport",
      categorySlug: "transport",
    })
    screen.rerender(
      <SafeAreaProvider>
        <ThemeProvider>
          <FuneralHomeDiscoverScreen />
        </ThemeProvider>
      </SafeAreaProvider>,
    )

    expect(useSuppliersQuery).toHaveBeenLastCalledWith({
      categoryId: "cat-transport",
      language: undefined,
      query: "",
      region: undefined,
    })
  })

  test("updates search text, filter chips, individual clears, and grouped clear state", () => {
    const screen = renderDiscover()

    fireEvent.changeText(
      screen.getByPlaceholderText(de.funeralHome.discover.search.placeholder),
      "Floristik",
    )
    expect(useSuppliersQuery).toHaveBeenLastCalledWith({
      categoryId: undefined,
      language: undefined,
      query: "Floristik",
      region: undefined,
    })

    expect(screen.getByText("NRW")).toBeTruthy()
    fireEvent.press(screen.getAllByText("Trauerfloristik")[0])
    expect(useSuppliersQuery).toHaveBeenLastCalledWith({
      categoryId: "cat-flowers",
      language: undefined,
      query: "Floristik",
      region: undefined,
    })

    fireEvent.press(screen.getAllByText("Berlin")[0])
    fireEvent.press(screen.getByText("Deutsch"))
    expect(useSuppliersQuery).toHaveBeenLastCalledWith({
      categoryId: "cat-flowers",
      language: "de",
      query: "Floristik",
      region: "Berlin",
    })

    fireEvent.press(screen.getByText(de.funeralHome.discover.filters.clearCategoryAction))
    expect(useSuppliersQuery).toHaveBeenLastCalledWith({
      categoryId: undefined,
      language: "de",
      query: "Floristik",
      region: "Berlin",
    })

    fireEvent.press(screen.getByText(de.funeralHome.discover.filters.clearAllAction))
    expect(useSuppliersQuery).toHaveBeenLastCalledWith({
      categoryId: undefined,
      language: undefined,
      query: "",
      region: undefined,
    })
  })

  test("renders stable loading placeholders", () => {
    mockSuppliers({ isLoading: true })

    const screen = renderDiscover()

    expect(
      screen.getAllByText(de.funeralHome.discover.states.loadingCard, {
        includeHiddenElements: true,
      }),
    ).toHaveLength(3)
    expect(screen.queryByLabelText(de.funeralHome.discover.states.loadingCardA11y)).toBeNull()
  })

  test("renders supplier cards and routes selection to supplier detail with category context", () => {
    mockUseLocalSearchParams.mockReturnValue({ categoryId: "cat-flowers", categorySlug: "flowers" })
    const screen = renderDiscover()

    expect(screen.getByText("Trauerhilfe Berlin")).toBeTruthy()
    fireEvent.press(screen.getByText(de.funeralHome.discover.card.detailAction))

    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: "/funeral-home/discover/[supplierId]",
      params: { categoryId: "cat-flowers", supplierId: "supplier-1" },
    })
  })

  test("renders practical empty and recoverable error states", () => {
    mockSuppliers({ data: [] })
    const emptyScreen = renderDiscover()

    expect(emptyScreen.getByText(de.funeralHome.discover.states.emptyTitle)).toBeTruthy()
    expect(emptyScreen.getByText(de.funeralHome.discover.states.emptyBrowseAction)).toBeTruthy()
    fireEvent.press(emptyScreen.getByText(de.funeralHome.discover.states.emptyBrowseAction))
    expect(mockRouterPush).toHaveBeenCalledWith("/funeral-home")

    emptyScreen.unmount()
    mockSuppliers({
      isError: true,
      error: {
        ok: false,
        problem: "network",
        messageKey: "api:error.network",
      },
    })
    const errorScreen = renderDiscover()

    expect(errorScreen.getByText(de.api.error.network)).toBeTruthy()
    fireEvent.press(errorScreen.getByText(de.funeralHome.discover.states.retryAction))
    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })
})
