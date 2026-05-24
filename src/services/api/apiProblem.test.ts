import type { ApiErrorResponse } from "apisauce"

import { mapApiFailure } from "./apiProblem"

test("maps backend not-found errors without raw response leakage", () => {
  expect(
    mapApiFailure({
      ok: false,
      problem: "CLIENT_ERROR",
      status: 404,
      data: {
        error: {
          code: "NOT_FOUND",
          message: "Resource not found",
        },
      },
    } as ApiErrorResponse<unknown>),
  ).toEqual({
    ok: false,
    problem: "not-found",
    status: 404,
    messageKey: "api:error.notFound",
    details: {
      code: "NOT_FOUND",
      message: "Resource not found",
    },
  })
})

test("maps validation error details from backend envelopes", () => {
  expect(
    mapApiFailure({
      ok: false,
      problem: "CLIENT_ERROR",
      status: 400,
      data: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid payload",
          issues: [{ path: ["password"], message: "Too short" }],
        },
      },
    } as ApiErrorResponse<unknown>),
  ).toEqual({
    ok: false,
    problem: "validation",
    status: 400,
    messageKey: "api:error.validation",
    details: {
      code: "VALIDATION_ERROR",
      message: "Invalid payload",
      issues: [{ path: ["password"], message: "Too short" }],
    },
  })
})

test("can treat protected 403 responses as auth failures", () => {
  expect(
    mapApiFailure(
      {
        ok: false,
        problem: "CLIENT_ERROR",
        status: 403,
        data: {
          error: {
            code: "FORBIDDEN",
            message: "Forbidden",
          },
        },
      } as ApiErrorResponse<unknown>,
      { forbiddenMeansAuth: true },
    ),
  ).toEqual({
    ok: false,
    problem: "auth",
    status: 403,
    messageKey: "api:error.auth",
    details: {
      code: "FORBIDDEN",
      message: "Forbidden",
    },
  })
})
