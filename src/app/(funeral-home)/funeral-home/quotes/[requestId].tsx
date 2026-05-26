import { useLocalSearchParams } from "expo-router"

import { FuneralHomeQuoteRequestDetailScreen } from "@/features/funeral-home/quotes/FuneralHomeQuoteRequestDetailScreen"

export default function FuneralHomeQuoteRequestDetailRoute() {
  const params = useLocalSearchParams<{ requestId?: string | string[] }>()
  const requestId = Array.isArray(params.requestId) ? params.requestId[0] : params.requestId

  return <FuneralHomeQuoteRequestDetailScreen requestId={requestId} />
}
