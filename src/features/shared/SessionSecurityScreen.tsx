import { router } from "expo-router"

import { PlaceholderScreen } from "@/features/shared/PlaceholderScreen"
import { useSession } from "@/services/session"

import { getSettingsRouteForSession } from "./settingsNavigation"

export function SessionSecurityScreen() {
  const { session, signOut } = useSession()

  return (
    <PlaceholderScreen
      eyebrowTx="shared:settings.sessionSecurity.eyebrow"
      titleTx="shared:settings.sessionSecurity.title"
      bodyTx="shared:settings.sessionSecurity.body"
      statusTx="shared:settings.sessionSecurity.status"
      actions={[{ tx: "auth:session.logoutAction", onPress: signOut, preset: "reversed" }]}
      showBack
      backAccessibilityLabelTx="shared:settings.language.backAccessibilityLabel"
      onBackPress={() => {
        router.replace(getSettingsRouteForSession(session))
      }}
    />
  )
}
