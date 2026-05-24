import { Redirect, Slot } from "expo-router"

import { getRouteAccessDecision } from "@/domain/account/accountAccess"
import { useSession } from "@/services/session"

export default function SupplierLayout() {
  const { session } = useSession()

  if (session.status === "signedOut") {
    return <Redirect href="/" />
  }

  if (session.status === "authenticated") {
    const decision = getRouteAccessDecision(session.session, "supplier")

    if (!decision.allowed) {
      return <Redirect href={decision.redirectPath ?? "/account-status"} />
    }
  }

  return <Slot />
}
