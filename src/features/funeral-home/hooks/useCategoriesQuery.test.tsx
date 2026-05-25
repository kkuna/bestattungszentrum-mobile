import { QueryClientProvider } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { cleanup, render, waitFor } from "@testing-library/react-native"

import { Text } from "@/components/Text"
import { categoriesApi } from "@/services/api/categoriesApi"
import type { CategoryDto } from "@/services/api/types"
import { createQueryClient } from "@/services/query/queryClient"
import { ThemeProvider } from "@/theme/context"

import { useCategoriesQuery } from "./useCategoriesQuery"

jest.mock("@/services/api/categoriesApi", () => ({
  categoriesApi: {
    listCategories: jest.fn(),
  },
}))

const category: CategoryDto = {
  id: "cat-1",
  slug: "flowers",
  nameDe: "Blumen",
  nameEn: "Flowers",
  parentId: null,
  icon: "flower",
  quoteFormSchema: { type: "object" },
  isActive: true,
}

let testQueryClient: QueryClient | undefined

function CategoryQueryProbe() {
  const query = useCategoriesQuery()

  if (query.isLoading) return <Text text="loading" />
  if (query.error) return <Text text={query.error.messageKey} />

  return <Text text={query.data?.[0]?.nameDe ?? "empty"} />
}

function renderProbe() {
  const client = createQueryClient({ defaultOptions: { queries: { gcTime: Infinity } } })
  testQueryClient = client

  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <CategoryQueryProbe />
      </ThemeProvider>
    </QueryClientProvider>,
  )
}

describe("useCategoriesQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
    testQueryClient?.clear()
    testQueryClient = undefined
  })

  test("returns category data from the normalized API boundary", async () => {
    jest.mocked(categoriesApi.listCategories).mockResolvedValue({ ok: true, data: [category] })

    const screen = renderProbe()

    await waitFor(() => expect(screen.getByText("Blumen")).toBeTruthy())
    expect(categoriesApi.listCategories).toHaveBeenCalledTimes(1)
  })

  test("exposes normalized API failures without raw response objects", async () => {
    jest.mocked(categoriesApi.listCategories).mockResolvedValue({
      ok: false,
      problem: "server",
      status: 500,
      messageKey: "api:error.server",
    })

    const screen = renderProbe()

    await waitFor(() => expect(screen.getByText("api:error.server")).toBeTruthy())
  })
})
