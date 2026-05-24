import { NavigationContainer } from "@react-navigation/native"
import { fireEvent, render, waitFor } from "@testing-library/react-native"
import i18n from "i18next"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import { ThemeProvider } from "@/theme/context"

import { LoginScreen } from "./LoginScreen"

const mockLogin = jest.fn()
const mockRouterReplace = jest.fn()

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

jest.mock("@/i18n/translate", () => ({
  translate: (key: string) => {
    const catalog = jest.requireActual("@/i18n/de").default
    const [namespace, path] = key.split(":")
    return path.split(".").reduce((value, segment) => value?.[segment], catalog[namespace]) ?? key
  },
}))

jest.mock("@/services/session", () => ({
  getWorkspacePathForSession: jest.fn(() => "/funeral-home"),
  useSession: () => ({
    login: mockLogin,
  }),
}))

jest.mock("expo-router", () => ({
  router: {
    replace: (...args: unknown[]) => mockRouterReplace(...args),
  },
}))

function renderLoginScreen() {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <LoginScreen />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>,
  )
}

function pressSubmit(screen: ReturnType<typeof renderLoginScreen>) {
  fireEvent.press(screen.getAllByText(de.auth.login.primaryAction).at(-1)!)
}

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    i18n.language = "de"
  })

  it("submits credentials through the session service", async () => {
    mockLogin.mockResolvedValue({
      ok: true,
      data: {
        isAuthenticated: true,
        userId: "user-1",
        email: "owner@example.com",
        role: "FUNERAL_HOME_USER",
        tenantId: "tenant-1",
        languagePreference: "de",
        accessTokenExpiresAt: "2026-05-24T12:15:00.000Z",
        refreshTokenExpiresAt: "2026-06-23T12:00:00.000Z",
      },
    })

    const screen = renderLoginScreen()

    fireEvent.changeText(
      screen.getByPlaceholderText(de.auth.login.emailPlaceholder),
      "owner@example.com",
    )
    fireEvent.changeText(screen.getByPlaceholderText(de.auth.login.passwordPlaceholder), "secret")
    pressSubmit(screen)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { email: "owner@example.com", password: "secret" },
        "de",
      )
    })
    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith("/funeral-home")
    })
  })

  it("stores the active supported locale with the submitted session", async () => {
    i18n.language = "en-US"
    mockLogin.mockResolvedValue({
      ok: true,
      data: {
        isAuthenticated: true,
        userId: "user-1",
        email: "owner@example.com",
        role: "FUNERAL_HOME_USER",
        tenantId: "tenant-1",
        languagePreference: "en",
        accessTokenExpiresAt: "2026-05-24T12:15:00.000Z",
        refreshTokenExpiresAt: "2026-06-23T12:00:00.000Z",
      },
    })

    const screen = renderLoginScreen()

    fireEvent.changeText(
      screen.getByPlaceholderText(de.auth.login.emailPlaceholder),
      "owner@example.com",
    )
    fireEvent.changeText(screen.getByPlaceholderText(de.auth.login.passwordPlaceholder), "secret")
    pressSubmit(screen)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { email: "owner@example.com", password: "secret" },
        "en",
      )
    })
  })

  it("shows normalized failure copy from i18n", async () => {
    mockLogin.mockResolvedValue({
      ok: false,
      problem: "auth",
      messageKey: "api:error.auth",
      status: 401,
    })

    const screen = renderLoginScreen()

    fireEvent.changeText(
      screen.getByPlaceholderText(de.auth.login.emailPlaceholder),
      "owner@example.com",
    )
    fireEvent.changeText(screen.getByPlaceholderText(de.auth.login.passwordPlaceholder), "wrong")
    pressSubmit(screen)

    expect(await screen.findByText(de.api.error.auth)).toBeTruthy()
  })

  it("shows loading copy and blocks duplicate submissions while login is pending", async () => {
    let resolveLogin: (value: unknown) => void = jest.fn()
    const pendingLogin = new Promise((resolve) => {
      resolveLogin = resolve
    })
    mockLogin.mockReturnValue(pendingLogin)

    const screen = renderLoginScreen()

    fireEvent.changeText(
      screen.getByPlaceholderText(de.auth.login.emailPlaceholder),
      "owner@example.com",
    )
    fireEvent.changeText(screen.getByPlaceholderText(de.auth.login.passwordPlaceholder), "secret")
    pressSubmit(screen)
    pressSubmit(screen)

    expect(await screen.findByText(de.auth.login.submitting)).toBeTruthy()
    expect(mockLogin).toHaveBeenCalledTimes(1)

    resolveLogin({
      ok: true,
      data: {
        isAuthenticated: true,
        userId: "user-1",
        email: "owner@example.com",
        role: "FUNERAL_HOME_USER",
        tenantId: "tenant-1",
        languagePreference: "de",
        accessTokenExpiresAt: "2026-05-24T12:15:00.000Z",
        refreshTokenExpiresAt: "2026-06-23T12:00:00.000Z",
      },
    })

    await waitFor(() => {
      expect(screen.queryByText(de.auth.login.submitting)).toBeNull()
    })
  })

  it("recovers from unexpected login service rejections", async () => {
    mockLogin.mockRejectedValue(new Error("unexpected failure"))

    const screen = renderLoginScreen()

    fireEvent.changeText(
      screen.getByPlaceholderText(de.auth.login.emailPlaceholder),
      "owner@example.com",
    )
    fireEvent.changeText(screen.getByPlaceholderText(de.auth.login.passwordPlaceholder), "secret")
    pressSubmit(screen)

    expect(await screen.findByText(de.api.error.unknown)).toBeTruthy()
    expect(screen.getAllByText(de.auth.login.primaryAction).length).toBeGreaterThan(0)
  })

  it("requires both fields before calling the session service", async () => {
    const screen = renderLoginScreen()

    pressSubmit(screen)

    expect(await screen.findByText(de.auth.login.missingFields)).toBeTruthy()
    expect(mockLogin).not.toHaveBeenCalled()
  })
})
