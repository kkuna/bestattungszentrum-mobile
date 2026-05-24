import type { z } from "zod"

import type { TxKeyPath } from "@/i18n"

import type {
  addressSchema,
  apiErrorSchema,
  authTokensSchema,
  categorySchema,
  createQuoteRequestInputSchema,
  createQuoteResponseInputSchema,
  currentUserSchema,
  documentAssetSchema,
  emailDispatchSchema,
  funeralHomeSignupInputSchema,
  funeralHomeSignupResultSchema,
  loginInputSchema,
  logoutAllResultSchema,
  logoutInputSchema,
  logoutResultSchema,
  pathIdSchema,
  quoteRequestListItemSchema,
  quoteRequestSchema,
  quoteResponseDecisionInputSchema,
  quoteResponseSchema,
  refreshSessionInputSchema,
  requestTimelineEventSchema,
  supplierItemSchema,
  supplierSchema,
  verificationStatusSchema,
} from "./schemas"

type InferSchema<T extends z.ZodType> = z.infer<T>
type InputSchema<T extends z.ZodType> = z.input<T>

/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}

export type ApiSuccess<T> = { ok: true; data: T }

export type ApiProblem =
  | "network"
  | "timeout"
  | "server"
  | "auth"
  | "access-denied"
  | "not-found"
  | "validation"
  | "bad-data"
  | "cancelled"
  | "unknown"

export type ApiFailure = {
  ok: false
  problem: ApiProblem
  status?: number
  messageKey: TxKeyPath
  details?: unknown
}

export type AppApiResult<T> = ApiSuccess<T> | ApiFailure

export type BackendSuccessEnvelope<T> = { data: T }
export type BackendErrorEnvelope = { error: ApiErrorDto }

export type UserRoleDto =
  | "FUNERAL_HOME_USER"
  | "SUPPLIER_USER"
  | "ADMIN"
  | "SUPER_ADMIN"
  | "SUPPORT"
  | "OPERATOR"

export type UserStatusDto = "PENDING" | "ACTIVE" | "SUSPENDED"
export type AccountStatusDto =
  | "PENDING_REVIEW"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "SUSPENDED"
  | "CLOSED"
export type VerificationStatusDto = InferSchema<typeof verificationStatusSchema>
export type QuoteRequestStatusDto =
  | "DRAFT"
  | "SENT"
  | "RESPONDED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED"
export type QuoteResponseStatusDto = "SENT" | "ACCEPTED" | "REJECTED"
export type EmailDispatchStatusDto = "QUEUED" | "SENT" | "DELIVERED" | "BOUNCED" | "COMPLAINED"

export type AddressDto = InferSchema<typeof addressSchema>
export type ApiErrorDto = InferSchema<typeof apiErrorSchema>
export type LoginInputDto = InferSchema<typeof loginInputSchema>
export type RefreshSessionInputDto = InferSchema<typeof refreshSessionInputSchema>
export type LogoutInputDto = InferSchema<typeof logoutInputSchema>
export type MobileAuthTokensDto = InferSchema<typeof authTokensSchema>
export type MobileAuthUserDto = MobileAuthTokensDto["user"]
export type MobileCurrentUserDto = InferSchema<typeof currentUserSchema>
export type CategoryDto = InferSchema<typeof categorySchema>
export type SupplierDto = InferSchema<typeof supplierSchema>
export type SupplierItemDto = InferSchema<typeof supplierItemSchema>
export type QuoteRequestDto = InferSchema<typeof quoteRequestSchema>
export type QuoteResponseDto = InferSchema<typeof quoteResponseSchema>
export type DocumentAssetDto = InferSchema<typeof documentAssetSchema>
export type RequestTimelineEventDto = InferSchema<typeof requestTimelineEventSchema>
export type EmailDispatchDto = InferSchema<typeof emailDispatchSchema>
export type FuneralHomeSignupInputDto = InferSchema<typeof funeralHomeSignupInputSchema>
export type FuneralHomeSignupResultDto = InferSchema<typeof funeralHomeSignupResultSchema>
export type CreateQuoteRequestInputDto = InputSchema<typeof createQuoteRequestInputSchema>
export type CreateQuoteResponseInputDto = InputSchema<typeof createQuoteResponseInputSchema>
export type QuoteResponseDecisionInputDto = InferSchema<typeof quoteResponseDecisionInputSchema>
export type LogoutResultDto = InferSchema<typeof logoutResultSchema>
export type LogoutAllResultDto = InferSchema<typeof logoutAllResultSchema>
export type PathIdDto = InferSchema<typeof pathIdSchema>
export type QuoteRequestListItemDto = InferSchema<typeof quoteRequestListItemSchema>
export type QuoteFormSchemaDto = Record<string, unknown>
export type QuoteRequestAttributesDto = Record<string, unknown>
