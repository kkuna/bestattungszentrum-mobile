import { useLocalSearchParams } from "expo-router"

import { RfqFormScreen } from "@/features/funeral-home/quotes/RfqFormScreen"

export default function NewFuneralHomeQuoteRoute() {
  const params = useLocalSearchParams()

  return (
    <RfqFormScreen
      categoryId={getFirstParam(params.categoryId)}
      categorySlug={getFirstParam(params.categorySlug)}
      supplierId={getFirstParam(params.supplierId)}
    />
  )
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
