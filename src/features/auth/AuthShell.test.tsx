import { NavigationContainer } from "@react-navigation/native"
import { fireEvent, render } from "@testing-library/react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import en from "@/i18n/en"
import { ThemeProvider } from "@/theme/context"

const mockRouterPush = jest.fn()
let mockLanguage: "de" | "en" = "de"

function mockReadTranslation(catalog: Record<string, any>, key: string) {
  const [namespace, path] = key.split(":")
  return path.split(".").reduce((value, segment) => value?.[segment], catalog[namespace]) ?? key
}

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
  Slot: () => null,
  router: {
    push: mockRouterPush,
  },
}))

jest.mock("@/i18n/translate", () => ({
  translate: (key: string) => {
    const deCatalog = jest.requireActual("@/i18n/de").default
    const enCatalog = jest.requireActual("@/i18n/en").default
    return mockReadTranslation(mockLanguage === "de" ? deCatalog : enCatalog, key)
  },
}))

jest.mock("@/screens/WelcomeScreen", () => ({
  WelcomeScreen: () => null,
}))

jest.mock("@/features/auth/LoginScreen", () => {
  const { Text } = require("react-native")

  return {
    LoginScreen: () => <Text testID="login-feature-screen">Login feature</Text>,
  }
})

function renderWithProviders(element: React.ReactElement) {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>{element}</NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>,
  )
}

describe("auth route shell", () => {
  beforeEach(() => {
    mockRouterPush.mockClear()
    mockLanguage = "de"
  })

  it("uses the auth group index as the unauthenticated startup experience", () => {
    const AuthIndexRoute = require("@/app/(auth)/index").default

    const { getByText, queryByText } = renderWithProviders(<AuthIndexRoute />)

    expect(queryByText(de.welcomeScreen.readyForLaunch)).toBeNull()
    expect(getByText(de.auth.entry.title)).toBeTruthy()
  })

  it("renders required unauthenticated entry points and navigates to each route", () => {
    const { AuthEntryScreen } = require("./AuthEntryScreen")

    const entry = renderWithProviders(<AuthEntryScreen />)

    fireEvent.press(entry.getByText(de.auth.entry.loginAction))
    expect(mockRouterPush).toHaveBeenLastCalledWith("/login")

    fireEvent.press(entry.getByText(de.auth.entry.signupAction))
    expect(mockRouterPush).toHaveBeenLastCalledWith("/signup")

    fireEvent.press(entry.getByText(de.auth.entry.forgotPasswordAction))
    expect(mockRouterPush).toHaveBeenLastCalledWith("/forgot-password")

    fireEvent.press(entry.getByText(de.auth.entry.legalAction))
    expect(mockRouterPush).toHaveBeenLastCalledWith("/legal/impressum")
  })

  it("defines localized shell and forgot-password copy", () => {
    expect(en.auth.entry.title).toBe("Workspace access")
    expect(en.auth.forgotPassword.pendingMessage).toContain("not available")
    expect(de.auth.entry.title).toBe("Zugang zum Arbeitsbereich")
    expect(de.auth.forgotPassword.pendingMessage).toContain("nicht verfügbar")
  })

  it("renders resolved English shell copy when English is selected", () => {
    mockLanguage = "en"
    const { AuthEntryScreen } = require("./AuthEntryScreen")

    const entry = renderWithProviders(<AuthEntryScreen />)

    expect(entry.getByText(en.auth.entry.title)).toBeTruthy()
    expect(entry.getByText(en.auth.entry.loginAction)).toBeTruthy()
  })

  it("renders the pending forgot-password state", () => {
    const { ForgotPasswordScreen } = require("./ForgotPasswordScreen")

    const forgotPassword = renderWithProviders(<ForgotPasswordScreen />)
    expect(forgotPassword.getByText(de.auth.forgotPassword.pendingTitle)).toBeTruthy()
    expect(forgotPassword.getByText(de.auth.forgotPassword.pendingMessage)).toBeTruthy()
  })

  it("keeps auth route files as thin feature wrappers", () => {
    const LoginRoute = require("@/app/(auth)/login").default

    const { getByTestId } = renderWithProviders(<LoginRoute />)

    expect(getByTestId("login-feature-screen")).toBeTruthy()
  })
})
