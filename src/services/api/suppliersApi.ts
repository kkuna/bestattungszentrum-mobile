import { z } from "zod"

import { validationFailure } from "./apiProblem"
import { normalizeApiResponse, type ApiClientLike } from "./apiResult"
import { pathIdSchema, supplierSchema } from "./schemas"
import type { AppApiResult, SupplierDto } from "./types"

import { api } from "."

export type ListSuppliersParams = {
  q?: string
  categoryId?: string
  region?: string
  language?: string
}

export type SupplierSearchParams = {
  query?: string
  categoryId?: string
  region?: string
  language?: string
}

const suppliersSchema = z.array(supplierSchema)

export const suppliersApi = {
  async getSupplier(
    supplierId: string,
    client: ApiClientLike = api,
  ): Promise<AppApiResult<SupplierDto>> {
    const parsedSupplierId = pathIdSchema.safeParse(supplierId)

    if (!parsedSupplierId.success) {
      return validationFailure({ issues: parsedSupplierId.error.issues })
    }

    const response = await client.apisauce.get(
      `/api/mobile/suppliers/${encodeURIComponent(parsedSupplierId.data)}`,
    )
    return normalizeApiResponse(response, supplierSchema, { forbiddenMeansAuth: true })
  },

  async listSuppliers(
    params: SupplierSearchParams = {},
    client: ApiClientLike = api,
  ): Promise<AppApiResult<SupplierDto[]>> {
    const response = await client.apisauce.get("/api/mobile/suppliers", toBackendParams(params))
    return normalizeApiResponse(response, suppliersSchema, { forbiddenMeansAuth: true })
  },
}

export function normalizeSupplierDetailId(supplierId: string | undefined): string | undefined {
  const parsedSupplierId = pathIdSchema.safeParse(supplierId)

  return parsedSupplierId.success ? parsedSupplierId.data : undefined
}

export function normalizeSupplierSearchParams(
  params: SupplierSearchParams = {},
): SupplierSearchParams {
  return {
    ...normalizeParam("query", params.query),
    ...normalizeParam("categoryId", params.categoryId),
    ...normalizeParam("region", params.region),
    ...normalizeParam("language", params.language),
  }
}

function toBackendParams(params: SupplierSearchParams): ListSuppliersParams {
  const normalized = normalizeSupplierSearchParams(params)

  return {
    ...normalizeParam("q", normalized.query),
    ...normalizeParam("categoryId", normalized.categoryId),
    ...normalizeParam("region", normalized.region),
    ...normalizeParam("language", normalized.language),
  }
}

function normalizeParam<Key extends string>(key: Key, value: string | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue ? ({ [key]: trimmedValue } as Record<Key, string>) : {}
}
