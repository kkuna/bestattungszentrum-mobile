import type { SupportedLocaleTag } from "@/i18n/locale"
import type {
  AccountStatusDto,
  AppApiResult,
  UserRoleDto,
  UserStatusDto,
  VerificationStatusDto,
} from "@/services/api/types"

export type PersistedSession = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
  userId: string
  email: string
  role: UserRoleDto
  tenantId?: string | null
  accountStatus?: AccountStatusDto
  verificationStatus?: VerificationStatusDto
  userStatus?: UserStatusDto
  languagePreference: SupportedLocaleTag
}

export type AuthenticatedSession = Omit<PersistedSession, "accessToken" | "refreshToken"> & {
  isAuthenticated: true
}

export type UnauthenticatedSession = {
  isAuthenticated: false
}

export type SessionState = AuthenticatedSession | UnauthenticatedSession

export type LoginSessionResult = AppApiResult<AuthenticatedSession>
export type LanguagePreferenceSessionResult = AppApiResult<AuthenticatedSession>
export type LogoutSessionResult = AppApiResult<UnauthenticatedSession>

export type HydrateSessionResult =
  | {
      status: "authenticated"
      session: AuthenticatedSession
    }
  | {
      status: "signedOut"
    }
  | {
      status: "offline"
      messageKey: AppApiResult<never> extends infer Result
        ? Result extends { ok: false; messageKey: infer MessageKey }
          ? MessageKey
          : never
        : never
    }
