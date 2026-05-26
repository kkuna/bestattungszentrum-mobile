import { z } from "zod"

import { normalizeApiResponse, normalizeInput, type ApiClientLike } from "./apiResult"
import {
  createQuoteRequestInputSchema,
  quoteRequestListItemSchema,
  quoteRequestSchema,
} from "./schemas"
import type {
  ApiFailure,
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
    if (!validated.ok) return mapCreateQuoteRequestFailure(validated)

    const response = await client.apisauce.post("/api/mobile/quote-requests", validated.data, {
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
    })
    const result = normalizeApiResponse(response, quoteRequestSchema)

    return result.ok ? result : mapCreateQuoteRequestFailure(result)
  },

  async listFuneralHomeRequests(
    client: ApiClientLike = api,
  ): Promise<AppApiResult<QuoteRequestListItemDto[]>> {
    const response = await client.apisauce.get("/api/mobile/requests")
    return normalizeApiResponse(response, quoteRequestListSchema)
  },

  async listSupplierRequests(
    client: ApiClientLike = api,
  ): Promise<AppApiResult<QuoteRequestListItemDto[]>> {
    const response = await client.apisauce.get("/api/mobile/supplier-requests")
    return normalizeApiResponse(response, quoteRequestListSchema)
  },
}

function mapCreateQuoteRequestFailure(failure: ApiFailure): ApiFailure {
  const normalizedFailure = normalizeCreateQuoteRequestProblem(failure)
  const messageKeyByProblem = {
    "access-denied": "funeralHome:rfq.submit.errors.accessDenied",
    "auth": "funeralHome:rfq.submit.errors.auth",
    "bad-data": "funeralHome:rfq.submit.errors.server",
    "cancelled": "funeralHome:rfq.submit.errors.network",
    "network": "funeralHome:rfq.submit.errors.network",
    "not-found": "funeralHome:rfq.submit.errors.expiredContext",
    "server": "funeralHome:rfq.submit.errors.server",
    "timeout": "funeralHome:rfq.submit.errors.timeout",
    "unknown": "funeralHome:rfq.submit.errors.server",
    "validation": "funeralHome:rfq.submit.errors.validation",
  } as const satisfies Record<ApiFailure["problem"], ApiFailure["messageKey"]>

  return {
    ...normalizedFailure,
    messageKey: messageKeyByProblem[normalizedFailure.problem],
  }
}

function normalizeCreateQuoteRequestProblem(failure: ApiFailure): ApiFailure {
  const backendCode = getBackendCode(failure.details)

  if (isExpiredContextStatus(failure.status) || isExpiredContextCode(backendCode)) {
    return {
      ...failure,
      problem: "not-found",
    }
  }

  if (isAccessDeniedCode(backendCode)) {
    return {
      ...failure,
      problem: "access-denied",
    }
  }

  return failure
}

function getBackendCode(details: unknown) {
  if (!details || typeof details !== "object") return undefined

  const code = (details as { code?: unknown }).code
  return typeof code === "string" ? code.toUpperCase() : undefined
}

function isExpiredContextStatus(status: number | undefined) {
  return status === 404 || status === 409 || status === 410
}

function isExpiredContextCode(code: string | undefined) {
  return (
    !!code &&
    (code.includes("NOT_FOUND") ||
      code.includes("EXPIRED") ||
      code.includes("INACTIVE") ||
      code.includes("UNAVAILABLE") ||
      code.includes("GONE") ||
      code.includes("CONFLICT") ||
      code.includes("SUPPLIER") ||
      code.includes("CATEGORY"))
  )
}

function isAccessDeniedCode(code: string | undefined) {
  return !!code && (code.includes("FORBIDDEN") || code.includes("SUSPENDED"))
}
