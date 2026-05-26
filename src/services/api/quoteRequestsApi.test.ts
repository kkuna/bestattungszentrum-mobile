import type { ApiErrorResponse, ApiOkResponse } from "apisauce"

import type { ApiClientLike } from "./apiResult"
import { quoteRequestsApi } from "./quoteRequestsApi"
import type { CreateQuoteRequestInputDto } from "./types"

const createInputFixture: CreateQuoteRequestInputDto = {
  supplierId: "supplier-1",
  categoryId: "cat-flowers",
  subject: "Kränze",
  message: "Bitte ein Angebot vorbereiten.",
  deadline: "2026-06-10",
  attributes: { notes: "Weiße Blumen", quantity: "2" },
  attachments: [],
}

const quoteRequestFixture = {
  id: "request-123",
  funeralHomeId: "fh-1",
  supplierId: "supplier-1",
  categoryId: "cat-flowers",
  subject: "Kränze",
  message: "Bitte ein Angebot vorbereiten.",
  deadline: "2026-06-10",
  attributes: { notes: "Weiße Blumen" },
  attachments: [],
  status: "SENT",
  createdAt: "2026-05-26T08:00:00.000+02:00",
  sentAt: "2026-05-26T08:00:00.000+02:00",
  respondedAt: null,
}

function createClient(response: ApiOkResponse<unknown> | ApiErrorResponse<unknown>) {
  return {
    apisauce: {
      get: jest.fn(),
      post: jest.fn().mockResolvedValue(response),
    },
  } satisfies ApiClientLike
}

function createGetClient(response: ApiOkResponse<unknown> | ApiErrorResponse<unknown>) {
  return {
    apisauce: {
      get: jest.fn().mockResolvedValue(response),
      post: jest.fn(),
    },
  } satisfies ApiClientLike
}

describe("quoteRequestsApi.createQuoteRequest", () => {
  test("validates input, posts normalized payload, keeps idempotency header, and parses partial dispatch data", async () => {
    const client = createClient({
      ok: true,
      status: 201,
      data: {
        data: {
          ...quoteRequestFixture,
          emailDispatch: {
            status: "QUEUED",
          },
        },
      },
    } as ApiOkResponse<unknown>)

    await expect(
      quoteRequestsApi.createQuoteRequest(createInputFixture, client, "idem-1"),
    ).resolves.toMatchObject({
      ok: true,
      data: {
        id: "request-123",
        emailDispatch: { status: "QUEUED" },
      },
    })

    expect(client.apisauce.post).toHaveBeenCalledWith(
      "/api/mobile/quote-requests",
      createInputFixture,
      { headers: { "Idempotency-Key": "idem-1" } },
    )
  })

  test("rejects datetime deadline input before making a network call", async () => {
    const client = createClient({
      ok: true,
      status: 201,
      data: { data: quoteRequestFixture },
    } as ApiOkResponse<unknown>)

    await expect(
      quoteRequestsApi.createQuoteRequest(
        {
          ...createInputFixture,
          deadline: "2026-06-10T23:59:59.000+02:00",
        },
        client,
      ),
    ).resolves.toMatchObject({
      ok: false,
      problem: "validation",
      messageKey: "funeralHome:rfq.submit.errors.validation",
    })
    expect(client.apisauce.post).not.toHaveBeenCalled()
  })

  test.each([
    [
      "validation failure",
      {
        ok: false,
        status: 422,
        problem: "CLIENT_ERROR",
        data: { error: { code: "VALIDATION_ERROR", message: "Invalid" } },
      },
      "validation",
      "funeralHome:rfq.submit.errors.validation",
    ],
    [
      "unauthorized",
      {
        ok: false,
        status: 401,
        problem: "CLIENT_ERROR",
        data: { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      },
      "auth",
      "funeralHome:rfq.submit.errors.auth",
    ],
    [
      "forbidden or suspended",
      {
        ok: false,
        status: 403,
        problem: "CLIENT_ERROR",
        data: { error: { code: "FORBIDDEN", message: "Forbidden" } },
      },
      "access-denied",
      "funeralHome:rfq.submit.errors.accessDenied",
    ],
    [
      "missing supplier or category",
      {
        ok: false,
        status: 404,
        problem: "CLIENT_ERROR",
        data: { error: { code: "NOT_FOUND", message: "Missing" } },
      },
      "not-found",
      "funeralHome:rfq.submit.errors.expiredContext",
    ],
    [
      "expired supplier or category conflict",
      {
        ok: false,
        status: 409,
        problem: "CLIENT_ERROR",
        data: { error: { code: "CATEGORY_EXPIRED", message: "Expired" } },
      },
      "not-found",
      "funeralHome:rfq.submit.errors.expiredContext",
    ],
    [
      "gone supplier or category",
      {
        ok: false,
        status: 410,
        problem: "CLIENT_ERROR",
        data: { error: { code: "GONE", message: "Gone" } },
      },
      "not-found",
      "funeralHome:rfq.submit.errors.expiredContext",
    ],
    [
      "structured inactive supplier validation",
      {
        ok: false,
        status: 422,
        problem: "CLIENT_ERROR",
        data: { error: { code: "SUPPLIER_INACTIVE", message: "Inactive supplier" } },
      },
      "not-found",
      "funeralHome:rfq.submit.errors.expiredContext",
    ],
    [
      "network failure",
      { ok: false, problem: "NETWORK_ERROR" },
      "network",
      "funeralHome:rfq.submit.errors.network",
    ],
    [
      "timeout",
      { ok: false, problem: "TIMEOUT_ERROR" },
      "timeout",
      "funeralHome:rfq.submit.errors.timeout",
    ],
    [
      "server failure",
      { ok: false, status: 500, problem: "SERVER_ERROR" },
      "server",
      "funeralHome:rfq.submit.errors.server",
    ],
  ] as const)(
    "maps %s to a localized create-RFQ failure",
    async (_, response, problem, messageKey) => {
      const client = createClient(response as ApiErrorResponse<unknown>)

      await expect(
        quoteRequestsApi.createQuoteRequest(createInputFixture, client),
      ).resolves.toMatchObject({
        ok: false,
        problem,
        messageKey,
      })
    },
  )

  test.each([
    ["malformed envelope", { ok: true, status: 201, data: { request: quoteRequestFixture } }],
    [
      "malformed success data",
      {
        ok: true,
        status: 201,
        data: { data: { ...quoteRequestFixture, status: "RAW_BACKEND_VALUE" } },
      },
    ],
  ] as const)("maps %s to a localized server failure", async (_, response) => {
    const client = createClient(response as ApiOkResponse<unknown>)

    await expect(
      quoteRequestsApi.createQuoteRequest(createInputFixture, client),
    ).resolves.toMatchObject({
      ok: false,
      problem: "bad-data",
      messageKey: "funeralHome:rfq.submit.errors.server",
    })
  })
})

describe("quoteRequestsApi.listFuneralHomeRequests", () => {
  test("calls the outgoing request endpoint and parses request-history metadata", async () => {
    const client = createGetClient({
      ok: true,
      status: 200,
      data: {
        data: [
          {
            ...quoteRequestFixture,
            documents: [
              {
                id: "doc-1",
                ownerType: "QUOTE_REQUEST",
                ownerId: "request-123",
                kind: "PDF",
                fileName: "request.pdf",
                contentType: "application/pdf",
                storageKey: "quote-requests/request-123.pdf",
                url: "https://example.test/request.pdf",
                byteLength: 1200,
                checksum: "abc",
                createdAt: "2026-05-26T08:01:00.000+02:00",
              },
            ],
            emailDispatch: {
              status: "SENT",
              sentAt: "2026-05-26T08:01:00.000+02:00",
            },
            responses: [
              {
                id: "response-1",
                quoteRequestId: "request-123",
                supplierId: "supplier-1",
                priceAmount: 1200,
                priceCurrency: "EUR",
                priceIsRange: false,
                priceMax: null,
                validityUntil: "2026-06-20T00:00:00.000+02:00",
                leadTimeDays: 3,
                message: "Wir können liefern.",
                attachments: [],
                status: "SENT",
                sentAt: "2026-05-27T08:00:00.000+02:00",
              },
            ],
            supplier: {
              id: "supplier-1",
              legalName: "Trauerhilfe GmbH",
              tradingName: "Trauerhilfe Berlin",
              hrCourt: null,
              hrType: null,
              hrNumber: null,
              vatId: null,
              address: {
                street: "Hauptstrasse 1",
                zip: "10115",
                city: "Berlin",
                country: "DE",
              },
              phone: "+4930123456",
              contactEmail: "kontakt@example.test",
              publicDescription: null,
              logoUrl: null,
              categoryIds: ["cat-flowers"],
              regionsServed: ["Berlin"],
              languages: ["de"],
              certifications: [],
              accountStatus: "ACTIVE",
              subscriptionTier: "standard",
              billingEmail: "rechnung@example.test",
              createdAt: "2026-05-24T09:00:00.000+02:00",
            },
          },
        ],
      },
    } as ApiOkResponse<unknown>)

    await expect(quoteRequestsApi.listFuneralHomeRequests(client)).resolves.toMatchObject({
      ok: true,
      data: [
        {
          id: "request-123",
          documents: [{ fileName: "request.pdf" }],
          emailDispatch: { status: "SENT" },
          responses: [{ id: "response-1" }],
          supplier: { tradingName: "Trauerhilfe Berlin" },
        },
      ],
    })

    expect(client.apisauce.get).toHaveBeenCalledWith("/api/mobile/requests")
  })

  test.each([
    ["empty list", { ok: true, status: 200, data: { data: [] } }, { ok: true, data: [] }],
    [
      "malformed data",
      { ok: true, status: 200, data: { data: [{ ...quoteRequestFixture, status: "RAW" }] } },
      { ok: false, problem: "bad-data" },
    ],
    [
      "unauthorized",
      {
        ok: false,
        status: 401,
        problem: "CLIENT_ERROR",
        data: { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      },
      { ok: false, problem: "auth" },
    ],
    [
      "access denied",
      {
        ok: false,
        status: 403,
        problem: "CLIENT_ERROR",
        data: { error: { code: "FORBIDDEN", message: "Forbidden" } },
      },
      { ok: false, problem: "access-denied" },
    ],
    ["timeout", { ok: false, problem: "TIMEOUT_ERROR" }, { ok: false, problem: "timeout" }],
  ] as const)("maps %s responses", async (_, response, expected) => {
    const client = createGetClient(response as ApiOkResponse<unknown> | ApiErrorResponse<unknown>)

    await expect(quoteRequestsApi.listFuneralHomeRequests(client)).resolves.toMatchObject(expected)
  })
})
