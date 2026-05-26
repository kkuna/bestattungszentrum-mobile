import { useMutation, useQueryClient } from "@tanstack/react-query"

import { quoteRequestsApi } from "@/services/api/quoteRequestsApi"
import type { CreateQuoteRequestInputDto } from "@/services/api/types"
import { queryKeys } from "@/services/query/queryKeys"

type CreateQuoteRequestVariables = {
  idempotencyKey: string
  input: CreateQuoteRequestInputDto
}

export function useCreateQuoteRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ idempotencyKey, input }: CreateQuoteRequestVariables) =>
      quoteRequestsApi.createQuoteRequest(input, undefined, idempotencyKey),
    onSuccess: (result) => {
      if (!result.ok) return

      queryClient.invalidateQueries({ queryKey: queryKeys.requests.funeralHomeList() })
    },
  })
}
