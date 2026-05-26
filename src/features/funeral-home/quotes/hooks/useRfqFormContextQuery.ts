import { useQuery } from "@tanstack/react-query"

import {
  normalizeQuoteFormSchema,
  type NormalizedQuoteFormSchema,
} from "@/domain/requests/quoteFormSchema"
import type { TxKeyPath } from "@/i18n"
import { categoriesApi } from "@/services/api/categoriesApi"
import { normalizeSupplierDetailId, suppliersApi } from "@/services/api/suppliersApi"
import type { ApiFailure, CategoryDto, SupplierDto } from "@/services/api/types"
import { normalizeRfqContextId, queryKeys } from "@/services/query/queryKeys"

export type RfqFormContextData = {
  category: CategoryDto
  schema: Extract<NormalizedQuoteFormSchema, { status: "ready" }>
  supplier: SupplierDto
}

type RfqFormContextQueryData =
  | ({ kind: "ready" } & RfqFormContextData)
  | {
      errorKey: TxKeyPath
      kind: "blocked"
    }

export type RfqFormContextState =
  | {
      contextStatus: "missing-context"
      data?: undefined
      errorKey: TxKeyPath
      refetch?: undefined
    }
  | {
      contextStatus: "loading"
      data?: undefined
      errorKey?: undefined
      refetch?: undefined
    }
  | {
      contextStatus: "error"
      data?: undefined
      errorKey: TxKeyPath
      refetch: () => void
    }
  | {
      contextStatus: "blocked"
      data?: undefined
      errorKey: TxKeyPath
      refetch: () => void
    }
  | {
      contextStatus: "ready"
      data: RfqFormContextData
      errorKey?: undefined
      refetch: () => void
    }

export function useRfqFormContextQuery(
  supplierId: string | undefined,
  categoryId: string | undefined,
): RfqFormContextState {
  const normalizedSupplierId = normalizeSupplierDetailId(supplierId)
  const normalizedCategoryId = normalizeRfqContextId(categoryId)
  const hasContext = !!normalizedSupplierId && !!normalizedCategoryId

  const query = useQuery<RfqFormContextQueryData, ApiFailure>({
    enabled: hasContext,
    queryKey: queryKeys.rfq.formContext(normalizedSupplierId, normalizedCategoryId),
    queryFn: async () => {
      const categoriesResult = await categoriesApi.listCategories()

      if (!categoriesResult.ok) {
        throw categoriesResult
      }

      const category = categoriesResult.data.find((item) => item.id === normalizedCategoryId)

      if (!category) {
        return {
          errorKey: "funeralHome:rfq.states.categoryNotFoundBody",
          kind: "blocked",
        }
      }

      if (!category.isActive) {
        return {
          errorKey: "funeralHome:rfq.states.inactiveCategoryBody",
          kind: "blocked",
        }
      }

      const supplierResult = await suppliersApi.getSupplier(normalizedSupplierId!)

      if (!supplierResult.ok) {
        throw supplierResult
      }

      if (supplierResult.data.accountStatus !== "ACTIVE") {
        return {
          errorKey: "funeralHome:rfq.states.inactiveSupplierBody",
          kind: "blocked",
        }
      }

      if (!supplierResult.data.categoryIds.includes(category.id)) {
        return {
          errorKey: "funeralHome:rfq.states.contextMismatchBody",
          kind: "blocked",
        }
      }

      const schema = normalizeQuoteFormSchema(category.quoteFormSchema)

      if (schema.status === "invalid") {
        return {
          errorKey: schema.messageKey,
          kind: "blocked",
        }
      }

      return {
        category,
        kind: "ready",
        schema,
        supplier: supplierResult.data,
      }
    },
  })

  if (!hasContext) {
    return {
      contextStatus: "missing-context",
      errorKey: "funeralHome:rfq.states.missingContextBody",
    }
  }

  if (query.isLoading) {
    return {
      contextStatus: "loading",
    }
  }

  if (query.isError) {
    return {
      contextStatus: "error",
      errorKey: query.error.messageKey,
      refetch: () => query.refetch(),
    }
  }

  if (query.data?.kind === "blocked") {
    return {
      contextStatus: "blocked",
      errorKey: query.data.errorKey,
      refetch: () => query.refetch(),
    }
  }

  if (query.data?.kind === "ready") {
    const { category, schema, supplier } = query.data

    return {
      contextStatus: "ready",
      data: { category, schema, supplier },
      refetch: () => query.refetch(),
    }
  }

  return {
    contextStatus: "loading",
  }
}
