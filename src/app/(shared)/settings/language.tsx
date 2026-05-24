import { AuthenticatedSettingsRoute } from "@/features/shared/AuthenticatedSettingsRoute"
import { LanguageSettingsScreen } from "@/features/shared/LanguageSettingsScreen"

export default function LanguageSettingsRoute() {
  return (
    <AuthenticatedSettingsRoute>
      <LanguageSettingsScreen />
    </AuthenticatedSettingsRoute>
  )
}
