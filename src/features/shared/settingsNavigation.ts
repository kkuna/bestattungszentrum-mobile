import type { AuthenticatedSession } from "@/services/session/types"

export function getSettingsRouteForSession(
  session:
    | {
        status: "authenticated"
        session: AuthenticatedSession
      }
    | {
        status: "booting" | "offline" | "signedOut"
        session: null
      },
) {
  if (session.status !== "authenticated") {
    return "/account-status"
  }

  return session.session.role === "SUPPLIER_USER" ? "/supplier/settings" : "/funeral-home/settings"
}
