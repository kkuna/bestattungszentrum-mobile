import {
  normalizeSupplierDetailId,
  normalizeSupplierSearchParams,
  type SupplierSearchParams,
} from "@/services/api/suppliersApi"

export const queryKeys = {
  categories: {
    list: () => ["categories", "list"] as const,
  },
  suppliers: {
    list: (params: SupplierSearchParams = {}) =>
      ["suppliers", "list", normalizeSupplierSearchParams(params)] as const,
    detail: (supplierId: string | undefined) =>
      ["suppliers", "detail", normalizeSupplierDetailId(supplierId) ?? null] as const,
  },
} as const
