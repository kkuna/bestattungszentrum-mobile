import { fireEvent, render, waitFor } from "@testing-library/react-native"
import i18n from "i18next"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import { useSession } from "@/services/session"
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

const mockPush = jest.fn()

jest.mock("expo-router", () => ({
  router: {
    push: mockPush,
  },
}))

jest.mock("@/i18n/translate", () => ({
  translate: (key: string) => {
    const catalog = jest.requireActual("@/i18n/de").default
    const [namespace, path] = key.split(":")
    return path.split(".").reduce((value, segment) => value?.[segment], catalog[namespace]) ?? key
  },
}))

jest.mock("@/services/session", () => ({
  useSession: jest.fn(),
}))

const activeSession = {
  isAuthenticated: true,
  accessTokenExpiresAt: "2026-05-24T12:15:00.000Z",
  refreshTokenExpiresAt: "2026-06-23T12:00:00.000Z",
  userId: "user-1",
  email: "owner@example.com",
  role: "FUNERAL_HOME_USER",
  tenantId: "tenant-1",
  accountStatus: "ACTIVE",
  userStatus: "ACTIVE",
  languagePreference: "de",
} as const

function mockUseSession(overrides: Partial<ReturnType<typeof useSession>> = {}) {
  jest.mocked(useSession).mockReturnValue({
    session: { status: "authenticated", session: activeSession },
    login: jest.fn(),
    retryHydration: jest.fn(),
    signOut: jest.fn(),
    changeLanguagePreference: jest.fn(async () => ({ ok: true as const, data: activeSession })),
    ...overrides,
  })
}

function renderWithProviders(element: React.ReactElement) {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>{element}</ThemeProvider>
    </SafeAreaProvider>,
  )
}

describe("shared settings screens", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession()
  })

  it("renders localized settings rows and opens shared settings and legal routes", () => {
    const { SettingsListScreen } = require("./SettingsListScreen")

    const screen = renderWithProviders(<SettingsListScreen role="funeralHome" />)

    fireEvent.press(screen.getByLabelText(de.shared.settings.rows.language.accessibilityLabel))
    expect(mockPush).toHaveBeenCalledWith("/settings/language")

    fireEvent.press(screen.getByLabelText(de.shared.settings.rows.privacy.accessibilityLabel))
    expect(mockPush).toHaveBeenCalledWith("/legal/privacy")
  })

  it("persists language selection and changes i18n language", async () => {
    const changeLanguagePreference = jest.fn(async () => ({
      ok: true as const,
      data: activeSession,
    }))
    mockUseSession({ changeLanguagePreference })
    const { LanguageSettingsScreen } = require("./LanguageSettingsScreen")

    const screen = renderWithProviders(<LanguageSettingsScreen />)

    fireEvent.press(screen.getByLabelText(de.shared.settings.language.englishAccessibilityLabel))

    await waitFor(() => {
      expect(changeLanguagePreference).toHaveBeenCalledWith("en")
      expect(i18n.changeLanguage).toHaveBeenCalledWith("en")
    })
  })

  it("exposes session sign-out through useSession", () => {
    const signOut = jest.fn()
    mockUseSession({ signOut })
    const { SessionSecurityScreen } = require("./SessionSecurityScreen")

    const screen = renderWithProviders(<SessionSecurityScreen />)

    fireEvent.press(screen.getByText(de.auth.session.logoutAction))

    expect(signOut).toHaveBeenCalledTimes(1)
  })
})
