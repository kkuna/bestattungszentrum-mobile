import { PlaceholderScreen } from "@/features/shared/PlaceholderScreen"

export function LoginScreen() {
  return (
    <PlaceholderScreen
      eyebrowTx="auth:login.eyebrow"
      titleTx="auth:login.title"
      bodyTx="auth:login.body"
      statusTx="auth:login.status"
      actions={[{ tx: "auth:login.primaryAction", disabled: true, preset: "reversed" }]}
    />
  )
}
