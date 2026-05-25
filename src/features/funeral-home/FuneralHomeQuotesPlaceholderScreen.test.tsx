import { render } from "@testing-library/react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import { ThemeProvider } from "@/theme/context"

import { FuneralHomeQuotesPlaceholderScreen } from "./FuneralHomeQuotesPlaceholderScreen"

const mockUseLocalSearchParams = jest.fn()

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
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}))

jest.mock("@/i18n/translate", () => ({
  translate: (key: string) => {
    const catalog = jest.requireActual("@/i18n/de").default
    const [namespace, path] = key.split(":")
    const value = path
      .split(".")
      .reduce((current: any, segment: string) => current?.[segment], catalog[namespace])

    return typeof value === "string" ? value : key
  },
}))

function renderQuotesPlaceholder() {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <FuneralHomeQuotesPlaceholderScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  )
}

describe("FuneralHomeQuotesPlaceholderScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseLocalSearchParams.mockReturnValue({})
  })

  test("renders a controlled new-request placeholder when RFQ context is provided", () => {
    mockUseLocalSearchParams.mockReturnValue({
      entry: "new",
      supplierId: "supplier-1",
      categoryId: "cat-flowers",
    })

    const screen = renderQuotesPlaceholder()

    expect(screen.getByText(de.funeralHome.quotes.newTitle)).toBeTruthy()
    expect(screen.getByText(de.funeralHome.quotes.newStatus)).toBeTruthy()
    expect(screen.queryByText("supplier-1")).toBeNull()
    expect(screen.queryByText("cat-flowers")).toBeNull()
  })

  test("ignores invalid RFQ supplier context", () => {
    mockUseLocalSearchParams.mockReturnValue({
      entry: "new",
      supplierId: "   ",
      categoryId: "cat-flowers",
    })

    const screen = renderQuotesPlaceholder()

    expect(screen.getByText(de.funeralHome.quotes.title)).toBeTruthy()
    expect(screen.queryByText(de.funeralHome.quotes.newTitle)).toBeNull()
  })
})
