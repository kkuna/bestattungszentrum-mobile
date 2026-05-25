import { useQuery } from "@tanstack/react-query"

import {
  normalizeSupplierSearchParams,
  suppliersApi,
  type SupplierSearchParams,
} from "@/services/api/suppliersApi"
import type { ApiFailure, SupplierDto } from "@/services/api/types"
import { queryKeys } from "@/services/query/queryKeys"

export function useSuppliersQuery(params: SupplierSearchParams = {}) {
  const normalizedParams = normalizeSupplierSearchParams(params)

  return useQuery<SupplierDto[], ApiFailure>({
    queryKey: queryKeys.suppliers.list(normalizedParams),
    queryFn: async () => {
      const result = await suppliersApi.listSuppliers(normalizedParams)

      if (result.ok) {
        return result.data
      }

      throw result
    },
  })
}
