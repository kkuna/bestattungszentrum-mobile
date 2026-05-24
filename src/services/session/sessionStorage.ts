import { MMKV } from "react-native-mmkv"
import { z } from "zod"

import { supportedLocaleTags } from "@/i18n/locale"
import type { SupportedLocaleTag } from "@/i18n/locale"
import {
  accountStatusSchema,
  userRoleSchema,
  userStatusSchema,
  verificationStatusSchema,
} from "@/services/api/schemas"
import type { MobileAuthTokensDto, MobileCurrentUserDto } from "@/services/api/types"

import type { PersistedSession } from "./types"

type SessionStorageBackend = {
  getString: (key: string) => string | undefined | null
  set: (key: string, value: string) => void
  delete: (key: string) => void
}

const SESSION_STORAGE_KEY = "auth.session.v1"

const persistedSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  accessTokenExpiresAt: z.string().datetime({ offset: true }),
  refreshTokenExpiresAt: z.string().datetime({ offset: true }),
  userId: z.string().min(1),
  email: z.string().email(),
  role: userRoleSchema,
  tenantId: z.string().min(1).nullable().optional(),
  accountStatus: accountStatusSchema.optional(),
  verificationStatus: verificationStatusSchema.optional(),
  userStatus: userStatusSchema.optional(),
  languagePreference: z.enum(supportedLocaleTags),
})

function expiresAt(now: Date, seconds: number) {
  return new Date(now.getTime() + seconds * 1000).toISOString()
}

function toPersistedSession(
  tokens: MobileAuthTokensDto,
  languagePreference: SupportedLocaleTag,
  now = new Date(),
): PersistedSession {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpiresAt: expiresAt(now, tokens.expiresInSeconds),
    refreshTokenExpiresAt: expiresAt(now, tokens.refreshExpiresInSeconds),
    userId: tokens.user.id,
    email: tokens.user.email,
    role: tokens.user.role,
    tenantId: tokens.user.tenantId,
    accountStatus: tokens.user.accountStatus,
    verificationStatus: tokens.user.verificationStatus,
    userStatus: tokens.user.userStatus,
    languagePreference,
  }
}

export function createSessionStorage(backend: SessionStorageBackend) {
  function loadSession(): PersistedSession | null {
    try {
      const rawSession = backend.getString(SESSION_STORAGE_KEY)
      if (!rawSession) return null

      const parsedJson = JSON.parse(rawSession) as unknown
      const parsedSession = persistedSessionSchema.safeParse(parsedJson)

      if (!parsedSession.success) {
        backend.delete(SESSION_STORAGE_KEY)
        return null
      }

      return parsedSession.data
    } catch {
      backend.delete(SESSION_STORAGE_KEY)
      return null
    }
  }

  function clearSession(): void {
    try {
      backend.delete(SESSION_STORAGE_KEY)
    } catch {}
  }

  return {
    saveSession(tokens: MobileAuthTokensDto, languagePreference: SupportedLocaleTag): boolean {
      try {
        backend.set(
          SESSION_STORAGE_KEY,
          JSON.stringify(toPersistedSession(tokens, languagePreference)),
        )
        return true
      } catch {
        return false
      }
    },

    loadSession,
    clearSession,

    updateLanguagePreference(languagePreference: SupportedLocaleTag): boolean {
      const currentSession = loadSession()
      if (!currentSession) return false

      try {
        backend.set(SESSION_STORAGE_KEY, JSON.stringify({ ...currentSession, languagePreference }))
        return true
      } catch {
        return false
      }
    },

    updateAccountSnapshot(currentUser: MobileCurrentUserDto): boolean {
      const currentSession = loadSession()
      if (!currentSession) return false

      try {
        const nextSession: PersistedSession = {
          ...currentSession,
          userId: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          tenantId: currentUser.tenantId,
          accountStatus:
            currentUser.accountStatus === undefined
              ? currentSession.accountStatus
              : currentUser.accountStatus,
          verificationStatus:
            currentUser.verificationStatus === undefined
              ? currentSession.verificationStatus
              : currentUser.verificationStatus,
          userStatus:
            currentUser.userStatus === undefined
              ? currentSession.userStatus
              : currentUser.userStatus,
        }

        backend.set(SESSION_STORAGE_KEY, JSON.stringify(nextSession))
        return true
      } catch {
        return false
      }
    },
  }
}

const sessionStorageBackend = new MMKV({ id: "session" })

export const sessionStorage = createSessionStorage(sessionStorageBackend)
