/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { ApiResponse, ApisauceInstance, create } from "apisauce"

import Config from "@/config"
import { getSessionAccessTokenForApi } from "@/services/session/accessTokenProvider"

import type { ApiConfig } from "./types"

type AccessTokenProvider = () => string | null | undefined
type UnauthorizedHandler = () => Promise<boolean>
type UnauthorizedFailureHandler = () => void
type RetryRequestConfig = Parameters<ApisauceInstance["any"]>[0] & {
  __isRetryRequest?: boolean
}
type RequestReplay = (config: RetryRequestConfig) => Promise<ApiResponse<unknown>>

const AUTH_OPTIONAL_ENDPOINTS = new Set([
  "/api/mobile/auth/login",
  "/api/mobile/auth/refresh",
  "/api/mobile/auth/logout",
])

function normalizeRequestPath(url: string): string {
  try {
    return new URL(url, "https://mobile.local").pathname.replace(/\/+$/, "")
  } catch {
    return url.split("?")[0].replace(/\/+$/, "")
  }
}

function isAuthOptionalEndpoint(url: string): boolean {
  return AUTH_OPTIONAL_ENDPOINTS.has(normalizeRequestPath(url))
}

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig
  private accessTokenProvider: AccessTokenProvider
  private requestReplay: RequestReplay
  private unauthorizedFailureHandler?: UnauthorizedFailureHandler
  private unauthorizedHandler?: UnauthorizedHandler
  private unauthorizedRefreshPromise: Promise<boolean> | null

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.accessTokenProvider = getSessionAccessTokenForApi
    this.unauthorizedRefreshPromise = null
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
    this.requestReplay = (requestConfig) => this.apisauce.any(requestConfig)
    this.apisauce.addRequestTransform((request) => {
      if (request.url && isAuthOptionalEndpoint(request.url)) {
        delete request.headers?.Authorization
        return
      }

      const accessToken = this.accessTokenProvider()
      request.headers = request.headers ?? {}

      if (accessToken) {
        request.headers.Authorization = `Bearer ${accessToken}`
      } else {
        delete request.headers.Authorization
      }
    })
    this.apisauce.addAsyncResponseTransform(async (response) => {
      await this.handleUnauthorizedResponse(response)
    })
  }

  setAccessTokenProvider(provider: AccessTokenProvider): void {
    this.accessTokenProvider = provider
  }

  setUnauthorizedHandler(handler: UnauthorizedHandler): void {
    this.unauthorizedHandler = handler
  }

  setUnauthorizedFailureHandler(handler: UnauthorizedFailureHandler): void {
    this.unauthorizedFailureHandler = handler
  }

  setRequestReplay(replay: RequestReplay): void {
    this.requestReplay = replay
  }

  private async handleUnauthorizedResponse(response: ApiResponse<unknown>): Promise<void> {
    const requestConfig = response.config as RetryRequestConfig | null | undefined
    const requestUrl = requestConfig?.url

    if (
      response.status !== 401 ||
      !requestConfig ||
      !requestUrl ||
      requestConfig.__isRetryRequest ||
      isAuthOptionalEndpoint(requestUrl) ||
      !this.unauthorizedHandler
    ) {
      return
    }

    let refreshed = false

    try {
      refreshed = await this.refreshUnauthorizedOnce()
    } catch {
      this.unauthorizedFailureHandler?.()
      return
    }

    if (!refreshed) return

    const retryConfig: RetryRequestConfig = {
      ...requestConfig,
      __isRetryRequest: true,
      headers: {
        ...requestConfig.headers,
      },
    }
    const accessToken = this.accessTokenProvider()

    if (accessToken) {
      retryConfig.headers = {
        ...retryConfig.headers,
        Authorization: `Bearer ${accessToken}`,
      }
    }

    let replayResponse: ApiResponse<unknown>

    try {
      replayResponse = await this.requestReplay(retryConfig)
    } catch {
      return
    }

    if (replayResponse.status === 401) {
      this.unauthorizedFailureHandler?.()
    }

    Object.assign(response, replayResponse)
  }

  private async refreshUnauthorizedOnce(): Promise<boolean> {
    if (!this.unauthorizedHandler) return false

    if (!this.unauthorizedRefreshPromise) {
      this.unauthorizedRefreshPromise = this.unauthorizedHandler().finally(() => {
        this.unauthorizedRefreshPromise = null
      })
    }

    return this.unauthorizedRefreshPromise
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
