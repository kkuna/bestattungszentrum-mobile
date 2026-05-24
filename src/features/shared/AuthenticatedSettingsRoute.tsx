import { PropsWithChildren } from "react"
import { Redirect } from "expo-router"

import { useSession } from "@/services/session"

export function AuthenticatedSettingsRoute({ children }: PropsWithChildren) {
  const { session } = useSession()

  if (session.status === "signedOut") {
    return <Redirect href="/" />
  }

  if (session.status !== "authenticated") {
    return null
  }

  return <>{children}</>
}
