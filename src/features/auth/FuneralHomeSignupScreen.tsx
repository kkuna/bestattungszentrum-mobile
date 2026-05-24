import { PlaceholderScreen } from "@/features/shared/PlaceholderScreen"

export function FuneralHomeSignupScreen() {
  return (
    <PlaceholderScreen
      eyebrowTx="auth:signup.eyebrow"
      titleTx="auth:signup.title"
      bodyTx="auth:signup.body"
      statusTx="auth:signup.status"
      actions={[{ tx: "auth:signup.primaryAction", disabled: true, preset: "reversed" }]}
    />
  )
}
