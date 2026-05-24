import { z } from "zod"

import { normalizeApiResponse, type ApiClientLike } from "./apiResult"
import { categorySchema } from "./schemas"
import type { AppApiResult, CategoryDto } from "./types"

import { api } from "."

const categoriesSchema = z.array(categorySchema)

export const categoriesApi = {
  async listCategories(client: ApiClientLike = api): Promise<AppApiResult<CategoryDto[]>> {
    const response = await client.apisauce.get("/api/mobile/categories")
    return normalizeApiResponse(response, categoriesSchema, { forbiddenMeansAuth: true })
  },
}
