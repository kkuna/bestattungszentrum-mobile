import { QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react-native"

import { categoriesApi } from "@/services/api/categoriesApi"
import { suppliersApi } from "@/services/api/suppliersApi"
import type { CategoryDto, SupplierDto } from "@/services/api/types"
import { createQueryClient } from "@/services/query/queryClient"

import { useRfqFormContextQuery } from "./useRfqFormContextQuery"

jest.mock("@/services/api/categoriesApi", () => ({
  categoriesApi: {
    listCategories: jest.fn(),
  },
}))

jest.mock("@/services/api/suppliersApi", () => ({
  ...jest.requireActual("@/services/api/suppliersApi"),
  suppliersApi: {
    getSupplier: jest.fn(),
  },
}))

const category: CategoryDto = {
  id: "cat-1",
  slug: "flowers",
  nameDe: "Blumen",
  nameEn: "Flowers",
  parentId: null,
  icon: "flower",
  isActive: true,
  quoteFormSchema: {
    fields: [{ name: "notes", type: "text", label: "Hinweise", required: true }],
  },
}

const inactiveCategory: CategoryDto = {
  ...category,
  id: "cat-inactive",
  isActive: false,
}

const supplier: SupplierDto = {
  id: "supplier-1",
  legalName: "Muster GmbH",
  tradingName: "Muster Floristik",
  hrCourt: null,
  hrType: null,
  hrNumber: null,
  vatId: null,
  address: {
    street: "Hauptstr. 1",
    zip: "10115",
    city: "Berlin",
    country: "DE",
  },
  phone: "+49 30 123456",
  contactEmail: "kontakt@muster.example",
  publicDescription: null,
  logoUrl: null,
  categoryIds: ["cat-1"],
  regionsServed: ["Berlin"],
  languages: ["de"],
  certifications: [],
  accountStatus: "ACTIVE",
  subscriptionTier: "basic",
  billingEmail: "rechnung@muster.example",
  createdAt: "2026-05-01T10:00:00.000Z",
}

function wrapper({ children }: { children: React.ReactNode }) {
  const client = createQueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
      },
    },
  })

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe("useRfqFormContextQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("loads supplier, active category, and normalized schema descriptors", async () => {
    jest.mocked(categoriesApi.listCategories).mockResolvedValue({ ok: true, data: [category] })
    jest.mocked(suppliersApi.getSupplier).mockResolvedValue({ ok: true, data: supplier })

    const { result } = renderHook(() => useRfqFormContextQuery(" supplier-1 ", " cat-1 "), {
      wrapper,
    })

    await waitFor(() => expect(result.current.contextStatus).toBe("ready"))

    expect(result.current.data).toMatchObject({
      category,
      schema: {
        status: "ready",
        fields: [{ id: "notes", label: "Hinweise", type: "text" }],
      },
      supplier,
    })
    expect(suppliersApi.getSupplier).toHaveBeenCalledWith("supplier-1")
  })

  test("blocks missing route context without calling APIs", () => {
    const { result } = renderHook(() => useRfqFormContextQuery(undefined, " "), { wrapper })

    expect(result.current.contextStatus).toBe("missing-context")
    expect(result.current.errorKey).toBe("funeralHome:rfq.states.missingContextBody")
    expect(categoriesApi.listCategories).not.toHaveBeenCalled()
    expect(suppliersApi.getSupplier).not.toHaveBeenCalled()
  })

  test("blocks inactive or missing category context", async () => {
    jest
      .mocked(categoriesApi.listCategories)
      .mockResolvedValue({ ok: true, data: [category, inactiveCategory] })
    jest.mocked(suppliersApi.getSupplier).mockResolvedValue({ ok: true, data: supplier })

    const { result } = renderHook(() => useRfqFormContextQuery("supplier-1", "cat-inactive"), {
      wrapper,
    })

    await waitFor(() => expect(result.current.contextStatus).toBe("blocked"))

    expect(result.current.errorKey).toBe("funeralHome:rfq.states.inactiveCategoryBody")
  })

  test("blocks malformed schema as a localized recoverable state", async () => {
    jest
      .mocked(categoriesApi.listCategories)
      .mockResolvedValue({ ok: true, data: [{ ...category, quoteFormSchema: "bad" as never }] })
    jest.mocked(suppliersApi.getSupplier).mockResolvedValue({ ok: true, data: supplier })

    const { result } = renderHook(() => useRfqFormContextQuery("supplier-1", "cat-1"), {
      wrapper,
    })

    await waitFor(() => expect(result.current.contextStatus).toBe("blocked"))

    expect(result.current.errorKey).toBe("funeralHome:rfq.errors.schemaInvalid")
  })

  test("surfaces normalized API failures without raw response inspection", async () => {
    jest.mocked(categoriesApi.listCategories).mockResolvedValue({
      ok: false,
      problem: "network",
      messageKey: "api:error.network",
    })

    const { result } = renderHook(() => useRfqFormContextQuery("supplier-1", "cat-1"), {
      wrapper,
    })

    await waitFor(() => expect(result.current.contextStatus).toBe("error"))

    expect(result.current.errorKey).toBe("api:error.network")
  })
})
