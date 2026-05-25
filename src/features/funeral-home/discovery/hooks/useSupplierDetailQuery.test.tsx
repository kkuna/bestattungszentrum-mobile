import { QueryClientProvider } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { cleanup, render, waitFor } from "@testing-library/react-native"

import { Text } from "@/components/Text"
import { suppliersApi } from "@/services/api/suppliersApi"
import type { SupplierDto } from "@/services/api/types"
import { createQueryClient } from "@/services/query/queryClient"
import { queryKeys } from "@/services/query/queryKeys"
import { ThemeProvider } from "@/theme/context"

import { useSupplierDetailQuery } from "./useSupplierDetailQuery"

jest.mock("@/services/api/suppliersApi", () => ({
  ...jest.requireActual("@/services/api/suppliersApi"),
  suppliersApi: {
    getSupplier: jest.fn(),
    listSuppliers: jest.fn(),
  },
}))

const supplier: SupplierDto = {
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
  publicDescription: "Regionale Begleitung.",
  logoUrl: null,
  categoryIds: ["cat-flowers"],
  regionsServed: ["Berlin"],
  languages: ["de"],
  certifications: [],
  accountStatus: "ACTIVE",
  subscriptionTier: "standard",
  billingEmail: "rechnung@trauerhilfe.example",
  createdAt: "2026-05-24T09:00:00.000Z",
}

let testQueryClient: QueryClient | undefined

function SupplierDetailProbe({ supplierId }: { supplierId?: string }) {
  const query = useSupplierDetailQuery(supplierId)

  if (query.isMissingSupplierId) return <Text text="missing" />
  if (query.isLoading) return <Text text="loading" />
  if (query.error) return <Text text={query.error.messageKey} />

  return <Text text={query.data?.tradingName ?? "empty"} />
}

function renderProbe(supplierId?: string) {
  const client = createQueryClient({ defaultOptions: { queries: { gcTime: Infinity } } })
  testQueryClient = client

  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <SupplierDetailProbe supplierId={supplierId} />
      </ThemeProvider>
    </QueryClientProvider>,
  )
}

describe("useSupplierDetailQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
    testQueryClient?.clear()
    testQueryClient = undefined
  })

  test("uses a normalized supplier detail key and API id", async () => {
    jest.mocked(suppliersApi.getSupplier).mockResolvedValue({ ok: true, data: supplier })

    const screen = renderProbe(" supplier/1 ")

    await waitFor(() => expect(screen.getByText("Trauerhilfe Berlin")).toBeTruthy())
    expect(suppliersApi.getSupplier).toHaveBeenCalledWith("supplier/1")
    expect(queryKeys.suppliers.detail(" supplier/1 ")).toEqual([
      "suppliers",
      "detail",
      "supplier/1",
    ])
  })

  test("exposes normalized supplier detail API failures", async () => {
    jest.mocked(suppliersApi.getSupplier).mockResolvedValue({
      ok: false,
      problem: "not-found",
      messageKey: "api:error.notFound",
    })

    const screen = renderProbe("supplier-404")

    await waitFor(() => expect(screen.getByText("api:error.notFound")).toBeTruthy())
  })

  test("does not fetch when the route supplier id is missing or invalid", () => {
    const screen = renderProbe("   ")

    expect(screen.getByText("missing")).toBeTruthy()
    expect(suppliersApi.getSupplier).not.toHaveBeenCalled()
  })
})
