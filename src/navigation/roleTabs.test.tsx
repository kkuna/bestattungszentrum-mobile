import { render } from "@testing-library/react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import { ThemeProvider } from "@/theme/context"

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

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const catalog = jest.requireActual("@/i18n/de").default
      const [namespace, path] = key.split(":")
      return path.split(".").reduce((value, segment) => value?.[segment], catalog[namespace]) ?? key
    },
  }),
}))

jest.mock("expo-router", () => {
  const { Text, View } = require("react-native")

  function Tabs({ children, screenOptions }: { children: React.ReactNode; screenOptions: any }) {
    return (
      <View>
        <Text testID="tab-active-tint">{screenOptions.tabBarActiveTintColor}</Text>
        <Text testID="tab-inactive-tint">{screenOptions.tabBarInactiveTintColor}</Text>
        {children}
      </View>
    )
  }

  function Screen({ name, options }: { name: string; options: any }) {
    return (
      <Text
        testID={`tab-${name}`}
        accessibilityLabel={options.tabBarAccessibilityLabel}
      >{`${options.title}|${options.tabBarLabel}`}</Text>
    )
  }

  Tabs.Screen = Screen

  return { Tabs }
})

function renderWithProviders(element: React.ReactElement) {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>{element}</ThemeProvider>
    </SafeAreaProvider>,
  )
}

describe("role tab layouts", () => {
  it("renders localized funeral-home tabs with accessible labels and brand active tint", () => {
    const FuneralHomeTabs = require("@/app/(funeral-home)/funeral-home/_layout").default

    const screen = renderWithProviders(<FuneralHomeTabs />)

    expect(screen.getByTestId("tab-active-tint").props.children).toBe("#B8312F")
    expect(screen.getByTestId("tab-index").props.children).toContain(de.funeralHome.tabs.home)
    expect(screen.getByTestId("tab-discover").props.children).toContain(
      de.funeralHome.tabs.discover,
    )
    expect(screen.getByTestId("tab-quotes").props.children).toContain(de.funeralHome.tabs.quotes)
    expect(screen.getByTestId("tab-profile").props.children).toContain(de.shared.tabs.profile)
    expect(screen.getByTestId("tab-settings").props.children).toContain(de.shared.tabs.settings)
    expect(screen.getByLabelText(de.funeralHome.tabAccessibility.discover)).toBeTruthy()
  })

  it("renders supplier-only navigation without funeral-home discovery or RFQ tab labels", () => {
    const SupplierTabs = require("@/app/(supplier)/supplier/_layout").default

    const screen = renderWithProviders(<SupplierTabs />)

    expect(screen.getByTestId("tab-index").props.children).toContain(de.supplier.tabs.home)
    expect(screen.getByTestId("tab-requests").props.children).toContain(de.supplier.tabs.requests)
    expect(screen.getByTestId("tab-catalog").props.children).toContain(de.supplier.tabs.catalog)
    expect(screen.getByTestId("tab-profile").props.children).toContain(de.shared.tabs.profile)
    expect(screen.getByTestId("tab-settings").props.children).toContain(de.shared.tabs.settings)
    expect(screen.queryByText(de.funeralHome.tabs.discover)).toBeNull()
    expect(screen.queryByText(de.funeralHome.tabs.quotes)).toBeNull()
  })
})
