import { createQueryClient } from "./queryClient"
import { queryKeys } from "./queryKeys"

describe("query service foundation", () => {
  test("keeps category query keys centralized and stable", () => {
    expect(queryKeys.categories.list()).toEqual(["categories", "list"])
  })

  test("keeps supplier list and detail query keys centralized and distinct", () => {
    expect(queryKeys.suppliers.list({ query: "  trauerhilfe ", categoryId: "" })).toEqual([
      "suppliers",
      "list",
      { query: "trauerhilfe" },
    ])
    expect(queryKeys.suppliers.detail(" supplier/1 ")).toEqual([
      "suppliers",
      "detail",
      "supplier/1",
    ])
    expect(queryKeys.suppliers.detail("   ")).toEqual(["suppliers", "detail", null])
  })

  test("keeps RFQ form context query keys centralized and distinct", () => {
    expect(queryKeys.rfq.formContext(" supplier-1 ", " category-1 ")).toEqual([
      "rfq",
      "formContext",
      { categoryId: "category-1", supplierId: "supplier-1" },
    ])
    expect(queryKeys.rfq.formContext(undefined, " ")).toEqual([
      "rfq",
      "formContext",
      { categoryId: null, supplierId: null },
    ])
  })

  test("keeps request list query keys centralized", () => {
    expect(queryKeys.requests.funeralHomeList()).toEqual(["requests", "funeralHome", "list"])
    expect(queryKeys.requests.funeralHomeDetail(" request/123 ")).toEqual([
      "requests",
      "funeralHome",
      "detail",
      "request/123",
    ])
    expect(queryKeys.requests.funeralHomeDetail("   ")).toEqual([
      "requests",
      "funeralHome",
      "detail",
      null,
    ])
    expect(queryKeys.requests.timeline(" request/123 ")).toEqual([
      "requests",
      "timeline",
      "request/123",
    ])
    expect(queryKeys.requests.timeline(undefined)).toEqual(["requests", "timeline", null])
    expect(queryKeys.requests.supplierList()).toEqual(["requests", "supplier", "list"])
  })

  test("creates mobile-conservative query clients", () => {
    const client = createQueryClient()
    const defaults = client.getDefaultOptions()

    expect(defaults.queries?.retry).toBe(false)
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false)
  })
})
