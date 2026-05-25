import { useQuery } from "@tanstack/react-query"

import { normalizeSupplierDetailId, suppliersApi } from "@/services/api/suppliersApi"
import type { ApiFailure, SupplierDto } from "@/services/api/types"
import { queryKeys } from "@/services/query/queryKeys"

export function useSupplierDetailQuery(supplierId: string | undefined) {
  const normalizedSupplierId = normalizeSupplierDetailId(supplierId)
  const query = useQuery<SupplierDto, ApiFailure>({
    enabled: !!normalizedSupplierId,
    queryKey: queryKeys.suppliers.detail(normalizedSupplierId),
    queryFn: async () => {
      const result = await suppliersApi.getSupplier(normalizedSupplierId!)

      if (result.ok) {
        return result.data
      }

      throw result
    },
  })

  return {
    ...query,
    isMissingSupplierId: !normalizedSupplierId,
    supplierId: normalizedSupplierId,
  }
}
