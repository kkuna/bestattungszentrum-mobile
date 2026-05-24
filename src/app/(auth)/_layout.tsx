import { Redirect, Slot } from "expo-router"

import { getWorkspacePathForSession } from "@/domain/account/accountAccess"
import { useSession } from "@/services/session"

export default function AuthLayout() {
  const { session } = useSession()

  if (session.status === "authenticated") {
    return <Redirect href={getWorkspacePathForSession(session.session)} />
  }

  return <Slot />
}
