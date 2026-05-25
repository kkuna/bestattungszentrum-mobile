import { PropsWithChildren, useEffect, useRef } from "react"
import { QueryClientProvider } from "@tanstack/react-query"

import { useSession } from "@/services/session/sessionProvider"

import { queryClient } from "./queryClient"

export function QueryProvider({ children }: PropsWithChildren) {
  const { session } = useSession()
  const hasObservedSessionScope = useRef(false)
  const previousSessionScope = useRef<string | null>(null)

  const sessionScope =
    session.status === "authenticated"
      ? `${session.session.userId}:${session.session.tenantId ?? "no-tenant"}`
      : null

  useEffect(() => {
    if (!hasObservedSessionScope.current) {
      hasObservedSessionScope.current = true
      previousSessionScope.current = sessionScope
      return
    }

    if (previousSessionScope.current === sessionScope) return

    queryClient.clear()
    previousSessionScope.current = sessionScope
  }, [sessionScope])

  return (
    <QueryClientProvider client={queryClient}>
      <QuerySessionScope key={sessionScope ?? "signed-out"}>{children}</QuerySessionScope>
    </QueryClientProvider>
  )
}

function QuerySessionScope({ children }: PropsWithChildren) {
  return <>{children}</>
}
