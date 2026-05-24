import { z } from "zod"

import { normalizeApiResponse, type ApiClientLike } from "./apiResult"
import { supplierSchema } from "./schemas"
import type { AppApiResult, SupplierDto } from "./types"

import { api } from "."

export type ListSuppliersParams = {
  q?: string
  categoryId?: string
  region?: string
  language?: string
}

const suppliersSchema = z.array(supplierSchema)

export const suppliersApi = {
  async listSuppliers(
    params: ListSuppliersParams = {},
    client: ApiClientLike = api,
  ): Promise<AppApiResult<SupplierDto[]>> {
    const response = await client.apisauce.get("/api/mobile/suppliers", params)
    return normalizeApiResponse(response, suppliersSchema, { forbiddenMeansAuth: true })
  },
}
