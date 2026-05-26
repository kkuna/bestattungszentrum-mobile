import { getEmailDispatchStatusDisplay } from "./emailDispatchStatusDisplay"

describe("getEmailDispatchStatusDisplay", () => {
  test.each([
    ["QUEUED", "warning", "funeralHome:rfq.receipt.dispatch.queued"],
    ["SENT", "success", "funeralHome:rfq.receipt.dispatch.sent"],
    ["DELIVERED", "success", "funeralHome:rfq.receipt.dispatch.sent"],
    ["BOUNCED", "danger", "funeralHome:rfq.receipt.dispatch.failed"],
    ["COMPLAINED", "danger", "funeralHome:rfq.receipt.dispatch.failed"],
  ] as const)("maps %s to semantic receipt copy", (status, tone, labelKey) => {
    expect(getEmailDispatchStatusDisplay({ status })).toMatchObject({
      labelKey,
      tone,
    })
  })

  test("maps missing dispatch data to unavailable copy", () => {
    expect(getEmailDispatchStatusDisplay(undefined)).toEqual({
      accessibilityLabelKey: "funeralHome:rfq.receipt.dispatch.unavailableA11y",
      labelKey: "funeralHome:rfq.receipt.dispatch.unavailable",
      tone: "neutral",
    })
  })
})
