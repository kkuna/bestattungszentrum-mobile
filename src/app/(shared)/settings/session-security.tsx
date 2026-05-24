import { AuthenticatedSettingsRoute } from "@/features/shared/AuthenticatedSettingsRoute"
import { SessionSecurityScreen } from "@/features/shared/SessionSecurityScreen"

export default function SessionSecurityRoute() {
  return (
    <AuthenticatedSettingsRoute>
      <SessionSecurityScreen />
    </AuthenticatedSettingsRoute>
  )
}
