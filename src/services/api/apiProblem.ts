import type { ApiResponse } from "apisauce"

import { backendErrorEnvelopeSchema } from "./schemas"
import type { ApiFailure, ApiProblem } from "./types"

export type ApiProblemOptions = {
  forbiddenMeansAuth?: boolean
}

const apiProblemMessageKeys = {
  "network": "api:error.network",
  "timeout": "api:error.timeout",
  "server": "api:error.server",
  "auth": "api:error.auth",
  "access-denied": "api:error.accessDenied",
  "not-found": "api:error.notFound",
  "validation": "api:error.validation",
  "bad-data": "api:error.badData",
  "cancelled": "api:error.cancelled",
  "unknown": "api:error.unknown",
} as const

export function getMessageKeyForProblem(problem: ApiProblem): ApiFailure["messageKey"] {
  return apiProblemMessageKeys[problem]
}

export function failureForProblem(
  problem: ApiProblem,
  status?: number,
  details?: unknown,
): ApiFailure {
  return {
    ok: false,
    problem,
    ...(status === undefined ? {} : { status }),
    messageKey: getMessageKeyForProblem(problem),
    ...(details === undefined ? {} : { details }),
  }
}

export function mapApiFailure(
  response: ApiResponse<unknown>,
  options: ApiProblemOptions = {},
): ApiFailure {
  const backendError = backendErrorEnvelopeSchema.safeParse(response.data)
  const details = backendError.success ? backendError.data.error : undefined
  const backendCode = backendError.success ? backendError.data.error.code : undefined

  if (backendCode === "VALIDATION_ERROR") {
    return failureForProblem("validation", response.status, details)
  }

  if (backendCode === "UNAUTHORIZED") {
    return failureForProblem("auth", response.status, details)
  }

  if (backendCode === "FORBIDDEN") {
    return failureForProblem(
      options.forbiddenMeansAuth ? "auth" : "access-denied",
      response.status,
      details,
    )
  }

  switch (response.problem) {
    case "CONNECTION_ERROR":
    case "NETWORK_ERROR":
      return failureForProblem("network", response.status, details)
    case "TIMEOUT_ERROR":
      return failureForProblem("timeout", response.status, details)
    case "SERVER_ERROR":
      return failureForProblem("server", response.status, details)
    case "UNKNOWN_ERROR":
      return failureForProblem("unknown", response.status, details)
    case "CANCEL_ERROR":
      return failureForProblem("cancelled", response.status, details)
    case "CLIENT_ERROR":
      switch (response.status) {
        case 401:
          return failureForProblem("auth", response.status, details)
        case 403:
          return failureForProblem(
            options.forbiddenMeansAuth ? "auth" : "access-denied",
            response.status,
            details,
          )
        case 404:
          return failureForProblem("not-found", response.status, details)
        case 400:
        case 422:
          return failureForProblem("validation", response.status, details)
        default:
          return failureForProblem("unknown", response.status, details)
      }
    default:
      return failureForProblem("unknown", response.status, details)
  }
}

export function validationFailure(details: unknown): ApiFailure {
  return failureForProblem("validation", undefined, details)
}

export function badDataFailure(status: number | undefined, details: unknown): ApiFailure {
  return failureForProblem("bad-data", status, details)
}
