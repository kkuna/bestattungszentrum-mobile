import type { ApiErrorResponse, ApiOkResponse } from "apisauce"

import type { ApiClientLike } from "./apiResult"
import { suppliersApi } from "./suppliersApi"

const supplierFixture = {
  id: "supplier-1",
  legalName: "Trauerhilfe GmbH",
  tradingName: "Trauerhilfe Berlin",
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
  contactEmail: "kontakt@trauerhilfe.example",
  publicDescription: "Regionale Begleitung fuer Bestattungsinstitute.",
  logoUrl: null,
  categoryIds: ["cat-flowers"],
  regionsServed: ["Berlin"],
  languages: ["de", "en"],
  certifications: ["DIN 15017"],
  accountStatus: "ACTIVE",
  subscriptionTier: "standard",
  billingEmail: "rechnung@trauerhilfe.example",
  createdAt: "2026-05-24T09:00:00.000Z",
}

function createClient(response: ApiOkResponse<unknown> | ApiErrorResponse<unknown>) {
  return {
    apisauce: {
      get: jest.fn().mockResolvedValue(response),
      post: jest.fn(),
    },
  } satisfies ApiClientLike
}

describe("suppliersApi", () => {
  describe("getSupplier", () => {
    test("validates and encodes the supplier id before requesting detail data", async () => {
      const client = createClient({
        ok: true,
        status: 200,
        data: { data: supplierFixture },
      } as ApiOkResponse<unknown>)

      await expect(suppliersApi.getSupplier(" supplier/1 ", client)).resolves.toEqual({
        ok: true,
        data: supplierFixture,
      })

      expect(client.apisauce.get).toHaveBeenCalledWith("/api/mobile/suppliers/supplier%2F1")
    })

    test("returns a normalized validation failure for missing supplier ids", async () => {
      const client = createClient({
        ok: true,
        status: 200,
        data: { data: supplierFixture },
      } as ApiOkResponse<unknown>)

      await expect(suppliersApi.getSupplier("   ", client)).resolves.toMatchObject({
        ok: false,
        problem: "validation",
        messageKey: "api:error.validation",
      })
      expect(client.apisauce.get).not.toHaveBeenCalled()
    })

    test("maps supplier detail not-found, auth, network, and malformed responses", async () => {
      const notFoundClient = createClient({
        ok: false,
        status: 404,
        problem: "CLIENT_ERROR",
        data: { error: { code: "NOT_FOUND", message: "Missing" } },
      } as ApiErrorResponse<unknown>)
      const unauthorizedClient = createClient({
        ok: false,
        status: 401,
        problem: "CLIENT_ERROR",
        data: { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      } as ApiErrorResponse<unknown>)
      const forbiddenClient = createClient({
        ok: false,
        status: 403,
        problem: "CLIENT_ERROR",
        data: { error: { code: "FORBIDDEN", message: "Forbidden" } },
      } as ApiErrorResponse<unknown>)
      const networkClient = createClient({
        ok: false,
        problem: "NETWORK_ERROR",
      } as ApiErrorResponse<unknown>)
      const badDataClient = createClient({
        ok: true,
        status: 200,
        data: { data: { ...supplierFixture, contactEmail: "not-an-email" } },
      } as ApiOkResponse<unknown>)

      await expect(suppliersApi.getSupplier("supplier-404", notFoundClient)).resolves.toMatchObject(
        {
          ok: false,
          problem: "not-found",
          messageKey: "api:error.notFound",
        },
      )
      await expect(
        suppliersApi.getSupplier("supplier-auth", unauthorizedClient),
      ).resolves.toMatchObject({
        ok: false,
        problem: "auth",
        messageKey: "api:error.auth",
      })
      await expect(
        suppliersApi.getSupplier("supplier-forbidden", forbiddenClient),
      ).resolves.toMatchObject({
        ok: false,
        problem: "auth",
        messageKey: "api:error.auth",
      })
      await expect(
        suppliersApi.getSupplier("supplier-network", networkClient),
      ).resolves.toMatchObject({
        ok: false,
        problem: "network",
        messageKey: "api:error.network",
      })
      await expect(suppliersApi.getSupplier("supplier-bad", badDataClient)).resolves.toMatchObject({
        ok: false,
        problem: "bad-data",
        messageKey: "api:error.badData",
      })
    })

    test("keeps unavailable supplier detail data as normalized domain data", async () => {
      const unavailableSupplier = {
        ...supplierFixture,
        accountStatus: "SUSPENDED",
        publicDescription: null,
        phone: "",
        certifications: [],
      }
      const client = createClient({
        ok: true,
        status: 200,
        data: { data: unavailableSupplier },
      } as ApiOkResponse<unknown>)

      await expect(suppliersApi.getSupplier("supplier-suspended", client)).resolves.toEqual({
        ok: true,
        data: unavailableSupplier,
      })
    })

    test("rejects supplier detail data with blank legal identity", async () => {
      const client = createClient({
        ok: true,
        status: 200,
        data: { data: { ...supplierFixture, legalName: "   ", tradingName: "   " } },
      } as ApiOkResponse<unknown>)

      await expect(suppliersApi.getSupplier("supplier-blank", client)).resolves.toMatchObject({
        ok: false,
        problem: "bad-data",
        messageKey: "api:error.badData",
      })
    })
  })

  test("maps mobile query params to the backend supplier search contract", async () => {
    const client = createClient({
      ok: true,
      status: 200,
      data: { data: [supplierFixture] },
    } as ApiOkResponse<unknown>)

    await suppliersApi.listSuppliers(
      {
        categoryId: "cat-flowers",
        language: "de",
        query: "  trauer floristik  ",
        region: "Berlin",
      },
      client,
    )

    expect(client.apisauce.get).toHaveBeenCalledWith("/api/mobile/suppliers", {
      categoryId: "cat-flowers",
      language: "de",
      q: "trauer floristik",
      region: "Berlin",
    })
  })

  test("omits empty supplier search params before requesting", async () => {
    const client = createClient({
      ok: true,
      status: 200,
      data: { data: [] },
    } as ApiOkResponse<unknown>)

    await suppliersApi.listSuppliers(
      {
        categoryId: "",
        language: undefined,
        query: "   ",
        region: "  Hamburg  ",
      },
      client,
    )

    expect(client.apisauce.get).toHaveBeenCalledWith("/api/mobile/suppliers", {
      region: "Hamburg",
    })
  })

  test("maps success and empty supplier envelopes through the DTO schema", async () => {
    const successClient = createClient({
      ok: true,
      status: 200,
      data: { data: [supplierFixture] },
    } as ApiOkResponse<unknown>)
    const emptyClient = createClient({
      ok: true,
      status: 200,
      data: { data: [] },
    } as ApiOkResponse<unknown>)

    await expect(suppliersApi.listSuppliers({}, successClient)).resolves.toEqual({
      ok: true,
      data: [supplierFixture],
    })
    await expect(suppliersApi.listSuppliers({}, emptyClient)).resolves.toEqual({
      ok: true,
      data: [],
    })
  })

  test("maps validation, forbidden, network, and malformed supplier responses", async () => {
    const validationClient = createClient({
      ok: false,
      status: 422,
      problem: "CLIENT_ERROR",
      data: { error: { code: "VALIDATION_ERROR", message: "Invalid search" } },
    } as ApiErrorResponse<unknown>)
    const forbiddenClient = createClient({
      ok: false,
      status: 403,
      problem: "CLIENT_ERROR",
      data: { error: { code: "FORBIDDEN", message: "Forbidden" } },
    } as ApiErrorResponse<unknown>)
    const networkClient = createClient({
      ok: false,
      problem: "NETWORK_ERROR",
    } as ApiErrorResponse<unknown>)
    const badDataClient = createClient({
      ok: true,
      status: 200,
      data: { data: [{ ...supplierFixture, contactEmail: "not-an-email" }] },
    } as ApiOkResponse<unknown>)

    await expect(suppliersApi.listSuppliers({}, validationClient)).resolves.toMatchObject({
      ok: false,
      problem: "validation",
      messageKey: "api:error.validation",
    })
    await expect(suppliersApi.listSuppliers({}, forbiddenClient)).resolves.toMatchObject({
      ok: false,
      problem: "auth",
      messageKey: "api:error.auth",
    })
    await expect(suppliersApi.listSuppliers({}, networkClient)).resolves.toMatchObject({
      ok: false,
      problem: "network",
      messageKey: "api:error.network",
    })
    await expect(suppliersApi.listSuppliers({}, badDataClient)).resolves.toMatchObject({
      ok: false,
      problem: "bad-data",
      messageKey: "api:error.badData",
    })
  })
})
