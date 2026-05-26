import { fireEvent, render, screen } from "@testing-library/react-native"
import i18n from "i18next"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import type { QuoteRequestDto } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"

import { SubmissionReceipt } from "./SubmissionReceipt"

jest.mock("react-native-edge-to-edge", () => ({
  SystemBars: () => null,
}))

jest.mock("react-native-safe-area-context", () =>
  Object.assign({}, jest.requireActual("react-native-safe-area-context"), {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
  }),
)

jest.mock("@/i18n/translate", () => ({
  translate: (key: string, options?: Record<string, any>) => {
    const i18next = require("i18next")
    const catalog = i18next.language.startsWith("en")
      ? jest.requireActual("@/i18n/en").default
      : jest.requireActual("@/i18n/de").default
    const [namespace, path] = key.split(":")
    const value = path
      .split(".")
      .reduce((current: any, segment: string) => current?.[segment], catalog[namespace])

    if (typeof value !== "string") return key

    return Object.entries(options ?? {}).reduce(
      (resolved, [option, replacement]) =>
        resolved.replace(new RegExp(`{{\\s*${option}\\s*}}`, "g"), String(replacement)),
      value,
    )
  },
}))

describe("SubmissionReceipt", () => {
  beforeEach(() => {
    i18n.language = "de"
  })

  test("renders saved reference, unavailable dispatch state, and next actions", () => {
    const onViewRequests = jest.fn()
    const onStartAnotherSearch = jest.fn()

    renderReceipt({
      onStartAnotherSearch,
      onViewRequests,
      request: requestFixture,
    })

    expect(screen.getByText(de.funeralHome.rfq.receipt.title)).toBeTruthy()
    expect(screen.getByText("request-123")).toBeTruthy()
    expect(screen.getByText(de.funeralHome.rfq.receipt.dispatch.unavailable)).toBeTruthy()

    fireEvent.press(screen.getByText(de.funeralHome.rfq.receipt.actions.viewRequests))
    fireEvent.press(screen.getByText(de.funeralHome.rfq.receipt.actions.startSearch))
    expect(onViewRequests).toHaveBeenCalledTimes(1)
    expect(onStartAnotherSearch).toHaveBeenCalledTimes(1)
  })

  test("renders real dispatch status when backend provides it", () => {
    renderReceipt({
      onStartAnotherSearch: jest.fn(),
      onViewRequests: jest.fn(),
      request: {
        ...requestFixture,
        emailDispatch: {
          id: "dispatch-1",
          relatedEntityType: "QuoteRequest",
          relatedEntityId: "request-123",
          toAddress: "supplier@example.com",
          templateId: "quote-request",
          providerMessageId: null,
          status: "QUEUED",
          sentAt: null,
          deliveredAt: null,
          lastEventAt: null,
        },
      },
    })

    expect(screen.getByText(de.funeralHome.rfq.receipt.dispatch.queued)).toBeTruthy()
  })
})

const requestFixture: QuoteRequestDto = {
  id: "request-123",
  funeralHomeId: "fh-1",
  supplierId: "supplier-1",
  categoryId: "cat-flowers",
  subject: "Kränze",
  message: "Bitte ein Angebot vorbereiten.",
  deadline: "2026-06-10T23:59:59.000+02:00",
  attributes: { notes: "Weiße Blumen" },
  attachments: [],
  status: "SENT",
  createdAt: "2026-05-26T08:00:00.000+02:00",
  sentAt: "2026-05-26T08:00:00.000+02:00",
  respondedAt: null,
}

function renderReceipt({
  onStartAnotherSearch,
  onViewRequests,
  request,
}: {
  onStartAnotherSearch: () => void
  onViewRequests: () => void
  request: QuoteRequestDto
}) {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <SubmissionReceipt
          onStartAnotherSearch={onStartAnotherSearch}
          onViewRequests={onViewRequests}
          request={request}
        />
      </ThemeProvider>
    </SafeAreaProvider>,
  )
}
