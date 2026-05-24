import { normalizeApiResponse, normalizeInput, type ApiClientLike } from "./apiResult"
import {
  authTokensSchema,
  currentUserSchema,
  loginInputSchema,
  logoutAllResultSchema,
  logoutInputSchema,
  logoutResultSchema,
  refreshSessionInputSchema,
} from "./schemas"
import type {
  AppApiResult,
  LoginInputDto,
  LogoutAllResultDto,
  LogoutInputDto,
  LogoutResultDto,
  MobileAuthTokensDto,
  MobileCurrentUserDto,
  RefreshSessionInputDto,
} from "./types"

import { api } from "."

export const authApi = {
  async login(
    input: LoginInputDto,
    client: ApiClientLike = api,
  ): Promise<AppApiResult<MobileAuthTokensDto>> {
    const validated = normalizeInput(input, loginInputSchema)
    if (!validated.ok) return validated

    const response = await client.apisauce.post("/api/mobile/auth/login", validated.data)
    return normalizeApiResponse(response, authTokensSchema)
  },

  async refreshSession(
    input: RefreshSessionInputDto,
    client: ApiClientLike = api,
  ): Promise<AppApiResult<MobileAuthTokensDto>> {
    const validated = normalizeInput(input, refreshSessionInputSchema)
    if (!validated.ok) return validated

    const response = await client.apisauce.post("/api/mobile/auth/refresh", validated.data)
    return normalizeApiResponse(response, authTokensSchema)
  },

  async getCurrentUser(client: ApiClientLike = api): Promise<AppApiResult<MobileCurrentUserDto>> {
    const response = await client.apisauce.get("/api/mobile/auth/me")
    return normalizeApiResponse(response, currentUserSchema, { forbiddenMeansAuth: true })
  },

  async logout(
    input: LogoutInputDto,
    client: ApiClientLike = api,
  ): Promise<AppApiResult<LogoutResultDto>> {
    const validated = normalizeInput(input, logoutInputSchema)
    if (!validated.ok) return validated

    const response = await client.apisauce.post("/api/mobile/auth/logout", validated.data)
    return normalizeApiResponse(response, logoutResultSchema)
  },

  async logoutAll(client: ApiClientLike = api): Promise<AppApiResult<LogoutAllResultDto>> {
    const response = await client.apisauce.post("/api/mobile/auth/logout-all")
    return normalizeApiResponse(response, logoutAllResultSchema, { forbiddenMeansAuth: true })
  },
}
