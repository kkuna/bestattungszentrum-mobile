import { authApi } from "@/services/api/authApi"
import type { MobileAuthTokensDto } from "@/services/api/types"

import { createSessionService } from "./sessionService"
import type { PersistedSession } from "./types"

jest.mock("@/services/api/authApi", () => ({
  authApi: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    logoutAll: jest.fn(),
    refreshSession: jest.fn(),
  },
}))

const authTokens: MobileAuthTokensDto = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  tokenType: "Bearer",
  expiresInSeconds: 900,
  refreshExpiresInSeconds: 2592000,
  user: {
    id: "user-1",
    email: "owner@example.com",
    role: "FUNERAL_HOME_USER",
    tenantId: "tenant-1",
    accountStatus: "ACTIVE",
    verificationStatus: "VERIFIED",
    userStatus: "ACTIVE",
  },
}

const rotatedTokens: MobileAuthTokensDto = {
  ...authTokens,
  accessToken: "rotated-access-token",
  refreshToken: "rotated-refresh-token",
}

const persistedSession: PersistedSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2026-05-24T12:15:00.000Z",
  refreshTokenExpiresAt: "2026-06-23T12:00:00.000Z",
  userId: "user-1",
  email: "owner@example.com",
  role: "FUNERAL_HOME_USER",
  tenantId: "tenant-1",
  accountStatus: "ACTIVE",
  verificationStatus: "VERIFIED",
  userStatus: "ACTIVE",
  languagePreference: "de",
}

const expiredAccessSession: PersistedSession = {
  ...persistedSession,
  accessTokenExpiresAt: "2026-05-24T11:59:00.000Z",
}

const expiredRefreshSession: PersistedSession = {
  ...persistedSession,
  accessTokenExpiresAt: "2026-05-24T11:00:00.000Z",
  refreshTokenExpiresAt: "2026-05-24T11:59:00.000Z",
}

function toPersisted(tokens: MobileAuthTokensDto, languagePreference = "de"): PersistedSession {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpiresAt: "2026-05-24T12:15:00.000Z",
    refreshTokenExpiresAt: "2026-06-23T12:00:00.000Z",
    userId: tokens.user.id,
    email: tokens.user.email,
    role: tokens.user.role,
    tenantId: tokens.user.tenantId,
    accountStatus: tokens.user.accountStatus,
    verificationStatus: tokens.user.verificationStatus,
    userStatus: tokens.user.userStatus,
    languagePreference: languagePreference as PersistedSession["languagePreference"],
  }
}

function createStorageMock(session: PersistedSession | null = null) {
  return {
    clearSession: jest.fn(() => {
      session = null
    }),
    loadSession: jest.fn(() => session),
    saveSession: jest.fn((tokens: MobileAuthTokensDto, languagePreference: "de" | "en") => {
      session = toPersisted(tokens, languagePreference)
      return true
    }),
    updateAccountSnapshot: jest.fn((currentUser) => {
      if (!session) return false
      session = {
        ...session,
        email: currentUser.email,
        role: currentUser.role,
        tenantId: currentUser.tenantId,
        userId: currentUser.id,
        accountStatus: currentUser.accountStatus,
        verificationStatus: currentUser.verificationStatus,
        userStatus: currentUser.userStatus,
      }
      return true
    }),
    updateLanguagePreference: jest.fn((languagePreference: "de" | "en") => {
      if (!session) return false
      session = { ...session, languagePreference }
      return true
    }),
  }
}

describe("sessionService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-05-24T12:00:00.000Z"))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("logs in through authApi, persists validated tokens, and returns redacted session state", async () => {
    jest.mocked(authApi.login).mockResolvedValue({ ok: true, data: authTokens })
    const storage = createStorageMock()
    const service = createSessionService({ storage })

    await expect(
      service.login({ email: "owner@example.com", password: "secret" }, "de"),
    ).resolves.toEqual({
      ok: true,
      data: {
        isAuthenticated: true,
        accessTokenExpiresAt: "2026-05-24T12:15:00.000Z",
        refreshTokenExpiresAt: "2026-06-23T12:00:00.000Z",
        userId: "user-1",
        email: "owner@example.com",
        role: "FUNERAL_HOME_USER",
        tenantId: "tenant-1",
        accountStatus: "ACTIVE",
        verificationStatus: "VERIFIED",
        userStatus: "ACTIVE",
        languagePreference: "de",
      },
    })

    expect(storage.saveSession).toHaveBeenCalledWith(authTokens, "de")
    expect(JSON.stringify(await service.getSessionState())).not.toContain("access-token")
    expect(JSON.stringify(await service.getSessionState())).not.toContain("refresh-token")
  })

  it("does not persist failed login responses", async () => {
    const failure = {
      ok: false,
      problem: "auth",
      messageKey: "api:error.auth",
      status: 401,
    } as const
    jest.mocked(authApi.login).mockResolvedValue(failure)
    const storage = createStorageMock()
    const service = createSessionService({ storage })

    await expect(
      service.login({ email: "owner@example.com", password: "wrong" }, "de"),
    ).resolves.toBe(failure)

    expect(storage.saveSession).not.toHaveBeenCalled()
  })

  it("hydrates a valid stored session after current-user validation", async () => {
    jest.mocked(authApi.getCurrentUser).mockResolvedValue({
      ok: true,
      data: {
        id: "user-1",
        email: "owner@example.com",
        role: "FUNERAL_HOME_USER",
        tenantId: "tenant-1",
        accountStatus: "ACTIVE",
        verificationStatus: "VERIFIED",
        userStatus: "ACTIVE",
        permissions: [],
      },
    })
    const service = createSessionService({ storage: createStorageMock(persistedSession) })

    await expect(service.hydrateSession()).resolves.toEqual({
      status: "authenticated",
      session: expect.objectContaining({ isAuthenticated: true, userId: "user-1" }),
    })

    expect(authApi.getCurrentUser).toHaveBeenCalledTimes(1)
  })

  it("hydrates with safe account fields from the current-user response", async () => {
    jest.mocked(authApi.getCurrentUser).mockResolvedValue({
      ok: true,
      data: {
        id: "user-1",
        email: "owner@example.com",
        role: "FUNERAL_HOME_USER",
        tenantId: "tenant-1",
        accountStatus: "PENDING_REVIEW",
        verificationStatus: "FAILED",
        userStatus: "PENDING",
        permissions: [],
      },
    })
    const storage = createStorageMock({ ...persistedSession, accountStatus: undefined })
    const service = createSessionService({ storage })

    await expect(service.hydrateSession()).resolves.toEqual({
      status: "authenticated",
      session: expect.objectContaining({
        accountStatus: "PENDING_REVIEW",
        verificationStatus: "FAILED",
        userStatus: "PENDING",
      }),
    })

    expect(storage.updateAccountSnapshot).toHaveBeenCalledWith({
      id: "user-1",
      email: "owner@example.com",
      role: "FUNERAL_HOME_USER",
      tenantId: "tenant-1",
      accountStatus: "PENDING_REVIEW",
      verificationStatus: "FAILED",
      userStatus: "PENDING",
      permissions: [],
    })
  })

  it("clears storage during hydration when no session is available", async () => {
    const storage = createStorageMock()
    const service = createSessionService({ storage })

    await expect(service.hydrateSession()).resolves.toEqual({ status: "signedOut" })

    expect(storage.clearSession).toHaveBeenCalledTimes(1)
    expect(authApi.getCurrentUser).not.toHaveBeenCalled()
  })

  it("clears storage during hydration when refresh expiry is past recovery", async () => {
    const storage = createStorageMock(expiredRefreshSession)
    const service = createSessionService({ storage })

    await expect(service.hydrateSession()).resolves.toEqual({ status: "signedOut" })

    expect(storage.clearSession).toHaveBeenCalledTimes(1)
    expect(authApi.refreshSession).not.toHaveBeenCalled()
  })

  it("refreshes an expired access token during hydration and preserves language preference", async () => {
    jest.mocked(authApi.refreshSession).mockResolvedValue({ ok: true, data: rotatedTokens })
    jest.mocked(authApi.getCurrentUser).mockResolvedValue({
      ok: true,
      data: {
        id: "user-1",
        email: "owner@example.com",
        role: "FUNERAL_HOME_USER",
        tenantId: "tenant-1",
        accountStatus: "ACTIVE",
        verificationStatus: "VERIFIED",
        userStatus: "ACTIVE",
        permissions: [],
      },
    })
    const storage = createStorageMock({ ...expiredAccessSession, languagePreference: "en" })
    const service = createSessionService({ storage })

    await expect(service.hydrateSession()).resolves.toEqual({
      status: "authenticated",
      session: expect.objectContaining({
        isAuthenticated: true,
        accessTokenExpiresAt: "2026-05-24T12:15:00.000Z",
        languagePreference: "en",
      }),
    })

    expect(authApi.refreshSession).toHaveBeenCalledWith({ refreshToken: "refresh-token" })
    expect(storage.saveSession).toHaveBeenCalledWith(rotatedTokens, "en")
  })

  it("returns recoverable offline state on current-user network failure during hydration", async () => {
    jest.mocked(authApi.getCurrentUser).mockResolvedValue({
      ok: false,
      problem: "network",
      messageKey: "api:error.network",
    })
    const storage = createStorageMock(persistedSession)
    const service = createSessionService({ storage })

    await expect(service.hydrateSession()).resolves.toEqual({
      status: "offline",
      messageKey: "api:error.network",
    })

    expect(storage.clearSession).not.toHaveBeenCalled()
  })

  it("refreshes stored tokens and returns redacted state", async () => {
    jest.mocked(authApi.refreshSession).mockResolvedValue({ ok: true, data: rotatedTokens })
    const storage = createStorageMock({ ...persistedSession, languagePreference: "en" })
    const service = createSessionService({ storage })

    await expect(service.refreshSession()).resolves.toEqual({
      ok: true,
      data: expect.objectContaining({
        isAuthenticated: true,
        languagePreference: "en",
      }),
    })

    expect(storage.saveSession).toHaveBeenCalledWith(rotatedTokens, "en")
    expect(JSON.stringify(await service.getSessionState())).not.toContain("rotated-access-token")
  })

  it("updates language preference through the service boundary and notifies subscribers", async () => {
    const storage = createStorageMock(persistedSession)
    const service = createSessionService({ storage })
    const listener = jest.fn()

    service.subscribe(listener)

    await expect(service.updateLanguagePreference("en")).resolves.toEqual({
      ok: true,
      data: expect.objectContaining({
        isAuthenticated: true,
        languagePreference: "en",
      }),
    })

    expect(storage.updateLanguagePreference).toHaveBeenCalledWith("en")
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ isAuthenticated: true, languagePreference: "en" }),
    )
    expect(JSON.stringify(await service.getSessionState())).not.toContain("access-token")
  })

  it("clears storage when refresh fails", async () => {
    jest.mocked(authApi.refreshSession).mockResolvedValue({
      ok: false,
      problem: "auth",
      messageKey: "api:error.auth",
      status: 401,
    })
    const storage = createStorageMock(persistedSession)
    const service = createSessionService({ storage })

    await expect(service.refreshSession()).resolves.toEqual({
      ok: false,
      problem: "auth",
      messageKey: "api:error.auth",
      status: 401,
    })

    expect(storage.clearSession).toHaveBeenCalledTimes(1)
  })

  it("notifies subscribers when refresh failure clears the session", async () => {
    jest.mocked(authApi.refreshSession).mockResolvedValue({
      ok: false,
      problem: "auth",
      messageKey: "api:error.auth",
      status: 401,
    })
    const storage = createStorageMock(persistedSession)
    const service = createSessionService({ storage })
    const listener = jest.fn()

    service.subscribe(listener)

    await service.refreshSession()

    expect(listener).toHaveBeenCalledWith({ isAuthenticated: false })
  })

  it("keeps recoverable offline state when expired-access refresh rejects during hydration", async () => {
    jest.mocked(authApi.refreshSession).mockRejectedValue(new Error("network unavailable"))
    const storage = createStorageMock(expiredAccessSession)
    const service = createSessionService({ storage })

    await expect(service.hydrateSession()).resolves.toEqual({
      status: "offline",
      messageKey: "api:error.network",
    })

    expect(storage.clearSession).not.toHaveBeenCalled()
  })

  it("keeps recoverable offline state when validation auth failure cannot refresh online", async () => {
    jest.mocked(authApi.getCurrentUser).mockResolvedValue({
      ok: false,
      problem: "auth",
      messageKey: "api:error.auth",
      status: 401,
    })
    jest.mocked(authApi.refreshSession).mockResolvedValue({
      ok: false,
      problem: "network",
      messageKey: "api:error.network",
    })
    const storage = createStorageMock(persistedSession)
    const service = createSessionService({ storage })

    await expect(service.hydrateSession()).resolves.toEqual({
      status: "offline",
      messageKey: "api:error.network",
    })

    expect(storage.clearSession).not.toHaveBeenCalled()
  })

  it("clears local token material when logout succeeds", async () => {
    jest.mocked(authApi.logout).mockResolvedValue({ ok: true, data: { revoked: true } })
    const storage = createStorageMock(persistedSession)
    const service = createSessionService({ storage })

    await expect(service.logout()).resolves.toEqual({ ok: true, data: { isAuthenticated: false } })

    expect(authApi.logout).toHaveBeenCalledWith({ refreshToken: "refresh-token" })
    expect(storage.clearSession).toHaveBeenCalledTimes(1)
  })

  it("clears local token material when logout-all backend call fails", async () => {
    const storage = createStorageMock(persistedSession)
    jest.mocked(authApi.logoutAll).mockImplementation(async () => {
      expect(storage.loadSession()).toEqual(persistedSession)
      return {
        ok: false,
        problem: "network",
        messageKey: "api:error.network",
      }
    })
    const service = createSessionService({ storage })

    await expect(service.logoutAll()).resolves.toEqual({
      ok: false,
      problem: "network",
      messageKey: "api:error.network",
    })

    expect(storage.clearSession).toHaveBeenCalledTimes(1)
  })

  it("clears local token material when logout backend call fails", async () => {
    jest.mocked(authApi.logout).mockResolvedValue({
      ok: false,
      problem: "network",
      messageKey: "api:error.network",
    })
    const storage = createStorageMock(persistedSession)
    const service = createSessionService({ storage })

    await expect(service.logout()).resolves.toEqual({ ok: true, data: { isAuthenticated: false } })

    expect(storage.clearSession).toHaveBeenCalledTimes(1)
  })

  it("clears local token material when logout backend call rejects", async () => {
    jest.mocked(authApi.logout).mockRejectedValue(new Error("network unreachable"))
    const storage = createStorageMock(persistedSession)
    const service = createSessionService({ storage })

    await expect(service.logout()).rejects.toThrow("network unreachable")

    expect(storage.clearSession).toHaveBeenCalledTimes(1)
  })

  it("clears local token material after logout-all succeeds", async () => {
    const storage = createStorageMock(persistedSession)
    jest.mocked(authApi.logoutAll).mockImplementation(async () => {
      expect(storage.loadSession()).toEqual(persistedSession)
      return { ok: true, data: { revokedCount: 2 } }
    })
    const service = createSessionService({ storage })

    await expect(service.logoutAll()).resolves.toEqual({
      ok: true,
      data: { isAuthenticated: false },
    })

    expect(storage.clearSession).toHaveBeenCalledTimes(1)
  })

  it("returns access token only through the API-facing helper", () => {
    const service = createSessionService({ storage: createStorageMock(persistedSession) })

    expect(service.getAccessTokenForApi()).toBe("access-token")
  })
})
