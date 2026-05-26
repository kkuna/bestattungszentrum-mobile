import { useQuery } from "@tanstack/react-query"

import { quoteRequestsApi } from "@/services/api/quoteRequestsApi"
import type { ApiFailure, QuoteRequestListItemDto } from "@/services/api/types"
import { queryKeys } from "@/services/query/queryKeys"

export function useFuneralHomeQuoteRequestsQuery() {
  return useQuery<QuoteRequestListItemDto[], ApiFailure>({
    queryKey: queryKeys.requests.funeralHomeList(),
    refetchOnMount: "always",
    queryFn: async () => {
      const result = await quoteRequestsApi.listFuneralHomeRequests()

      if (result.ok) {
        return result.data
      }

      throw result
    },
  })
}
