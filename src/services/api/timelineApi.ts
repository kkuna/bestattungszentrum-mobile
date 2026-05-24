import { z } from "zod"

import { normalizeApiResponse, normalizeInput, type ApiClientLike } from "./apiResult"
import { pathIdSchema, requestTimelineEventSchema } from "./schemas"
import type { AppApiResult, RequestTimelineEventDto } from "./types"

import { api } from "."

const timelineSchema = z.array(requestTimelineEventSchema)

export const timelineApi = {
  async getQuoteRequestTimeline(
    quoteRequestId: string,
    client: ApiClientLike = api,
  ): Promise<AppApiResult<RequestTimelineEventDto[]>> {
    const validatedQuoteRequestId = normalizeInput(quoteRequestId, pathIdSchema)
    if (!validatedQuoteRequestId.ok) return validatedQuoteRequestId

    const response = await client.apisauce.get(
      `/api/mobile/quote-requests/${encodeURIComponent(validatedQuoteRequestId.data)}/timeline`,
    )
    return normalizeApiResponse(response, timelineSchema, { forbiddenMeansAuth: true })
  },
}
