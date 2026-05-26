import type { ApiErrorResponse, ApiOkResponse } from "apisauce"

import type { ApiClientLike } from "./apiResult"
import { timelineApi } from "./timelineApi"

const timelineEventFixture = {
  id: "timeline-1",
  type: "REQUEST_SENT",
  title: "Anfrage gesendet",
  description: "Die Anfrage wurde an den Lieferanten gesendet.",
  occurredAt: "2026-05-26T08:00:00.000+02:00",
  status: "DONE",
  actorRole: "FUNERAL_HOME_USER",
  relatedEntityType: "QUOTE_REQUEST",
  relatedEntityId: "request-123",
}

function createClient(response: ApiOkResponse<unknown> | ApiErrorResponse<unknown>) {
  return {
    apisauce: {
      get: jest.fn().mockResolvedValue(response),
      post: jest.fn(),
    },
  } satisfies ApiClientLike
}

describe("timelineApi.getQuoteRequestTimeline", () => {
  test("encodes request id, calls the mobile timeline endpoint, and parses events", async () => {
    const client = createClient({
      ok: true,
      status: 200,
      data: { data: [timelineEventFixture] },
    } as ApiOkResponse<unknown>)

    await expect(timelineApi.getQuoteRequestTimeline(" request/123 ", client)).resolves.toEqual({
      ok: true,
      data: [timelineEventFixture],
    })

    expect(client.apisauce.get).toHaveBeenCalledWith(
      "/api/mobile/quote-requests/request%2F123/timeline",
    )
  })

  test("rejects empty request ids before making a network call", async () => {
    const client = createClient({
      ok: true,
      status: 200,
      data: { data: [] },
    } as ApiOkResponse<unknown>)

    await expect(timelineApi.getQuoteRequestTimeline("   ", client)).resolves.toMatchObject({
      ok: false,
      problem: "validation",
    })
    expect(client.apisauce.get).not.toHaveBeenCalled()
  })

  test.each([
    ["empty timeline", { ok: true, status: 200, data: { data: [] } }, { ok: true, data: [] }],
    [
      "system actor event",
      {
        ok: true,
        status: 200,
        data: { data: [{ ...timelineEventFixture, actorRole: "SYSTEM" }] },
      },
      { ok: true, data: [{ ...timelineEventFixture, actorRole: "SYSTEM" }] },
    ],
    [
      "malformed data",
      { ok: true, status: 200, data: { data: [{ ...timelineEventFixture, status: "INFO" }] } },
      { ok: false, problem: "bad-data" },
    ],
    [
      "access denied",
      {
        ok: false,
        status: 403,
        problem: "CLIENT_ERROR",
        data: { error: { code: "FORBIDDEN", message: "Forbidden" } },
      },
      { ok: false, problem: "access-denied" },
    ],
    ["network failure", { ok: false, problem: "NETWORK_ERROR" }, { ok: false, problem: "network" }],
  ] as const)("maps %s responses", async (_, response, expected) => {
    const client = createClient(response as ApiOkResponse<unknown> | ApiErrorResponse<unknown>)

    await expect(timelineApi.getQuoteRequestTimeline("request-123", client)).resolves.toMatchObject(
      expected,
    )
  })
})
