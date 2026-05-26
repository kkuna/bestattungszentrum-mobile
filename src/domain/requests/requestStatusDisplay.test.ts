import {
  getQuoteRequestStatusDisplay,
  getQuoteResponseStatusDisplay,
  getRequestHistoryEmailDispatchDisplay,
  getTimelineEventStatusDisplay,
} from "./requestStatusDisplay"

describe("request history status display", () => {
  test.each([
    ["DRAFT", "neutral", "funeralHome:quotes.status.request.DRAFT"],
    ["SENT", "info", "funeralHome:quotes.status.request.SENT"],
    ["RESPONDED", "success", "funeralHome:quotes.status.request.RESPONDED"],
    ["ACCEPTED", "success", "funeralHome:quotes.status.request.ACCEPTED"],
    ["REJECTED", "danger", "funeralHome:quotes.status.request.REJECTED"],
    ["EXPIRED", "warning", "funeralHome:quotes.status.request.EXPIRED"],
    ["CANCELLED", "neutral", "funeralHome:quotes.status.request.CANCELLED"],
  ] as const)("maps quote request status %s", (status, tone, labelKey) => {
    expect(getQuoteRequestStatusDisplay(status)).toMatchObject({
      labelKey,
      tone,
    })
  })

  test.each([
    ["SENT", "info", "funeralHome:quotes.status.response.SENT"],
    ["ACCEPTED", "success", "funeralHome:quotes.status.response.ACCEPTED"],
    ["REJECTED", "danger", "funeralHome:quotes.status.response.REJECTED"],
  ] as const)("maps quote response status %s", (status, tone, labelKey) => {
    expect(getQuoteResponseStatusDisplay(status)).toMatchObject({
      labelKey,
      tone,
    })
  })

  test("maps missing response and dispatch status to unavailable display", () => {
    expect(getQuoteResponseStatusDisplay(undefined)).toMatchObject({
      labelKey: "funeralHome:quotes.status.response.unavailable",
      tone: "neutral",
    })
    expect(getRequestHistoryEmailDispatchDisplay(undefined)).toMatchObject({
      labelKey: "funeralHome:quotes.status.dispatch.unavailable",
      tone: "neutral",
    })
  })

  test.each([
    ["DONE", "success", "funeralHome:quotes.status.timeline.DONE"],
    ["PENDING", "warning", "funeralHome:quotes.status.timeline.PENDING"],
    ["FAILED", "danger", "funeralHome:quotes.status.timeline.FAILED"],
  ] as const)("maps timeline status %s", (status, tone, labelKey) => {
    expect(getTimelineEventStatusDisplay({ status })).toMatchObject({
      labelKey,
      tone,
    })
  })
})
