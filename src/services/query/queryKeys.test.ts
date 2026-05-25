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

  test("creates mobile-conservative query clients", () => {
    const client = createQueryClient()
    const defaults = client.getDefaultOptions()

    expect(defaults.queries?.retry).toBe(false)
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false)
  })
})
