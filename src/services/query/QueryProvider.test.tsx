import { useEffect } from "react"
import { View } from "react-native"
import { render, waitFor } from "@testing-library/react-native"

import { useSession } from "@/services/session/sessionProvider"
import type { AuthenticatedSession } from "@/services/session/types"

import { queryClient } from "./queryClient"
import { QueryProvider } from "./QueryProvider"

jest.mock("@/services/session/sessionProvider", () => ({
  useSession: jest.fn(),
}))

function authenticatedSession(userId: string, tenantId: string | null) {
  return {
    status: "authenticated",
    session: {
      accessTokenExpiresAt: "2026-05-25T10:00:00.000Z",
      accountStatus: "ACTIVE",
      email: `${userId}@example.com`,
      isAuthenticated: true,
      languagePreference: "de",
      refreshTokenExpiresAt: "2026-05-26T10:00:00.000Z",
      role: "FUNERAL_HOME_USER",
      tenantId,
      userId,
      userStatus: "ACTIVE",
      verificationStatus: "VERIFIED",
    } satisfies AuthenticatedSession,
  }
}

function signedOutSession() {
  return {
    status: "signedOut",
    session: null,
  }
}

function mockSession(
  session: ReturnType<typeof authenticatedSession> | ReturnType<typeof signedOutSession>,
) {
  jest.mocked(useSession).mockReturnValue({ session } as ReturnType<typeof useSession>)
}

function MountProbe({ onMount }: { onMount: () => void }) {
  useEffect(() => {
    onMount()
  }, [onMount])

  return <View testID="child" />
}

describe("QueryProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test("clears query cache when the authenticated session scope changes", async () => {
    const clearSpy = jest.spyOn(queryClient, "clear")
    mockSession(authenticatedSession("user-1", "tenant-1"))

    const screen = render(
      <QueryProvider>
        <View testID="child" />
      </QueryProvider>,
    )

    await waitFor(() => expect(clearSpy).not.toHaveBeenCalled())

    mockSession(authenticatedSession("user-2", "tenant-1"))
    screen.rerender(
      <QueryProvider>
        <View testID="child" />
      </QueryProvider>,
    )

    await waitFor(() => expect(clearSpy).toHaveBeenCalledTimes(1))
  })

  test("remounts children when the authenticated session scope changes", async () => {
    const onMount = jest.fn()
    mockSession(authenticatedSession("user-1", "tenant-1"))

    const screen = render(
      <QueryProvider>
        <MountProbe onMount={onMount} />
      </QueryProvider>,
    )

    await waitFor(() => expect(onMount).toHaveBeenCalledTimes(1))

    mockSession(authenticatedSession("user-2", "tenant-1"))
    screen.rerender(
      <QueryProvider>
        <MountProbe onMount={onMount} />
      </QueryProvider>,
    )

    await waitFor(() => expect(onMount).toHaveBeenCalledTimes(2))
  })

  test("clears query cache across sign-in and sign-out transitions", async () => {
    const clearSpy = jest.spyOn(queryClient, "clear")
    mockSession(signedOutSession())

    const screen = render(
      <QueryProvider>
        <View testID="child" />
      </QueryProvider>,
    )

    await waitFor(() => expect(clearSpy).not.toHaveBeenCalled())

    mockSession(authenticatedSession("user-1", "tenant-1"))
    screen.rerender(
      <QueryProvider>
        <View testID="child" />
      </QueryProvider>,
    )

    await waitFor(() => expect(clearSpy).toHaveBeenCalledTimes(1))

    mockSession(signedOutSession())
    screen.rerender(
      <QueryProvider>
        <View testID="child" />
      </QueryProvider>,
    )

    await waitFor(() => expect(clearSpy).toHaveBeenCalledTimes(2))
  })
})
