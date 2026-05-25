import { useQuery } from "@tanstack/react-query"

import { categoriesApi } from "@/services/api/categoriesApi"
import type { ApiFailure, CategoryDto } from "@/services/api/types"
import { queryKeys } from "@/services/query/queryKeys"

export function useCategoriesQuery() {
  return useQuery<CategoryDto[], ApiFailure>({
    queryKey: queryKeys.categories.list(),
    queryFn: async () => {
      const result = await categoriesApi.listCategories()

      if (result.ok) {
        return result.data
      }

      throw result
    },
  })
}
