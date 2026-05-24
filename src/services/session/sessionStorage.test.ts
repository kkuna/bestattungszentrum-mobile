import type { MobileAuthTokensDto } from "@/services/api/types"

import { createSessionStorage } from "./sessionStorage"
import type { PersistedSession } from "./types"

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

function createMemoryBackend(initialValue?: string) {
  let value = initialValue

  return {
    delete: jest.fn(() => {
      value = undefined
    }),
    getString: jest.fn(() => value),
    set: jest.fn((_key: string, nextValue: string) => {
      value = nextValue
    }),
  }
}

describe("sessionStorage", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-05-24T12:00:00.000Z"))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("saves and loads a validated session with absolute expiry timestamps", () => {
    const backend = createMemoryBackend()
    const storage = createSessionStorage(backend)

    expect(storage.saveSession(authTokens, "de")).toBe(true)

    expect(storage.loadSession()).toEqual({
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
    })
  })

  it("updates language preference without changing token fields", () => {
    const backend = createMemoryBackend()
    const storage = createSessionStorage(backend)

    storage.saveSession(authTokens, "de")
    expect(storage.updateLanguagePreference("en")).toBe(true)

    expect(storage.loadSession()).toMatchObject({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      languagePreference: "en",
    })
  })

  it("updates language preference even when the method is called unbound", () => {
    const backend = createMemoryBackend()
    const storage = createSessionStorage(backend)

    storage.saveSession(authTokens, "de")
    const { updateLanguagePreference } = storage

    expect(updateLanguagePreference("en")).toBe(true)
    expect(storage.loadSession()).toMatchObject({ languagePreference: "en" })
  })

  it("clears malformed persisted data and returns null", () => {
    const backend = createMemoryBackend(JSON.stringify({ accessToken: "missing-required-fields" }))
    const storage = createSessionStorage(backend)

    expect(storage.loadSession()).toBeNull()
    expect(backend.delete).toHaveBeenCalledTimes(1)
  })

  it("clears stored session data", () => {
    const backend = createMemoryBackend()
    const storage = createSessionStorage(backend)

    storage.saveSession(authTokens, "de")
    storage.clearSession()

    expect(storage.loadSession()).toBeNull()
  })

  it("does not expose token key names through the public API", () => {
    const storage = createSessionStorage(createMemoryBackend())

    expect(Object.keys(storage).sort()).toEqual([
      "clearSession",
      "loadSession",
      "saveSession",
      "updateAccountSnapshot",
      "updateLanguagePreference",
    ])
  })

  it("can be seeded from a fully persisted session payload", () => {
    const persisted: PersistedSession = {
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
    const storage = createSessionStorage(createMemoryBackend(JSON.stringify(persisted)))

    expect(storage.loadSession()).toEqual(persisted)
  })

  it("keeps sessions valid when the backend has not provided account status yet", () => {
    const backend = createMemoryBackend()
    const storage = createSessionStorage(backend)

    const tokensWithoutStatuses: MobileAuthTokensDto = {
      ...authTokens,
      user: {
        id: "user-1",
        email: "owner@example.com",
        role: "FUNERAL_HOME_USER",
        tenantId: "tenant-1",
      },
    }

    expect(storage.saveSession(tokensWithoutStatuses, "de")).toBe(true)
    expect(storage.loadSession()).toMatchObject({
      role: "FUNERAL_HOME_USER",
      tenantId: "tenant-1",
    })
    expect(storage.loadSession()).not.toHaveProperty("accountStatus")
    expect(storage.loadSession()).not.toHaveProperty("verificationStatus")
    expect(storage.loadSession()).not.toHaveProperty("userStatus")
  })

  it("clears persisted sessions with unchecked account status values", () => {
    const persisted = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      accessTokenExpiresAt: "2026-05-24T12:15:00.000Z",
      refreshTokenExpiresAt: "2026-06-23T12:00:00.000Z",
      userId: "user-1",
      email: "owner@example.com",
      role: "FUNERAL_HOME_USER",
      tenantId: "tenant-1",
      accountStatus: "RAW_BACKEND_VALUE",
      languagePreference: "de",
    }
    const backend = createMemoryBackend(JSON.stringify(persisted))
    const storage = createSessionStorage(backend)

    expect(storage.loadSession()).toBeNull()
    expect(backend.delete).toHaveBeenCalledTimes(1)
  })

  it("updates only safe account snapshot fields", () => {
    const backend = createMemoryBackend()
    const storage = createSessionStorage(backend)

    storage.saveSession(authTokens, "de")

    expect(
      storage.updateAccountSnapshot({
        id: "user-1",
        email: "owner@example.com",
        role: "FUNERAL_HOME_USER",
        tenantId: "tenant-1",
        accountStatus: "PENDING_REVIEW",
        verificationStatus: "FAILED",
        userStatus: "PENDING",
        permissions: ["quote-requests:create"],
      }),
    ).toBe(true)

    expect(storage.loadSession()).toMatchObject({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      accountStatus: "PENDING_REVIEW",
      verificationStatus: "FAILED",
      userStatus: "PENDING",
    })
  })

  it("preserves existing account statuses when current-user does not include them", () => {
    const backend = createMemoryBackend()
    const storage = createSessionStorage(backend)

    storage.saveSession(authTokens, "de")

    expect(
      storage.updateAccountSnapshot({
        id: "user-1",
        email: "owner@example.com",
        role: "FUNERAL_HOME_USER",
        tenantId: "tenant-1",
        permissions: ["quote-requests:create"],
      }),
    ).toBe(true)

    expect(storage.loadSession()).toMatchObject({
      accountStatus: "ACTIVE",
      verificationStatus: "VERIFIED",
      userStatus: "ACTIVE",
    })
  })

  it("keeps tenantless back-office sessions loadable for fail-closed routing", () => {
    const tenantlessBackOfficeSession: PersistedSession = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      accessTokenExpiresAt: "2026-05-24T12:15:00.000Z",
      refreshTokenExpiresAt: "2026-06-23T12:00:00.000Z",
      userId: "user-admin",
      email: "admin@example.com",
      role: "ADMIN",
      tenantId: null,
      languagePreference: "de",
    }
    const storage = createSessionStorage(
      createMemoryBackend(JSON.stringify(tenantlessBackOfficeSession)),
    )

    expect(storage.loadSession()).toEqual(tenantlessBackOfficeSession)
  })
})
