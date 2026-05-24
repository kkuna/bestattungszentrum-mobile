import { AuthenticatedSettingsRoute } from "@/features/shared/AuthenticatedSettingsRoute"
import { SettingsPlaceholderScreen } from "@/features/shared/SettingsPlaceholderScreen"

export default function ErrorSettingsRoute() {
  return (
    <AuthenticatedSettingsRoute>
      <SettingsPlaceholderScreen kind="error" />
    </AuthenticatedSettingsRoute>
  )
}
