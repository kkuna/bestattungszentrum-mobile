import { getSessionAccessTokenForApi } from "@/services/session/accessTokenProvider"

import { Api, api } from "."

jest.mock("@/services/session/accessTokenProvider", () => ({
  getSessionAccessTokenForApi: jest.fn(() => null),
}))

function runRequestTransforms(api: Api, url: string) {
  const request = { headers: {}, url }
  api.apisauce.requestTransforms.forEach((transform) => transform(request))
  return request
}

describe("Api auth header injection", () => {
  beforeEach(() => {
    jest.mocked(getSessionAccessTokenForApi).mockReturnValue(null)
  })

  it("injects bearer tokens on the singleton API from the session provider", async () => {
    jest.mocked(getSessionAccessTokenForApi).mockReturnValue("singleton-access-token")

    expect(runRequestTransforms(api, "/api/mobile/categories").headers).toEqual({
      Authorization: "Bearer singleton-access-token",
    })
  })

  it("injects bearer tokens from the configured token provider", async () => {
    const api = new Api({ url: "https://example.test", timeout: 1000 })
    api.setAccessTokenProvider(() => "access-token")

    expect(runRequestTransforms(api, "/api/mobile/categories").headers).toEqual({
      Authorization: "Bearer access-token",
    })
  })

  it("does not set an authorization header when no token exists", () => {
    const api = new Api({ url: "https://example.test", timeout: 1000 })
    api.setAccessTokenProvider(() => null)

    expect(runRequestTransforms(api, "/api/mobile/categories").headers).toEqual({})
  })

  it("skips bearer injection for public auth endpoints", () => {
    const api = new Api({ url: "https://example.test", timeout: 1000 })
    api.setAccessTokenProvider(() => "stale-access-token")

    expect(runRequestTransforms(api, "/api/mobile/auth/login").headers).toEqual({})
    expect(runRequestTransforms(api, "/api/mobile/auth/refresh").headers).toEqual({})
    expect(runRequestTransforms(api, "/api/mobile/auth/login?tenant=fh-1").headers).toEqual({})
    expect(
      runRequestTransforms(api, "https://example.test/api/mobile/auth/logout/").headers,
    ).toEqual({})
  })
})
