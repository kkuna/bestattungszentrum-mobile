import { AuthenticatedSettingsRoute } from "@/features/shared/AuthenticatedSettingsRoute"
import { SettingsPlaceholderScreen } from "@/features/shared/SettingsPlaceholderScreen"

export default function NotificationSettingsRoute() {
  return (
    <AuthenticatedSettingsRoute>
      <SettingsPlaceholderScreen kind="notifications" />
    </AuthenticatedSettingsRoute>
  )
}
