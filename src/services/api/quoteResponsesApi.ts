import { normalizeApiResponse, normalizeInput, type ApiClientLike } from "./apiResult"
import {
  createQuoteResponseInputSchema,
  pathIdSchema,
  quoteResponseDecisionInputSchema,
  quoteResponseSchema,
} from "./schemas"
import type {
  AppApiResult,
  CreateQuoteResponseInputDto,
  QuoteResponseDecisionInputDto,
  QuoteResponseDto,
} from "./types"

import { api } from "."

export const quoteResponsesApi = {
  async createQuoteResponse(
    input: CreateQuoteResponseInputDto,
    client: ApiClientLike = api,
  ): Promise<AppApiResult<QuoteResponseDto>> {
    const validated = normalizeInput(input, createQuoteResponseInputSchema)
    if (!validated.ok) return validated

    const response = await client.apisauce.post("/api/mobile/quote-responses", validated.data)
    return normalizeApiResponse(response, quoteResponseSchema, { forbiddenMeansAuth: true })
  },

  async decideQuoteResponse(
    responseId: string,
    input: QuoteResponseDecisionInputDto,
    client: ApiClientLike = api,
  ): Promise<AppApiResult<QuoteResponseDto>> {
    const validatedResponseId = normalizeInput(responseId, pathIdSchema)
    if (!validatedResponseId.ok) return validatedResponseId

    const validated = normalizeInput(input, quoteResponseDecisionInputSchema)
    if (!validated.ok) return validated

    const response = await client.apisauce.post(
      `/api/mobile/quote-responses/${encodeURIComponent(validatedResponseId.data)}/decision`,
      validated.data,
    )
    return normalizeApiResponse(response, quoteResponseSchema, { forbiddenMeansAuth: true })
  },
}
