import { act, fireEvent, render, waitFor } from "@testing-library/react-native"
import i18n from "i18next"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { Text } from "@/components/Text"
import { normalizeAccountAccess } from "@/domain/account/accountAccess"
import de from "@/i18n/de"
import { ThemeProvider } from "@/theme/context"

import { SessionGate, SessionProvider, useSession } from "./sessionProvider"
import { sessionService } from "./sessionService"

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

jest.mock("./sessionService", () => ({
  sessionService: {
    hydrateSession: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    updateLanguagePreference: jest.fn(),
    subscribe: jest.fn(),
  },
}))

const authenticatedSession = {
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

function renderSession(children: React.ReactNode) {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <SessionProvider>{children}</SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  )
}

function ProtectedContent() {
  return <Text text="Protected content" />
}

function LoginHarness() {
  const { login, session } = useSession()

  return (
    <>
      <Text text={session.status} />
      <Text
        text="Login harness"
        onPress={() => login({ email: "owner@example.com", password: "secret" }, "de")}
      />
    </>
  )
}

function SignOutHarness() {
  const { session, signOut } = useSession()

  return (
    <>
      <Text text={session.status} />
      <Text text="Sign out harness" onPress={signOut} />
    </>
  )
}

function LanguagePreferenceHarness() {
  const { changeLanguagePreference, session } = useSession()

  return (
    <>
      <Text text={session.status} />
      <Text text="Change language harness" onPress={() => changeLanguagePreference("en")} />
    </>
  )
}

describe("SessionProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(sessionService.subscribe).mockImplementation(() => jest.fn())
  })

  it("shows explicit boot state instead of rendering protected content while hydration is pending", () => {
    jest.mocked(sessionService.hydrateSession).mockReturnValue(new Promise(() => {}))

    const screen = renderSession(
      <SessionGate>
        <ProtectedContent />
      </SessionGate>,
    )

    expect(screen.getByText(de.auth.session.bootTitle)).toBeTruthy()
    expect(screen.queryByText("Protected content")).toBeNull()
  })

  it("shows recoverable offline state and retries hydration", async () => {
    jest
      .mocked(sessionService.hydrateSession)
      .mockResolvedValueOnce({ status: "offline", messageKey: "api:error.network" })
      .mockResolvedValueOnce({ status: "signedOut" })

    const screen = renderSession(
      <SessionGate>
        <ProtectedContent />
      </SessionGate>,
    )

    expect(await screen.findByText(de.auth.session.offlineTitle)).toBeTruthy()
    fireEvent.press(screen.getByText(de.auth.session.retryAction))

    await waitFor(() => {
      expect(sessionService.hydrateSession).toHaveBeenCalledTimes(2)
    })
  })

  it("updates provider state after login succeeds without exposing tokens", async () => {
    jest.mocked(sessionService.hydrateSession).mockResolvedValue({ status: "signedOut" })
    jest.mocked(sessionService.login).mockResolvedValue({
      ok: true,
      data: authenticatedSession,
    })

    const screen = renderSession(<LoginHarness />)

    expect(await screen.findByText("signedOut")).toBeTruthy()
    fireEvent.press(screen.getByText("Login harness"))

    expect(await screen.findByText("authenticated")).toBeTruthy()
    expect(JSON.stringify(screen.toJSON())).not.toContain("access-token")
    expect(JSON.stringify(screen.toJSON())).not.toContain("refresh-token")
  })

  it("clears local provider state even when remote logout fails", async () => {
    jest.mocked(sessionService.hydrateSession).mockResolvedValue({
      status: "authenticated",
      session: authenticatedSession,
    })
    jest.mocked(sessionService.logout).mockRejectedValue(new Error("network unavailable"))

    const screen = renderSession(<SignOutHarness />)

    expect(await screen.findByText("authenticated")).toBeTruthy()
    fireEvent.press(screen.getByText("Sign out harness"))

    expect(await screen.findByText("signedOut")).toBeTruthy()
  })

  it("applies persisted language when hydration restores an authenticated session", async () => {
    jest.mocked(sessionService.hydrateSession).mockResolvedValue({
      status: "authenticated",
      session: { ...authenticatedSession, languagePreference: "en" },
    })

    renderSession(<LoginHarness />)

    await waitFor(() => {
      expect(i18n.changeLanguage).toHaveBeenCalledWith("en")
    })
  })

  it("updates language preference through the provider and refreshes local session state", async () => {
    jest.mocked(sessionService.hydrateSession).mockResolvedValue({
      status: "authenticated",
      session: authenticatedSession,
    })
    jest.mocked(sessionService.updateLanguagePreference).mockResolvedValue({
      ok: true,
      data: { ...authenticatedSession, languagePreference: "en" },
    })

    const screen = renderSession(<LanguagePreferenceHarness />)

    expect(await screen.findByText("authenticated")).toBeTruthy()
    fireEvent.press(screen.getByText("Change language harness"))

    await waitFor(() => {
      expect(sessionService.updateLanguagePreference).toHaveBeenCalledWith("en")
      expect(i18n.changeLanguage).toHaveBeenCalledWith("en")
    })
  })

  it("reacts to external session clear events from API refresh failure", async () => {
    let listener: Parameters<typeof sessionService.subscribe>[0] | null = null
    jest.mocked(sessionService.subscribe).mockImplementation((nextListener) => {
      listener = nextListener
      return jest.fn()
    })
    jest.mocked(sessionService.hydrateSession).mockResolvedValue({
      status: "authenticated",
      session: authenticatedSession,
    })

    const screen = renderSession(<LoginHarness />)

    expect(await screen.findByText("authenticated")).toBeTruthy()

    act(() => {
      listener?.({ isAuthenticated: false })
    })

    expect(await screen.findByText("signedOut")).toBeTruthy()
  })

  it.each([
    ["active funeral-home", authenticatedSession, "active", "/funeral-home"],
    ["active supplier", { ...authenticatedSession, role: "SUPPLIER_USER" }, "active", "/supplier"],
    [
      "pending approval",
      { ...authenticatedSession, accountStatus: "PENDING_APPROVAL" },
      "pendingApproval",
      "/account-status",
    ],
    [
      "pending review",
      { ...authenticatedSession, accountStatus: "PENDING_REVIEW" },
      "pendingReview",
      "/account-status",
    ],
    [
      "suspended",
      { ...authenticatedSession, accountStatus: "SUSPENDED" },
      "suspended",
      "/account-status",
    ],
    [
      "verification failed",
      { ...authenticatedSession, verificationStatus: "FAILED" },
      "verificationFailed",
      "/account-status",
    ],
    [
      "unknown missing status",
      { ...authenticatedSession, accountStatus: undefined },
      "unknown",
      "/account-status",
    ],
    [
      "unsupported role",
      { ...authenticatedSession, role: "ADMIN" },
      "wrongRole",
      "/account-status",
    ],
  ] as const)(
    "normalizes %s session access decisions",
    (_name, session, expectedStatus, expectedWorkspacePath) => {
      expect(normalizeAccountAccess(session)).toMatchObject({
        status: expectedStatus,
        workspacePath: expectedWorkspacePath,
      })
    },
  )

  it("normalizes provider unavailable as a blocked access decision", () => {
    expect(normalizeAccountAccess(null)).toMatchObject({
      status: "providerUnavailable",
      workspacePath: "/account-status",
      routeAllowed: false,
    })
  })
})
