import { render } from "@testing-library/react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import { useSession } from "@/services/session"
import type { AuthenticatedSession } from "@/services/session"
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

jest.mock("expo-router", () => {
  const { Text } = require("react-native")

  return {
    Redirect: ({ href }: { href: string }) => <Text testID="redirect">{href}</Text>,
    Slot: () => <Text testID="slot">slot</Text>,
  }
})

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

const activeFuneralHomeSession: AuthenticatedSession = {
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
}

function mockSession(session: ReturnType<typeof useSession>["session"]) {
  jest.mocked(useSession).mockReturnValue({
    session,
    changeLanguagePreference: jest.fn(),
    login: jest.fn(),
    retryHydration: jest.fn(),
    signOut: jest.fn(),
  })
}

function renderWithProviders(element: React.ReactElement) {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>{element}</ThemeProvider>
    </SafeAreaProvider>,
  )
}

describe("route access layouts", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("routes authenticated users from auth screens by active role or account status", () => {
    const AuthLayout = require("@/app/(auth)/_layout").default

    mockSession({ status: "authenticated", session: activeFuneralHomeSession })
    expect(renderWithProviders(<AuthLayout />).getByTestId("redirect").props.children).toBe(
      "/funeral-home",
    )

    mockSession({
      status: "authenticated",
      session: { ...activeFuneralHomeSession, role: "SUPPLIER_USER" },
    })
    expect(renderWithProviders(<AuthLayout />).getByTestId("redirect").props.children).toBe(
      "/supplier",
    )

    mockSession({
      status: "authenticated",
      session: { ...activeFuneralHomeSession, accountStatus: "PENDING_REVIEW" },
    })
    expect(renderWithProviders(<AuthLayout />).getByTestId("redirect").props.children).toBe(
      "/account-status",
    )
  })

  it("blocks funeral-home protected content for signed-out, wrong-role, and restricted users", () => {
    const FuneralHomeLayout = require("@/app/(funeral-home)/_layout").default

    mockSession({ status: "signedOut", session: null })
    expect(renderWithProviders(<FuneralHomeLayout />).getByTestId("redirect").props.children).toBe(
      "/",
    )

    mockSession({
      status: "authenticated",
      session: { ...activeFuneralHomeSession, role: "SUPPLIER_USER" },
    })
    expect(renderWithProviders(<FuneralHomeLayout />).getByTestId("redirect").props.children).toBe(
      "/supplier",
    )

    mockSession({
      status: "authenticated",
      session: { ...activeFuneralHomeSession, accountStatus: "SUSPENDED" },
    })
    expect(renderWithProviders(<FuneralHomeLayout />).getByTestId("redirect").props.children).toBe(
      "/account-status",
    )

    mockSession({ status: "authenticated", session: activeFuneralHomeSession })
    expect(renderWithProviders(<FuneralHomeLayout />).getByTestId("slot")).toBeTruthy()
  })

  it("blocks supplier protected content for signed-out, wrong-role, and restricted users", () => {
    const SupplierLayout = require("@/app/(supplier)/_layout").default

    mockSession({ status: "signedOut", session: null })
    expect(renderWithProviders(<SupplierLayout />).getByTestId("redirect").props.children).toBe("/")

    mockSession({ status: "authenticated", session: activeFuneralHomeSession })
    expect(renderWithProviders(<SupplierLayout />).getByTestId("redirect").props.children).toBe(
      "/funeral-home",
    )

    mockSession({
      status: "authenticated",
      session: {
        ...activeFuneralHomeSession,
        role: "SUPPLIER_USER",
        verificationStatus: "FAILED",
      },
    })
    expect(renderWithProviders(<SupplierLayout />).getByTestId("redirect").props.children).toBe(
      "/account-status",
    )

    mockSession({
      status: "authenticated",
      session: { ...activeFuneralHomeSession, role: "SUPPLIER_USER" },
    })
    expect(renderWithProviders(<SupplierLayout />).getByTestId("slot")).toBeTruthy()
  })

  it("renders the shared account-status route without protected workspace content", () => {
    const AccountStatusRoute = require("@/app/(shared)/account-status").default

    mockSession({
      status: "authenticated",
      session: { ...activeFuneralHomeSession, accountStatus: "PENDING_APPROVAL" },
    })

    const route = renderWithProviders(<AccountStatusRoute />)

    expect(route.getByText(de.accountStatus.statuses.pendingApproval.label)).toBeTruthy()
    expect(route.queryByText(de.funeralHome.shell.title)).toBeNull()
    expect(route.queryByText(de.supplier.shell.title)).toBeNull()
  })
})
