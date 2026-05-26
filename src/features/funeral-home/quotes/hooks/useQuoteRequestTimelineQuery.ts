import { useQuery } from "@tanstack/react-query"

import { timelineApi } from "@/services/api/timelineApi"
import type { ApiFailure, RequestTimelineEventDto } from "@/services/api/types"
import { queryKeys, normalizeRfqContextId } from "@/services/query/queryKeys"

export function useQuoteRequestTimelineQuery(requestId: string | undefined) {
  const normalizedRequestId = normalizeRfqContextId(requestId)

  return useQuery<RequestTimelineEventDto[], ApiFailure>({
    enabled: !!normalizedRequestId,
    queryKey: queryKeys.requests.timeline(normalizedRequestId),
    queryFn: async () => {
      const result = await timelineApi.getQuoteRequestTimeline(normalizedRequestId ?? "")

      if (result.ok) {
        return result.data
      }

      throw result
    },
  })
}
