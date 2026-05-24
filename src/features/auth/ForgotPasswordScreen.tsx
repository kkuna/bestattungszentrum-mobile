import { PlaceholderScreen } from "@/features/shared/PlaceholderScreen"

export function ForgotPasswordScreen() {
  return (
    <PlaceholderScreen
      eyebrowTx="auth:forgotPassword.eyebrow"
      titleTx="auth:forgotPassword.pendingTitle"
      bodyTx="auth:forgotPassword.pendingMessage"
      statusTx="auth:forgotPassword.status"
      actions={[{ tx: "auth:forgotPassword.primaryAction", disabled: true }]}
    />
  )
}
