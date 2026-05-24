import { PlaceholderScreen } from "@/features/shared/PlaceholderScreen"

export function SupplierRequestsPlaceholderScreen() {
  return (
    <PlaceholderScreen
      eyebrowTx="supplier:requests.eyebrow"
      titleTx="supplier:requests.title"
      bodyTx="supplier:requests.body"
      statusTx="supplier:requests.status"
    />
  )
}
