import { PlaceholderScreen } from "@/features/shared/PlaceholderScreen"
import { useSession } from "@/services/session"

export function SessionSecurityScreen() {
  const { signOut } = useSession()

  return (
    <PlaceholderScreen
      eyebrowTx="shared:settings.sessionSecurity.eyebrow"
      titleTx="shared:settings.sessionSecurity.title"
      bodyTx="shared:settings.sessionSecurity.body"
      statusTx="shared:settings.sessionSecurity.status"
      actions={[{ tx: "auth:session.logoutAction", onPress: signOut, preset: "reversed" }]}
    />
  )
}
