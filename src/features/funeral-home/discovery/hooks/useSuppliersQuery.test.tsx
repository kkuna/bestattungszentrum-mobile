import { QueryClientProvider } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { cleanup, render, waitFor } from "@testing-library/react-native"

import { Text } from "@/components/Text"
import { suppliersApi } from "@/services/api/suppliersApi"
import type { SupplierDto } from "@/services/api/types"
import { createQueryClient } from "@/services/query/queryClient"
import { queryKeys } from "@/services/query/queryKeys"
import { ThemeProvider } from "@/theme/context"

import { useSuppliersQuery } from "./useSuppliersQuery"

jest.mock("@/services/api/suppliersApi", () => ({
  ...jest.requireActual("@/services/api/suppliersApi"),
  suppliersApi: {
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

function SupplierQueryProbe() {
  const query = useSuppliersQuery({
    categoryId: "",
    language: "de",
    query: "  trauerhilfe  ",
    region: undefined,
  })

  if (query.isLoading) return <Text text="loading" />
  if (query.error) return <Text text={query.error.messageKey} />

  return <Text text={query.data?.[0]?.tradingName ?? "empty"} />
}

function renderProbe() {
  const client = createQueryClient({ defaultOptions: { queries: { gcTime: Infinity } } })
  testQueryClient = client

  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <SupplierQueryProbe />
      </ThemeProvider>
    </QueryClientProvider>,
  )
}

describe("useSuppliersQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
    testQueryClient?.clear()
    testQueryClient = undefined
  })

  test("uses normalized supplier params for the query key and API request", async () => {
    jest.mocked(suppliersApi.listSuppliers).mockResolvedValue({ ok: true, data: [supplier] })

    const screen = renderProbe()

    await waitFor(() => expect(screen.getByText("Trauerhilfe Berlin")).toBeTruthy())
    expect(suppliersApi.listSuppliers).toHaveBeenCalledWith({
      language: "de",
      query: "trauerhilfe",
    })
    expect(queryKeys.suppliers.list({ language: "de", query: "  trauerhilfe  " })).toEqual([
      "suppliers",
      "list",
      { language: "de", query: "trauerhilfe" },
    ])
  })

  test("exposes normalized supplier API failures", async () => {
    jest.mocked(suppliersApi.listSuppliers).mockResolvedValue({
      ok: false,
      problem: "network",
      messageKey: "api:error.network",
    })

    const screen = renderProbe()

    await waitFor(() => expect(screen.getByText("api:error.network")).toBeTruthy())
  })
})
