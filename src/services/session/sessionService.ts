import type { SupportedLocaleTag } from "@/i18n/locale"
import { api } from "@/services/api"
import { failureForProblem } from "@/services/api/apiProblem"
import { authApi } from "@/services/api/authApi"
import type { LoginInputDto } from "@/services/api/types"

import { getSessionAccessTokenForApi } from "./accessTokenProvider"
import { sessionStorage } from "./sessionStorage"
import type {
  AuthenticatedSession,
  HydrateSessionResult,
  LanguagePreferenceSessionResult,
  LoginSessionResult,
  LogoutSessionResult,
  PersistedSession,
  SessionState,
} from "./types"

type SessionStorageLike = typeof sessionStorage
type AuthApiLike = Pick<
  typeof authApi,
  "getCurrentUser" | "login" | "logout" | "logoutAll" | "refreshSession"
>

type SessionServiceDependencies = {
  storage?: SessionStorageLike
  auth?: AuthApiLike
}

type RefreshSessionOptions = {
  clearOnFailure?: boolean
}

type SessionStateListener = (state: SessionState) => void

function redactSession(session: PersistedSession): AuthenticatedSession {
  const { accessToken: _accessToken, refreshToken: _refreshToken, ...safeSession } = session

  return {
    ...safeSession,
    isAuthenticated: true,
  }
}

function isExpired(isoDate: string, now = new Date()): boolean {
  const timestamp = Date.parse(isoDate)

  if (Number.isNaN(timestamp)) return true

  return timestamp <= now.getTime()
}

function isRecoverableConnectivityProblem(problem: string): boolean {
  return problem === "network" || problem === "timeout" || problem === "server"
}

export function createSessionService({
  storage = sessionStorage,
  auth = authApi,
}: SessionServiceDependencies = {}) {
  const listeners = new Set<SessionStateListener>()

  function readSessionState(): SessionState {
    const persistedSession = storage.loadSession()

    if (!persistedSession) {
      return { isAuthenticated: false }
    }

    return redactSession(persistedSession)
  }

  function emitSessionState() {
    const state = readSessionState()
    listeners.forEach((listener) => listener(state))
  }

  function clearSessionAndNotify() {
    storage.clearSession()
    emitSessionState()
  }

  const service = {
    async login(
      input: LoginInputDto,
      languagePreference: SupportedLocaleTag,
    ): Promise<LoginSessionResult> {
      const result = await auth.login(input)
      if (!result.ok) return result

      if (!storage.saveSession(result.data, languagePreference)) {
        return failureForProblem("unknown")
      }

      const persistedSession = storage.loadSession()
      if (!persistedSession) {
        return failureForProblem("unknown")
      }

      const session = redactSession(persistedSession)
      emitSessionState()

      return { ok: true, data: session }
    },

    async refreshSession({
      clearOnFailure = true,
    }: RefreshSessionOptions = {}): Promise<LoginSessionResult> {
      const persistedSession = storage.loadSession()

      if (!persistedSession || isExpired(persistedSession.refreshTokenExpiresAt)) {
        clearSessionAndNotify()
        return failureForProblem("auth", 401)
      }

      try {
        const result = await auth.refreshSession({ refreshToken: persistedSession.refreshToken })
        if (!result.ok) {
          if (clearOnFailure) clearSessionAndNotify()
          return result
        }

        if (!storage.saveSession(result.data, persistedSession.languagePreference)) {
          if (clearOnFailure) clearSessionAndNotify()
          return failureForProblem("unknown")
        }

        const refreshedSession = storage.loadSession()
        if (!refreshedSession) {
          if (clearOnFailure) clearSessionAndNotify()
          return failureForProblem("unknown")
        }

        const session = redactSession(refreshedSession)
        emitSessionState()

        return { ok: true, data: session }
      } catch {
        if (clearOnFailure) {
          clearSessionAndNotify()
          return failureForProblem("unknown")
        }

        return failureForProblem("network")
      }
    },

    async hydrateSession(): Promise<HydrateSessionResult> {
      const persistedSession = storage.loadSession()

      if (!persistedSession) {
        clearSessionAndNotify()
        return { status: "signedOut" }
      }

      if (isExpired(persistedSession.refreshTokenExpiresAt)) {
        clearSessionAndNotify()
        return { status: "signedOut" }
      }

      if (isExpired(persistedSession.accessTokenExpiresAt)) {
        const refreshResult = await service.refreshSession({ clearOnFailure: false })

        if (!refreshResult.ok) {
          if (isRecoverableConnectivityProblem(refreshResult.problem)) {
            return { status: "offline", messageKey: refreshResult.messageKey }
          }

          clearSessionAndNotify()
          return { status: "signedOut" }
        }
      }

      try {
        const currentUserResult = await auth.getCurrentUser()

        if (currentUserResult.ok) {
          storage.updateAccountSnapshot(currentUserResult.data)
          const latestSession = storage.loadSession()

          if (!latestSession) {
            clearSessionAndNotify()
            return { status: "signedOut" }
          }

          return { status: "authenticated", session: redactSession(latestSession) }
        }

        if (isRecoverableConnectivityProblem(currentUserResult.problem)) {
          return { status: "offline", messageKey: currentUserResult.messageKey }
        }

        const refreshResult = await service.refreshSession({ clearOnFailure: false })

        if (refreshResult.ok) {
          return { status: "authenticated", session: refreshResult.data }
        }

        if (isRecoverableConnectivityProblem(refreshResult.problem)) {
          return { status: "offline", messageKey: refreshResult.messageKey }
        }

        clearSessionAndNotify()
        return { status: "signedOut" }
      } catch {
        return { status: "offline", messageKey: failureForProblem("unknown").messageKey }
      }
    },

    getSessionState(): SessionState {
      return readSessionState()
    },

    getAccessTokenForApi(): string | null {
      return getSessionAccessTokenForApi(storage)
    },

    async updateLanguagePreference(
      languagePreference: SupportedLocaleTag,
    ): Promise<LanguagePreferenceSessionResult> {
      if (!storage.updateLanguagePreference(languagePreference)) {
        return failureForProblem("unknown")
      }

      const persistedSession = storage.loadSession()
      if (!persistedSession) {
        clearSessionAndNotify()
        return failureForProblem("auth", 401)
      }

      const session = redactSession(persistedSession)
      emitSessionState()

      return { ok: true, data: session }
    },

    clearLocalSession(): void {
      clearSessionAndNotify()
    },

    subscribe(listener: SessionStateListener): () => void {
      listeners.add(listener)

      return () => listeners.delete(listener)
    },

    async logout(): Promise<LogoutSessionResult> {
      const persistedSession = storage.loadSession()
      clearSessionAndNotify()

      if (persistedSession) {
        await auth.logout({ refreshToken: persistedSession.refreshToken })
      }

      return { ok: true, data: { isAuthenticated: false } }
    },

    async logoutAll(): Promise<LogoutSessionResult> {
      const persistedSession = storage.loadSession()

      if (!persistedSession) {
        clearSessionAndNotify()
        return { ok: true, data: { isAuthenticated: false } }
      }

      try {
        const result = await auth.logoutAll()
        if (!result.ok) return result
      } catch {
        return failureForProblem("unknown")
      } finally {
        clearSessionAndNotify()
      }

      return { ok: true, data: { isAuthenticated: false } }
    },
  }

  return service
}

export const sessionService = createSessionService()

api.setUnauthorizedHandler(async () => {
  const result = await sessionService.refreshSession()

  return result.ok
})

api.setUnauthorizedFailureHandler(() => {
  sessionService.clearLocalSession()
})
