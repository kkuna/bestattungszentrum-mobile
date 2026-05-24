import type { ApiResponse } from "apisauce"

import { Api } from "."

function createUnauthorizedResponse(): ApiResponse<unknown> {
  return {
    ok: false,
    problem: "CLIENT_ERROR",
    status: 401,
    data: { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
    headers: {},
    config: { url: "/api/mobile/categories", method: "get", headers: {} },
    duration: 1,
    originalError: null,
  } as unknown as ApiResponse<unknown>
}

async function runAsyncResponseTransforms(api: Api, response: ApiResponse<unknown>) {
  for (const transform of api.apisauce.asyncResponseTransforms) {
    await transform(response)
  }
  return response
}

describe("Api refresh and replay", () => {
  it("injects bearer for logout-all because the backend authenticates it by access token", () => {
    const api = new Api({ url: "https://example.test", timeout: 1000 })
    api.setAccessTokenProvider(() => "stale-access-token")
    const request = { headers: {}, url: "/api/mobile/auth/logout-all" }

    api.apisauce.requestTransforms.forEach((transform) => transform(request))

    expect(request.headers).toEqual({ Authorization: "Bearer stale-access-token" })
  })

  it("skips bearer injection for refresh-token body auth endpoints", () => {
    const api = new Api({ url: "https://example.test", timeout: 1000 })
    api.setAccessTokenProvider(() => "stale-access-token")
    const request = { headers: {}, url: "/api/mobile/auth/logout" }

    api.apisauce.requestTransforms.forEach((transform) => transform(request))

    expect(request.headers).toEqual({})
  })

  it("refreshes once and replaces a 401 response with the replay response", async () => {
    const api = new Api({ url: "https://example.test", timeout: 1000 })
    const refreshSession = jest.fn().mockResolvedValue(true)
    const replayResponse = {
      ok: true,
      problem: null,
      status: 200,
      data: { data: [{ id: "cat-1" }] },
      headers: {},
      config: { url: "/api/mobile/categories", method: "get", headers: {} },
      duration: 1,
    } as ApiResponse<unknown>

    api.setUnauthorizedHandler(refreshSession)
    api.setRequestReplay(async () => replayResponse)

    await expect(
      runAsyncResponseTransforms(api, createUnauthorizedResponse()),
    ).resolves.toMatchObject({
      ok: true,
      status: 200,
      data: { data: [{ id: "cat-1" }] },
    })

    expect(refreshSession).toHaveBeenCalledTimes(1)
  })

  it("does not retry a replayed request after another 401", async () => {
    const api = new Api({ url: "https://example.test", timeout: 1000 })
    const refreshSession = jest.fn().mockResolvedValue(true)
    const replayedUnauthorized = createUnauthorizedResponse()
    replayedUnauthorized.config = {
      ...replayedUnauthorized.config,
      __isRetryRequest: true,
    } as typeof replayedUnauthorized.config

    api.setUnauthorizedHandler(refreshSession)

    await runAsyncResponseTransforms(api, replayedUnauthorized)

    expect(refreshSession).not.toHaveBeenCalled()
  })

  it("clears local session when replay also returns 401", async () => {
    const api = new Api({ url: "https://example.test", timeout: 1000 })
    const refreshSession = jest.fn().mockResolvedValue(true)
    const clearSession = jest.fn()

    api.setUnauthorizedHandler(refreshSession)
    api.setUnauthorizedFailureHandler(clearSession)
    api.setRequestReplay(async () => createUnauthorizedResponse())

    await runAsyncResponseTransforms(api, createUnauthorizedResponse())

    expect(refreshSession).toHaveBeenCalledTimes(1)
    expect(clearSession).toHaveBeenCalledTimes(1)
  })

  it("leaves original auth failure response when refresh handler rejects", async () => {
    const api = new Api({ url: "https://example.test", timeout: 1000 })
    const clearSession = jest.fn()

    api.setUnauthorizedHandler(jest.fn().mockRejectedValue(new Error("offline")))
    api.setUnauthorizedFailureHandler(clearSession)

    await expect(
      runAsyncResponseTransforms(api, createUnauthorizedResponse()),
    ).resolves.toMatchObject({
      ok: false,
      status: 401,
    })
    expect(clearSession).toHaveBeenCalledTimes(1)
  })

  it("leaves original auth failure response when replay rejects", async () => {
    const api = new Api({ url: "https://example.test", timeout: 1000 })

    api.setUnauthorizedHandler(jest.fn().mockResolvedValue(true))
    api.setRequestReplay(async () => {
      throw new Error("replay failed")
    })

    await expect(
      runAsyncResponseTransforms(api, createUnauthorizedResponse()),
    ).resolves.toMatchObject({
      ok: false,
      status: 401,
    })
  })

  it("clears the response to auth failure when refresh cannot recover", async () => {
    const api = new Api({ url: "https://example.test", timeout: 1000 })
    const refreshSession = jest.fn().mockResolvedValue(false)

    api.setUnauthorizedHandler(refreshSession)

    await expect(
      runAsyncResponseTransforms(api, createUnauthorizedResponse()),
    ).resolves.toMatchObject({
      ok: false,
      status: 401,
    })

    expect(refreshSession).toHaveBeenCalledTimes(1)
  })

  it("shares one refresh across concurrent 401 responses and replays both requests", async () => {
    const api = new Api({ url: "https://example.test", timeout: 1000 })
    let resolveRefresh: (value: boolean) => void = jest.fn()
    const refreshPromise = new Promise<boolean>((resolve) => {
      resolveRefresh = resolve
    })
    const refreshSession = jest.fn().mockReturnValue(refreshPromise)
    const requestReplay = jest.fn().mockResolvedValue({
      ok: true,
      problem: null,
      status: 200,
      data: { data: [] },
      headers: {},
      config: { url: "/api/mobile/categories", method: "get", headers: {} },
      duration: 1,
    } as ApiResponse<unknown>)

    api.setUnauthorizedHandler(refreshSession)
    api.setRequestReplay(requestReplay)

    const first = runAsyncResponseTransforms(api, createUnauthorizedResponse())
    const second = runAsyncResponseTransforms(api, createUnauthorizedResponse())

    expect(refreshSession).toHaveBeenCalledTimes(1)
    resolveRefresh(true)

    await Promise.all([first, second])

    expect(refreshSession).toHaveBeenCalledTimes(1)
    expect(requestReplay).toHaveBeenCalledTimes(2)
  })
})
