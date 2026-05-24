import { sessionStorage } from "./sessionStorage"

type SessionAccessTokenStorage = Pick<typeof sessionStorage, "loadSession">

export function getSessionAccessTokenForApi(
  storage: SessionAccessTokenStorage = sessionStorage,
): string | null {
  return storage.loadSession()?.accessToken ?? null
}
