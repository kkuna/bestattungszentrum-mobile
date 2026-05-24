import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import i18n from "i18next"

import { PlaceholderScreen } from "@/features/shared/PlaceholderScreen"
import type { SupportedLocaleTag } from "@/i18n/locale"
import type { LoginInputDto } from "@/services/api/types"

import { sessionService } from "./sessionService"
import type {
  AuthenticatedSession,
  LanguagePreferenceSessionResult,
  LoginSessionResult,
} from "./types"

type SessionControllerState =
  | {
      status: "booting"
      session: null
    }
  | {
      status: "signedOut"
      session: null
    }
  | {
      status: "offline"
      session: null
    }
  | {
      status: "authenticated"
      session: AuthenticatedSession
    }

type SessionContextValue = {
  session: SessionControllerState
  login: (
    input: LoginInputDto,
    languagePreference: SupportedLocaleTag,
  ) => Promise<LoginSessionResult>
  changeLanguagePreference: (
    languagePreference: SupportedLocaleTag,
  ) => Promise<LanguagePreferenceSessionResult>
  retryHydration: () => Promise<void>
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<SessionControllerState>({
    status: "booting",
    session: null,
  })

  const hydrate = useCallback(async () => {
    setSession({ status: "booting", session: null })
    const result = await sessionService.hydrateSession()

    if (result.status === "authenticated") {
      await applySessionLanguage(result.session)
      setSession({ status: "authenticated", session: result.session })
      return
    }

    if (result.status === "offline") {
      setSession({ status: "offline", session: null })
      return
    }

    setSession({ status: "signedOut", session: null })
  }, [])

  useEffect(() => {
    let isMounted = true

    async function hydrateWhenMounted() {
      const result = await sessionService.hydrateSession()

      if (!isMounted) return

      if (result.status === "authenticated") {
        await applySessionLanguage(result.session)
        if (!isMounted) return
        setSession({ status: "authenticated", session: result.session })
        return
      }

      if (result.status === "offline") {
        setSession({ status: "offline", session: null })
        return
      }

      setSession({ status: "signedOut", session: null })
    }

    hydrateWhenMounted()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(
    () =>
      sessionService.subscribe((nextSession) => {
        if (nextSession.isAuthenticated) {
          void applySessionLanguage(nextSession)
          setSession({ status: "authenticated", session: nextSession })
          return
        }

        setSession({ status: "signedOut", session: null })
      }),
    [],
  )

  const login = useCallback(
    async (input: LoginInputDto, languagePreference: SupportedLocaleTag) => {
      const result = await sessionService.login(input, languagePreference)

      if (result.ok) {
        void applySessionLanguage(result.data)
        setSession({ status: "authenticated", session: result.data })
      }

      return result
    },
    [],
  )

  const changeLanguagePreference = useCallback(async (languagePreference: SupportedLocaleTag) => {
    const result = await sessionService.updateLanguagePreference(languagePreference)

    if (result.ok) {
      await applySessionLanguage(result.data)
      setSession({ status: "authenticated", session: result.data })
    }

    return result
  }, [])

  const signOut = useCallback(async () => {
    setSession({ status: "signedOut", session: null })

    try {
      await sessionService.logout()
    } catch {
      // Local sign-out must complete even if the remote logout endpoint is unavailable.
    }
  }, [])

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      changeLanguagePreference,
      login,
      retryHydration: hydrate,
      signOut,
    }),
    [changeLanguagePreference, hydrate, login, session, signOut],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

async function applySessionLanguage(session: AuthenticatedSession) {
  try {
    await i18n.changeLanguage(session.languagePreference)
  } catch {
    // Language changes are recoverable; session hydration should still complete.
  }
}

export function useSession() {
  const value = useContext(SessionContext)

  if (!value) {
    throw new Error("useSession must be used within SessionProvider")
  }

  return value
}

export function SessionGate({ children }: PropsWithChildren) {
  const { retryHydration, session, signOut } = useSession()

  if (session.status === "booting") {
    return (
      <PlaceholderScreen
        eyebrowTx="auth:session.eyebrow"
        titleTx="auth:session.bootTitle"
        bodyTx="auth:session.bootBody"
        statusTx="auth:session.bootStatus"
      />
    )
  }

  if (session.status === "offline") {
    return (
      <PlaceholderScreen
        eyebrowTx="auth:session.eyebrow"
        titleTx="auth:session.offlineTitle"
        bodyTx="auth:session.offlineBody"
        statusTx="auth:session.offlineStatus"
        actions={[
          { tx: "auth:session.retryAction", onPress: retryHydration, preset: "reversed" },
          { tx: "auth:session.signOutAction", onPress: signOut },
        ]}
      />
    )
  }

  return <>{children}</>
}
