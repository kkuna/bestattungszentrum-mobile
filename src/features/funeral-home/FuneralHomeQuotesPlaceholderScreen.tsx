import { useLocalSearchParams } from "expo-router"

import { PlaceholderScreen } from "@/features/shared/PlaceholderScreen"
import { normalizeSupplierDetailId } from "@/services/api/suppliersApi"

export function FuneralHomeQuotesPlaceholderScreen() {
  const params = useLocalSearchParams()
  const supplierId = normalizeSupplierDetailId(getFirstParam(params.supplierId))
  const isNewRequestEntry = getFirstParam(params.entry) === "new" && !!supplierId

  return (
    <PlaceholderScreen
      eyebrowTx="funeralHome:quotes.eyebrow"
      titleTx={isNewRequestEntry ? "funeralHome:quotes.newTitle" : "funeralHome:quotes.title"}
      bodyTx={isNewRequestEntry ? "funeralHome:quotes.newBody" : "funeralHome:quotes.body"}
      statusTx={isNewRequestEntry ? "funeralHome:quotes.newStatus" : "funeralHome:quotes.status"}
    />
  )
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
