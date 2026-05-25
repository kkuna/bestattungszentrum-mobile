import { fireEvent, render } from "@testing-library/react-native"
import i18n from "i18next"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import en from "@/i18n/en"
import type { ApiFailure, CategoryDto } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"

import { FuneralHomeHomeScreen } from "./FuneralHomeHomeScreen"
import { useCategoriesQuery } from "./hooks/useCategoriesQuery"

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

jest.mock("./hooks/useCategoriesQuery", () => ({
  useCategoriesQuery: jest.fn(),
}))

const activeCategory: CategoryDto = {
  id: "cat-1",
  slug: "flowers",
  nameDe: "Blumen und Trauerfloristik",
  nameEn: "Flowers and funeral floristry",
  parentId: null,
  icon: "flower",
  quoteFormSchema: { type: "object" },
  isActive: true,
}

const inactiveCategory: CategoryDto = {
  id: "cat-2",
  slug: "inactive",
  nameDe: "Nicht aktiv",
  nameEn: "Inactive",
  parentId: null,
  icon: null,
  quoteFormSchema: {},
  isActive: false,
}

const blankNameCategory: CategoryDto = {
  id: "cat-3",
  slug: "backend-taxonomy",
  nameDe: "",
  nameEn: "",
  parentId: null,
  icon: null,
  quoteFormSchema: {},
  isActive: true,
}

function mockCategoriesQuery(state: {
  data?: CategoryDto[]
  error?: ApiFailure
  isError?: boolean
  isLoading?: boolean
  isRefetching?: boolean
}) {
  jest.mocked(useCategoriesQuery).mockReturnValue({
    data: state.data,
    error: state.error ?? null,
    isError: state.isError ?? false,
    isLoading: state.isLoading ?? false,
    isRefetching: state.isRefetching ?? false,
    refetch: mockRefetch,
  } as unknown as ReturnType<typeof useCategoriesQuery>)
}

function renderHome() {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <FuneralHomeHomeScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  )
}

describe("FuneralHomeHomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    i18n.language = "de"
  })

  test("renders localized loading placeholders and request shortcuts", () => {
    mockCategoriesQuery({ isLoading: true })

    const screen = renderHome()

    expect(screen.getByText(de.funeralHome.home.title)).toBeTruthy()
    expect(
      screen.getAllByText(de.funeralHome.home.categories.loading, { includeHiddenElements: true }),
    ).toHaveLength(3)
    expect(screen.getByText(de.funeralHome.home.shortcuts.discoverTitle)).toBeTruthy()
    expect(screen.queryByLabelText(de.funeralHome.home.categories.loadingTileA11y)).toBeNull()
  })

  test("renders active localized categories and hides inactive categories", () => {
    mockCategoriesQuery({ data: [activeCategory, inactiveCategory] })

    const screen = renderHome()

    expect(screen.getByText(activeCategory.nameDe)).toBeTruthy()
    expect(screen.queryByText(inactiveCategory.nameDe)).toBeNull()
    expect(
      screen.getByLabelText(
        de.funeralHome.home.categories.tileA11y.replace("{{name}}", activeCategory.nameDe),
      ),
    ).toBeTruthy()
  })

  test("renders English category names when English is active", () => {
    i18n.language = "en"
    mockCategoriesQuery({ data: [activeCategory] })

    const screen = renderHome()

    expect(screen.getByText(en.funeralHome.home.title)).toBeTruthy()
    expect(screen.getByText(activeCategory.nameEn)).toBeTruthy()
  })

  test("uses localized fallback copy for blank category names", () => {
    mockCategoriesQuery({ data: [blankNameCategory] })

    const screen = renderHome()

    expect(screen.getByText(de.funeralHome.home.categories.unnamedCategory)).toBeTruthy()
    expect(screen.queryByText(blankNameCategory.slug)).toBeNull()
  })

  test("renders a practical empty state when no active categories are available", () => {
    mockCategoriesQuery({ data: [inactiveCategory] })

    const screen = renderHome()

    expect(screen.getByText(de.funeralHome.home.categories.emptyTitle)).toBeTruthy()
    fireEvent.press(screen.getByText(de.funeralHome.home.categories.emptyAction))
    expect(mockRouterPush).toHaveBeenCalledWith("/funeral-home/discover")
  })

  test("renders normalized API failure copy and retries category loading", () => {
    mockCategoriesQuery({
      isError: true,
      error: {
        ok: false,
        problem: "server",
        status: 500,
        messageKey: "api:error.server",
      },
    })

    const screen = renderHome()

    expect(screen.getByText(de.api.error.server)).toBeTruthy()
    fireEvent.press(screen.getByText(de.funeralHome.home.categories.retryAction))
    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })

  test("routes category selection to the Discover tab with a stable category contract", () => {
    mockCategoriesQuery({ data: [activeCategory] })

    const screen = renderHome()

    fireEvent.press(
      screen.getByLabelText(
        de.funeralHome.home.categories.tileA11y.replace("{{name}}", activeCategory.nameDe),
      ),
    )

    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: "/funeral-home/discover",
      params: { categoryId: activeCategory.id, categorySlug: activeCategory.slug },
    })
  })
})
