import { z } from "zod"

import { normalizeApiResponse, normalizeInput, type ApiClientLike } from "./apiResult"
import {
  createQuoteRequestInputSchema,
  quoteRequestListItemSchema,
  quoteRequestSchema,
} from "./schemas"
import type {
  AppApiResult,
  CreateQuoteRequestInputDto,
  QuoteRequestDto,
  QuoteRequestListItemDto,
} from "./types"

import { api } from "."

const quoteRequestListSchema = z.array(quoteRequestListItemSchema)

export const quoteRequestsApi = {
  async createQuoteRequest(
    input: CreateQuoteRequestInputDto,
    client: ApiClientLike = api,
    idempotencyKey?: string,
  ): Promise<AppApiResult<QuoteRequestDto>> {
    const validated = normalizeInput(input, createQuoteRequestInputSchema)
    if (!validated.ok) return validated

    const response = await client.apisauce.post("/api/mobile/quote-requests", validated.data, {
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
    })
    return normalizeApiResponse(response, quoteRequestSchema, { forbiddenMeansAuth: true })
  },

  async listFuneralHomeRequests(
    client: ApiClientLike = api,
  ): Promise<AppApiResult<QuoteRequestListItemDto[]>> {
    const response = await client.apisauce.get("/api/mobile/requests")
    return normalizeApiResponse(response, quoteRequestListSchema, { forbiddenMeansAuth: true })
  },

  async listSupplierRequests(
    client: ApiClientLike = api,
  ): Promise<AppApiResult<QuoteRequestListItemDto[]>> {
    const response = await client.apisauce.get("/api/mobile/supplier-requests")
    return normalizeApiResponse(response, quoteRequestListSchema, { forbiddenMeansAuth: true })
  },
}
