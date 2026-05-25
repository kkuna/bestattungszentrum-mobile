import { PropsWithChildren } from "react"
import { Redirect } from "expo-router"

import { isBusinessRouteBlocked } from "@/domain/account/accountAccess"
import { useSession } from "@/services/session"

export function AuthenticatedSettingsRoute({ children }: PropsWithChildren) {
  const { session } = useSession()

  if (session.status === "signedOut") {
    return <Redirect href="/" />
  }

  if (session.status !== "authenticated") {
    return null
  }

  // Restricted or wrong-role accounts are gated out of business routes; settings
  // follow the same gate. The account-status panel still offers a sign-out path.
  if (isBusinessRouteBlocked(session.session)) {
    return <Redirect href="/account-status" />
  }

  return <>{children}</>
}
