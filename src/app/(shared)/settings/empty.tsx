import { AuthenticatedSettingsRoute } from "@/features/shared/AuthenticatedSettingsRoute"
import { SettingsPlaceholderScreen } from "@/features/shared/SettingsPlaceholderScreen"

export default function EmptySettingsRoute() {
  return (
    <AuthenticatedSettingsRoute>
      <SettingsPlaceholderScreen kind="empty" />
    </AuthenticatedSettingsRoute>
  )
}
