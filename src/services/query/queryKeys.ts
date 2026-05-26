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
  rfq: {
    formContext: (supplierId: string | undefined, categoryId: string | undefined) =>
      [
        "rfq",
        "formContext",
        {
          categoryId: normalizeRfqContextId(categoryId) ?? null,
          supplierId: normalizeSupplierDetailId(supplierId) ?? null,
        },
      ] as const,
  },
  requests: {
    funeralHomeList: () => ["requests", "funeralHome", "list"] as const,
    funeralHomeDetail: (requestId: string | undefined) =>
      ["requests", "funeralHome", "detail", normalizeRfqContextId(requestId) ?? null] as const,
    timeline: (requestId: string | undefined) =>
      ["requests", "timeline", normalizeRfqContextId(requestId) ?? null] as const,
    supplierList: () => ["requests", "supplier", "list"] as const,
  },
} as const

export function normalizeRfqContextId(value: string | undefined): string | undefined {
  const trimmedValue = value?.trim()

  return trimmedValue || undefined
}
