import type { ApiErrorResponse, ApiOkResponse } from "apisauce"

import { normalizeApiResponse } from "./apiResult"
import { authApi } from "./authApi"
import { categoriesApi } from "./categoriesApi"
import { quoteRequestsApi } from "./quoteRequestsApi"
import { quoteResponsesApi } from "./quoteResponsesApi"
import {
  authTokensSchema,
  categorySchema,
  createQuoteRequestInputSchema,
  createQuoteResponseInputSchema,
  currentUserSchema,
  funeralHomeSignupInputSchema,
  funeralHomeSignupResultSchema,
  quoteRequestListItemSchema,
  quoteRequestSchema,
  quoteResponseSchema,
  requestTimelineEventSchema,
  supplierSchema,
} from "./schemas"
import { timelineApi } from "./timelineApi"
import type {
  AppApiResult,
  CategoryDto,
  CreateQuoteRequestInputDto,
  MobileAuthTokensDto,
} from "./types"

const authTokenFixture = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  tokenType: "Bearer",
  expiresInSeconds: 900,
  refreshExpiresInSeconds: 2592000,
  user: {
    id: "user-1",
    email: "owner@example.com",
    role: "FUNERAL_HOME_USER",
    tenantId: "tenant-1",
    accountStatus: "ACTIVE",
    verificationStatus: "VERIFIED",
    userStatus: "ACTIVE",
  },
}

const currentUserFixture = {
  id: "user-1",
  email: "owner@example.com",
  role: "FUNERAL_HOME_USER",
  tenantId: "tenant-1",
  accountStatus: "ACTIVE",
  verificationStatus: "VERIFIED",
  userStatus: "ACTIVE",
  permissions: ["quote-requests:create"],
}

const categoryFixture = {
  id: "cat-1",
  slug: "flowers",
  nameDe: "Blumen",
  nameEn: "Flowers",
  parentId: null,
  icon: "flower",
  quoteFormSchema: { type: "object" },
  isActive: true,
}

const supplierFixture = {
  id: "supplier-1",
  legalName: "Supplier GmbH",
  tradingName: "Supplier",
  hrCourt: "AG Berlin",
  hrType: "HRB",
  hrNumber: "12345",
  vatId: "DE123456789",
  address: {
    street: "Hauptstrasse 1",
    zip: "10115",
    city: "Berlin",
    country: "DE",
  },
  phone: "+4930123456",
  contactEmail: "supplier@example.com",
  publicDescription: "Regional supplier",
  logoUrl: null,
  categoryIds: ["cat-1"],
  regionsServed: ["Berlin"],
  languages: ["de"],
  certifications: ["DIN"],
  accountStatus: "ACTIVE",
  subscriptionTier: "standard",
  billingEmail: "billing@example.com",
  createdAt: "2026-05-24T09:00:00.000Z",
  createdByAdminId: "admin-1",
}

const documentFixture = {
  id: "doc-1",
  ownerType: "QuoteRequest",
  ownerId: "request-1",
  kind: "attachment",
  fileName: "brief.pdf",
  contentType: "application/pdf",
  storageKey: "documents/brief.pdf",
  url: "https://example.com/brief.pdf",
  byteLength: 2048,
  checksum: "sha256",
  createdAt: "2026-05-24T09:01:00.000Z",
}

const quoteRequestFixture = {
  id: "request-1",
  funeralHomeId: "funeral-home-1",
  supplierId: "supplier-1",
  categoryId: "cat-1",
  subject: "Flower request",
  message: "Please quote.",
  deadline: "2026-06-01T09:00:00.000Z",
  attributes: { color: "white" },
  attachments: [documentFixture],
  status: "SENT",
  createdAt: "2026-05-24T09:02:00.000Z",
  sentAt: "2026-05-24T09:03:00.000Z",
  respondedAt: null,
}

const quoteResponseFixture = {
  id: "response-1",
  quoteRequestId: "request-1",
  supplierId: "supplier-1",
  priceAmount: 1200,
  priceCurrency: "EUR",
  priceIsRange: true,
  priceMax: 1500,
  validityUntil: "2026-06-10T09:00:00.000Z",
  leadTimeDays: 3,
  message: "Available.",
  attachments: [documentFixture],
  status: "SENT",
  sentAt: "2026-05-24T09:04:00.000Z",
}

const timelineFixture = {
  id: "event-1",
  type: "QUOTE_REQUEST_SENT",
  title: "Request sent",
  description: "The request was sent.",
  occurredAt: "2026-05-24T09:05:00.000Z",
  status: "DONE",
  actorRole: "FUNERAL_HOME_USER",
  relatedEntityType: "QuoteRequest",
  relatedEntityId: "request-1",
}

const signupInputFixture = {
  legalName: "Funeral Home GmbH",
  tradingName: "Funeral Home",
  hrCourt: "AG Koeln",
  hrType: "HRB",
  hrNumber: "67890",
  vatId: "DE987654321",
  address: {
    street: "Ring 2",
    zip: "50667",
    city: "Koeln",
    country: "DE",
  },
  phone: "+49221123456",
  contactEmail: "contact@example.com",
  billingEmail: "billing@example.com",
  password: "correct horse battery staple",
}

const signupResultFixture = {
  accountStatus: "PENDING_REVIEW",
  funeralHomeId: "funeral-home-1",
  tradingName: "Funeral Home",
  userStatus: "PENDING",
}

const createQuoteRequestInputFixture = {
  supplierId: "supplier-1",
  categoryId: "cat-1",
  subject: "Flower request",
  message: "Please quote.",
  deadline: "2026-06-01",
  attributes: { color: "white" },
  attachments: [],
}

const createQuoteResponseInputFixture = {
  quoteRequestId: "request-1",
  priceAmount: 1200,
  priceIsRange: false,
  priceMax: null,
  validityUntil: "2026-06-10T09:00:00.000Z",
  leadTimeDays: 3,
  message: "Available.",
  attachments: [],
}

const quoteRequestListItemFixture = {
  ...quoteRequestFixture,
  attachments: undefined,
  documents: [documentFixture],
  timeline: [timelineFixture],
  category: categoryFixture,
  supplier: supplierFixture,
  responses: [quoteResponseFixture],
}

describe("normalizeApiResponse", () => {
  test("unwraps backend success envelopes", () => {
    const response = {
      ok: true,
      status: 200,
      data: { data: authTokenFixture },
    } as ApiOkResponse<{ data: unknown }>

    expect(normalizeApiResponse(response, authTokensSchema)).toEqual({
      ok: true,
      data: authTokenFixture,
    })
  })

  test("maps backend validation errors to normalized failures", () => {
    const response = {
      ok: false,
      status: 422,
      problem: "CLIENT_ERROR",
      data: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid payload",
          issues: [{ path: ["email"], message: "Invalid email" }],
        },
      },
    } as ApiErrorResponse<unknown>

    expect(normalizeApiResponse(response, authTokensSchema)).toEqual({
      ok: false,
      problem: "validation",
      status: 422,
      messageKey: "api:error.validation",
      details: {
        code: "VALIDATION_ERROR",
        message: "Invalid payload",
        issues: [{ path: ["email"], message: "Invalid email" }],
      },
    })
  })

  test("treats 403 auth failures defensively", () => {
    const response = {
      ok: false,
      status: 403,
      problem: "CLIENT_ERROR",
      data: { error: { code: "FORBIDDEN", message: "Forbidden" } },
    } as ApiErrorResponse<unknown>

    expect(
      normalizeApiResponse(response, currentUserSchema, { forbiddenMeansAuth: true }),
    ).toMatchObject({
      ok: false,
      problem: "auth",
      status: 403,
      messageKey: "api:error.auth",
    })
  })

  test.each([
    ["CONNECTION_ERROR", "network", "api:error.network"],
    ["NETWORK_ERROR", "network", "api:error.network"],
    ["TIMEOUT_ERROR", "timeout", "api:error.timeout"],
    ["SERVER_ERROR", "server", "api:error.server"],
    ["UNKNOWN_ERROR", "unknown", "api:error.unknown"],
    ["CANCEL_ERROR", "cancelled", "api:error.cancelled"],
  ] as const)("maps %s deterministically", (problem, expectedProblem, messageKey) => {
    const response = {
      ok: false,
      problem,
    } as ApiErrorResponse<unknown>

    expect(normalizeApiResponse(response, categorySchema)).toMatchObject({
      ok: false,
      problem: expectedProblem,
      messageKey,
    })
  })

  test("maps malformed success data to bad-data", () => {
    const response = {
      ok: true,
      status: 200,
      data: { data: { tokenType: "Basic" } },
    } as ApiOkResponse<{ data: unknown }>

    expect(normalizeApiResponse(response, authTokensSchema)).toMatchObject({
      ok: false,
      problem: "bad-data",
      status: 200,
      messageKey: "api:error.badData",
    })
  })

  test("maps missing success envelopes to bad-data", () => {
    const response = {
      ok: true,
      status: 200,
      data: authTokenFixture,
    } as ApiOkResponse<unknown>

    expect(normalizeApiResponse(response, authTokensSchema)).toMatchObject({
      ok: false,
      problem: "bad-data",
      status: 200,
      messageKey: "api:error.badData",
    })
  })
})

describe("API DTO schemas", () => {
  test("parse representative backend fixtures and strip unknown supplier fields", () => {
    expect(authTokensSchema.parse(authTokenFixture)).toEqual(authTokenFixture)
    expect(currentUserSchema.parse(currentUserFixture)).toEqual(currentUserFixture)
    expect(categorySchema.parse(categoryFixture)).toEqual(categoryFixture)
    expect(supplierSchema.parse(supplierFixture)).not.toHaveProperty("createdByAdminId")
    expect(quoteRequestSchema.parse(quoteRequestFixture)).toEqual(quoteRequestFixture)
    expect(quoteResponseSchema.parse(quoteResponseFixture)).toEqual(quoteResponseFixture)
    expect(requestTimelineEventSchema.parse(timelineFixture)).toEqual(timelineFixture)
    expect(funeralHomeSignupInputSchema.parse(signupInputFixture)).toEqual(signupInputFixture)
    expect(funeralHomeSignupResultSchema.parse(signupResultFixture)).toEqual(signupResultFixture)
    expect(createQuoteRequestInputSchema.parse(createQuoteRequestInputFixture)).toEqual(
      createQuoteRequestInputFixture,
    )
    expect(createQuoteResponseInputSchema.parse(createQuoteResponseInputFixture)).toEqual(
      createQuoteResponseInputFixture,
    )
    expect(quoteRequestListItemSchema.parse(quoteRequestListItemFixture)).toEqual({
      ...quoteRequestListItemFixture,
      attachments: [],
      supplier: supplierSchema.parse(supplierFixture),
    })
  })

  test("accepts current-user responses without account status until backend exposes it", () => {
    expect(
      currentUserSchema.parse({
        id: "user-1",
        email: "owner@example.com",
        role: "FUNERAL_HOME_USER",
        tenantId: "tenant-1",
        permissions: [],
      }),
    ).toEqual({
      id: "user-1",
      email: "owner@example.com",
      role: "FUNERAL_HOME_USER",
      tenantId: "tenant-1",
      permissions: [],
    })
  })

  test("accepts tenantless back-office users so app route gates can fail closed", () => {
    expect(
      currentUserSchema.parse({
        id: "user-admin",
        email: "admin@example.com",
        role: "ADMIN",
        tenantId: null,
        permissions: ["admin:read"],
      }),
    ).toEqual({
      id: "user-admin",
      email: "admin@example.com",
      role: "ADMIN",
      tenantId: null,
      permissions: ["admin:read"],
    })
  })

  test("rejects unchecked account status values at the API boundary", () => {
    expect(
      currentUserSchema.safeParse({
        ...currentUserFixture,
        accountStatus: "RAW_BACKEND_VALUE",
      }).success,
    ).toBe(false)
  })

  test("rejects unchecked verification status values at the API boundary", () => {
    expect(
      currentUserSchema.safeParse({
        ...currentUserFixture,
        verificationStatus: "RAW_BACKEND_VALUE",
      }).success,
    ).toBe(false)
  })

  test("defaulted quote request input fields are optional for API callers", () => {
    const minimalInput: CreateQuoteRequestInputDto = {
      supplierId: "supplier-1",
      categoryId: "cat-1",
      subject: "Flower request",
      message: "Please quote.",
      deadline: "2026-06-01",
    }

    expect(createQuoteRequestInputSchema.parse(minimalInput)).toEqual({
      ...minimalInput,
      attributes: {},
      attachments: [],
    })
  })

  test("rejects malformed critical request inputs", () => {
    expect(
      createQuoteRequestInputSchema.safeParse({
        ...createQuoteRequestInputFixture,
        subject: "",
      }).success,
    ).toBe(false)
    expect(
      createQuoteResponseInputSchema.safeParse({
        ...createQuoteResponseInputFixture,
        priceAmount: -1,
      }).success,
    ).toBe(false)
    expect(
      createQuoteResponseInputSchema.safeParse({
        ...createQuoteResponseInputFixture,
        priceIsRange: true,
        priceMax: null,
      }).success,
    ).toBe(false)
  })
})

describe("typed API modules", () => {
  test("own endpoint paths and return normalized results", async () => {
    const get = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { data: [categoryFixture] },
    })
    const post = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { data: authTokenFixture },
    })
    const client = { apisauce: { get, post } }

    await expect(categoriesApi.listCategories(client)).resolves.toEqual({
      ok: true,
      data: [categoryFixture],
    })
    await expect(
      authApi.login({ email: "owner@example.com", password: "secret" }, client),
    ).resolves.toEqual({
      ok: true,
      data: authTokenFixture,
    })

    expect(get).toHaveBeenCalledWith("/api/mobile/categories")
    expect(post).toHaveBeenCalledWith("/api/mobile/auth/login", {
      email: "owner@example.com",
      password: "secret",
    })
  })

  test("encodes dynamic route segments", async () => {
    const post = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { data: quoteResponseFixture },
    })
    const get = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { data: [timelineFixture] },
    })
    const client = { apisauce: { get, post } }

    await quoteResponsesApi.decideQuoteResponse("response/1", { decision: "ACCEPTED" }, client)
    await timelineApi.getQuoteRequestTimeline("request/1", client)

    expect(post).toHaveBeenCalledWith("/api/mobile/quote-responses/response%2F1/decision", {
      decision: "ACCEPTED",
    })
    expect(get).toHaveBeenCalledWith("/api/mobile/quote-requests/request%2F1/timeline")
  })

  test("normalizes larger request list payloads", async () => {
    const get = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { data: [quoteRequestListItemFixture] },
    })
    const client = { apisauce: { get, post: jest.fn() } }

    await expect(quoteRequestsApi.listFuneralHomeRequests(client)).resolves.toMatchObject({
      ok: true,
      data: [{ documents: [documentFixture], timeline: [timelineFixture] }],
    })
  })
})

type Equals<T, U> =
  (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2 ? true : false
type Assert<T extends true> = T
type AuthReturn = Awaited<ReturnType<typeof authApi.login>>
type CategoriesReturn = Awaited<ReturnType<typeof categoriesApi.listCategories>>
type _AuthApiReturnsAppResult = Assert<Equals<AuthReturn, AppApiResult<MobileAuthTokensDto>>>
type _CategoriesApiReturnsAppResult = Assert<Equals<CategoriesReturn, AppApiResult<CategoryDto[]>>>
