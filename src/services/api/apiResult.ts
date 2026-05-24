import type { ApiResponse, ApisauceInstance } from "apisauce"
import type { z } from "zod"

import {
  badDataFailure,
  mapApiFailure,
  validationFailure,
  type ApiProblemOptions,
} from "./apiProblem"
import type { ApiFailure, AppApiResult, BackendSuccessEnvelope } from "./types"

export type ApiClientLike = {
  apisauce: Pick<ApisauceInstance, "get" | "post">
}

export function unwrapBackendData(payload: unknown): unknown {
  if (
    !payload ||
    typeof payload !== "object" ||
    !Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    return undefined
  }

  return (payload as BackendSuccessEnvelope<unknown>).data
}

export function normalizeApiResponse<T>(
  response: ApiResponse<unknown>,
  schema: z.ZodType<T>,
  options: ApiProblemOptions = {},
): AppApiResult<T> {
  if (!response.ok) {
    return mapApiFailure(response, options)
  }

  const data = unwrapBackendData(response.data)

  if (data === undefined) {
    return badDataFailure(response.status, { reason: "missing-data-envelope" })
  }

  const parsed = schema.safeParse(data)

  if (!parsed.success) {
    return badDataFailure(response.status, { issues: parsed.error.issues })
  }

  return { ok: true, data: parsed.data }
}

export function normalizeInput<T>(
  input: unknown,
  schema: z.ZodType<T>,
): { ok: true; data: T } | ApiFailure {
  const parsed = schema.safeParse(input)

  if (!parsed.success) {
    return validationFailure({ issues: parsed.error.issues })
  }

  return { ok: true, data: parsed.data }
}
