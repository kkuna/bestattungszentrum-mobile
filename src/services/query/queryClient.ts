import { QueryClient, type QueryClientConfig } from "@tanstack/react-query"

const defaultQueryOptions = {
  refetchOnWindowFocus: false,
  retry: false,
  staleTime: 60_000,
} satisfies NonNullable<QueryClientConfig["defaultOptions"]>["queries"]

export function createQueryClient(config: QueryClientConfig = {}) {
  const { defaultOptions, ...restConfig } = config

  return new QueryClient({
    ...restConfig,
    defaultOptions: {
      ...defaultOptions,
      queries: {
        ...defaultQueryOptions,
        ...defaultOptions?.queries,
      },
    },
  })
}

export const queryClient = createQueryClient()
