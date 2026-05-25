import { Redirect, Slot } from "expo-router"

import { getRouteAccessDecision } from "@/domain/account/accountAccess"
import { useSession } from "@/services/session"

export default function SupplierLayout() {
  const { session } = useSession()

  if (session.status === "signedOut") {
    return <Redirect href="/" />
  }

  // Fail closed: only an allowed, authenticated session reaches the protected
  // slot. Booting/offline states render nothing here — SessionGate owns their UI.
  if (session.status !== "authenticated") {
    return null
  }

  const decision = getRouteAccessDecision(session.session, "supplier")
  if (!decision.allowed) {
    return <Redirect href={decision.redirectPath ?? "/account-status"} />
  }

  return <Slot />
}
