import { AuthenticatedSettingsRoute } from "@/features/shared/AuthenticatedSettingsRoute"
import { SettingsPlaceholderScreen } from "@/features/shared/SettingsPlaceholderScreen"

export default function OfflineSettingsRoute() {
  return (
    <AuthenticatedSettingsRoute>
      <SettingsPlaceholderScreen kind="offline" />
    </AuthenticatedSettingsRoute>
  )
}
