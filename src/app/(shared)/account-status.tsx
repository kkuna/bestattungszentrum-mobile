import { Redirect } from "expo-router"

import { getWorkspacePathForSession, normalizeAccountAccess } from "@/domain/account/accountAccess"
import { AccountStatusPanel } from "@/features/shared/components/AccountStatusPanel"
import { useSession } from "@/services/session"

export default function AccountStatusRoute() {
  const { session, signOut } = useSession()

  if (session.status === "signedOut") {
    return <Redirect href="/" />
  }

  if (session.status !== "authenticated") {
    return null
  }

  const access = normalizeAccountAccess(session.session)

  if (access.routeAllowed) {
    return <Redirect href={getWorkspacePathForSession(session.session)} />
  }

  return <AccountStatusPanel status={access.status} onSignOut={signOut} />
}
