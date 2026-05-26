import { QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native"
import i18n from "i18next"
import { SafeAreaProvider } from "react-native-safe-area-context"

import type { QuoteFormFieldDescriptor } from "@/domain/requests/quoteFormSchema"
import de from "@/i18n/de"
import { quoteRequestsApi } from "@/services/api/quoteRequestsApi"
import type { CategoryDto, SupplierDto } from "@/services/api/types"
import { createQueryClient } from "@/services/query/queryClient"
import { ThemeProvider } from "@/theme/context"

import { useRfqFormContextQuery } from "./hooks/useRfqFormContextQuery"
import {
  RfqFormScreen,
  buildCreateQuoteRequestInput,
  composePreparedRequestAttributes,
} from "./RfqFormScreen"

const mockRouterReplace = jest.fn()

jest.mock("expo-router", () => ({
  router: {
    replace: (...args: unknown[]) => mockRouterReplace(...args),
  },
}))

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useScrollToTop: jest.fn(),
}))

jest.mock("react-native-keyboard-controller", () => {
  const { ScrollView } = require("react-native")

  return {
    KeyboardAwareScrollView: ScrollView,
  }
})

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

jest.mock("./hooks/useRfqFormContextQuery", () => ({
  useRfqFormContextQuery: jest.fn(),
}))

jest.mock("@/services/api/quoteRequestsApi", () => ({
  quoteRequestsApi: {
    createQuoteRequest: jest.fn(),
  },
}))

const category: CategoryDto = {
  id: "cat-flowers",
  slug: "flowers",
  nameDe: "Trauerfloristik",
  nameEn: "Funeral floristry",
  parentId: null,
  icon: "flower",
  isActive: true,
  quoteFormSchema: {},
}

const supplier: SupplierDto = {
  id: "supplier-1",
  legalName: "Trauerhilfe GmbH",
  tradingName: "Trauerhilfe Berlin",
  hrCourt: null,
  hrType: null,
  hrNumber: null,
  vatId: null,
  address: {
    street: "Hauptstr. 1",
    zip: "10115",
    city: "Berlin",
    country: "DE",
  },
  phone: "+4930123456",
  contactEmail: "kontakt@trauerhilfe.example",
  publicDescription: null,
  logoUrl: null,
  categoryIds: ["cat-flowers"],
  regionsServed: ["Berlin"],
  languages: ["de"],
  certifications: [],
  accountStatus: "ACTIVE",
  subscriptionTier: "basic",
  billingEmail: "rechnung@trauerhilfe.example",
  createdAt: "2026-05-01T10:00:00.000Z",
}

function mockReadyContext(fields?: QuoteFormFieldDescriptor[]) {
  jest.mocked(useRfqFormContextQuery).mockReturnValue({
    contextStatus: "ready",
    data: {
      category,
      schema: {
        fields: fields ?? [
          {
            errorKey: "funeralHome:rfq.validation.required",
            id: "notes",
            label: "Besondere Hinweise",
            required: true,
            sourcePath: "fields.0",
            type: "text",
          },
          {
            errorKey: "funeralHome:rfq.errors.unsupportedField",
            id: "matrix",
            label: "Interne Matrix",
            required: false,
            sourcePath: "fields.1",
            type: "unsupported",
          },
        ],
        status: "ready",
        warnings: [],
      },
      supplier,
    },
    refetch: jest.fn(),
  })
}

function renderRfqForm() {
  const queryClient = createQueryClient({
    defaultOptions: {
      mutations: { gcTime: 0 },
      queries: { gcTime: 0 },
    },
  })

  return render(
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RfqFormScreen categoryId="cat-flowers" supplierId="supplier-1" />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>,
  )
}

describe("RfqFormScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    i18n.language = "de"
  })

  test("renders supplier/category context, universal fields, and dynamic descriptors", () => {
    mockReadyContext()

    renderRfqForm()

    expect(screen.getByText(de.funeralHome.rfq.title)).toBeTruthy()
    expect(screen.getAllByText("Trauerhilfe Berlin").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Trauerfloristik").length).toBeGreaterThan(0)
    expect(screen.queryByText("supplier-1")).toBeNull()
    expect(screen.getByLabelText(de.funeralHome.rfq.fields.subjectA11y)).toBeTruthy()
    expect(screen.getByLabelText(de.funeralHome.rfq.fields.messageA11y)).toBeTruthy()
    expect(screen.getByLabelText(de.funeralHome.rfq.fields.deadlineA11y)).toBeTruthy()
    expect(screen.getByText("Besondere Hinweise")).toBeTruthy()
    expect(screen.getByText(de.funeralHome.rfq.errors.unsupportedField)).toBeTruthy()
  })

  test("shows inline validation and preserves entered data after failed continue", async () => {
    mockReadyContext()

    renderRfqForm()

    fireEvent.changeText(
      screen.getByLabelText(de.funeralHome.rfq.fields.messageA11y),
      "Bitte vormittags liefern.",
    )
    fireEvent.press(screen.getByText(de.funeralHome.rfq.actions.continueToReview))

    await waitFor(() => {
      expect(screen.getAllByText(de.funeralHome.rfq.validation.required).length).toBeGreaterThan(0)
    })
    expect(screen.getByDisplayValue("Bitte vormittags liefern.")).toBeTruthy()
  })

  test("rejects blank text, invalid calendar dates, and invalid quantity before review", async () => {
    mockReadyContext()

    renderRfqForm()

    fireEvent.changeText(screen.getByLabelText(de.funeralHome.rfq.fields.subjectA11y), "   ")
    fireEvent.changeText(screen.getByLabelText(de.funeralHome.rfq.fields.messageA11y), "   ")
    fireEvent.changeText(
      screen.getByLabelText(de.funeralHome.rfq.fields.deadlineA11y),
      "2026-02-31",
    )
    fireEvent.changeText(screen.getByLabelText(de.funeralHome.rfq.fields.quantityA11y), "many")
    fireEvent.changeText(screen.getByLabelText("Besondere Hinweise"), "Weiße Blumen")
    fireEvent.press(screen.getByText(de.funeralHome.rfq.actions.continueToReview))

    await waitFor(() => {
      expect(screen.queryByText(de.funeralHome.rfq.review.title)).toBeNull()
      expect(screen.getAllByText(de.funeralHome.rfq.validation.required).length).toBeGreaterThan(0)
      expect(screen.getByText(de.funeralHome.rfq.validation.date)).toBeTruthy()
      expect(screen.getByText(de.funeralHome.rfq.validation.quantity)).toBeTruthy()
    })
  })

  test("continues to a real review summary without submitting", async () => {
    mockReadyContext()

    renderRfqForm()

    fillValidForm()
    fireEvent.press(screen.getByText(de.funeralHome.rfq.actions.continueToReview))

    await waitFor(() => {
      expect(screen.getByText(de.funeralHome.rfq.review.title)).toBeTruthy()
    })
    expect(screen.getAllByText("Trauerhilfe Berlin").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Trauerfloristik").length).toBeGreaterThan(0)
    expect(screen.getByText("Kränze")).toBeTruthy()
    expect(screen.getByText("Weiße Blumen")).toBeTruthy()
    expect(quoteRequestsApi.createQuoteRequest).not.toHaveBeenCalled()
  })

  test("edit links return to the form and updated values appear in review", async () => {
    mockReadyContext()

    renderRfqForm()

    fillValidForm()
    fireEvent.press(screen.getByText(de.funeralHome.rfq.actions.continueToReview))

    await waitFor(() => {
      expect(screen.getByText(de.funeralHome.rfq.review.title)).toBeTruthy()
    })

    fireEvent.press(screen.getAllByText(de.funeralHome.rfq.review.editAction)[0])
    await waitFor(() => {
      expect(screen.getByLabelText(de.funeralHome.rfq.fields.subjectA11y)).toBeTruthy()
    })

    fireEvent.changeText(screen.getByLabelText(de.funeralHome.rfq.fields.subjectA11y), "Urnenkranz")
    fireEvent.press(screen.getByText(de.funeralHome.rfq.actions.continueToReview))

    await waitFor(() => {
      expect(screen.getByText("Urnenkranz")).toBeTruthy()
    })
    expect(screen.getByText("Bitte ein Angebot vorbereiten.")).toBeTruthy()
  })

  test("renders localized blocked states for missing or invalid context", () => {
    jest.mocked(useRfqFormContextQuery).mockReturnValue({
      contextStatus: "missing-context",
      errorKey: "funeralHome:rfq.states.missingContextBody",
    })

    renderRfqForm()

    expect(screen.getByText(de.funeralHome.rfq.states.blockedTitle)).toBeTruthy()
    expect(screen.getByText(de.funeralHome.rfq.states.missingContextBody)).toBeTruthy()
    fireEvent.press(screen.getByText(de.funeralHome.rfq.states.backToDiscoverAction))
    expect(mockRouterReplace).toHaveBeenCalledWith("/funeral-home/discover")
  })

  test("blocks review when a required unsupported dynamic field cannot be captured", async () => {
    jest.mocked(useRfqFormContextQuery).mockReturnValue({
      contextStatus: "ready",
      data: {
        category,
        schema: {
          fields: [
            {
              errorKey: "funeralHome:rfq.errors.unsupportedField",
              id: "matrix",
              label: "Interne Matrix",
              required: true,
              sourcePath: "fields.0",
              type: "unsupported",
            },
          ],
          status: "ready",
          warnings: [],
        },
        supplier,
      },
      refetch: jest.fn(),
    })

    renderRfqForm()

    fireEvent.changeText(screen.getByLabelText(de.funeralHome.rfq.fields.subjectA11y), "Kränze")
    fireEvent.changeText(
      screen.getByLabelText(de.funeralHome.rfq.fields.messageA11y),
      "Bitte ein Angebot vorbereiten.",
    )
    fireEvent.changeText(
      screen.getByLabelText(de.funeralHome.rfq.fields.deadlineA11y),
      "2026-06-10",
    )
    fireEvent.press(screen.getByText(de.funeralHome.rfq.actions.continueToReview))

    await waitFor(() => {
      expect(screen.queryByText(de.funeralHome.rfq.review.title)).toBeNull()
    })
  })

  test("maps optional quantity into request attributes without backend submission", () => {
    expect(
      composePreparedRequestAttributes({
        attributes: { notes: "Hinweis" },
        deadline: "2026-06-10",
        message: "Nachricht",
        quantity: "  4  ",
        subject: "Betreff",
      }),
    ).toEqual({
      notes: "Hinweis",
      quantity: "4",
    })
  })

  test("builds create payload with backend date deadline and numeric dynamic values", () => {
    const input = buildCreateQuoteRequestInput({
      categoryId: "cat-flowers",
      fields: [
        {
          errorKey: "funeralHome:rfq.validation.required",
          id: "count",
          label: "Anzahl",
          required: false,
          sourcePath: "fields.1",
          type: "number",
        },
      ],
      supplierId: "supplier-1",
      values: {
        attributes: { count: "3", notes: "Hinweis" },
        deadline: " 2026-06-10 ",
        message: " Bitte ein Angebot vorbereiten. ",
        quantity: "2",
        subject: " Kränze ",
      },
    })

    expect(input).toMatchObject({
      attachments: [],
      attributes: { count: 3, notes: "Hinweis", quantity: "2" },
      categoryId: "cat-flowers",
      deadline: "2026-06-10",
      message: "Bitte ein Angebot vorbereiten.",
      subject: "Kränze",
      supplierId: "supplier-1",
    })
  })

  test("submits once while pending and renders a receipt on success", async () => {
    mockReadyContext()
    jest.mocked(quoteRequestsApi.createQuoteRequest).mockResolvedValue({
      ok: true,
      data: {
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
      },
    })

    renderRfqForm()
    fillValidForm()
    fireEvent.press(screen.getByText(de.funeralHome.rfq.actions.continueToReview))
    await waitFor(() => {
      expect(screen.getByText(de.funeralHome.rfq.review.title)).toBeTruthy()
    })

    fireEvent.press(screen.getByText(de.funeralHome.rfq.actions.send))
    fireEvent.press(screen.getByText(de.funeralHome.rfq.actions.send))

    await waitFor(() => {
      expect(screen.getByText(de.funeralHome.rfq.receipt.title)).toBeTruthy()
    })
    expect(screen.getByText("request-123")).toBeTruthy()
    expect(screen.getByText(de.funeralHome.rfq.receipt.dispatch.unavailable)).toBeTruthy()
    expect(quoteRequestsApi.createQuoteRequest).toHaveBeenCalledTimes(1)
    expect(jest.mocked(quoteRequestsApi.createQuoteRequest).mock.calls[0][2]).toMatch(/^rfq-/)
  })

  test("shows recoverable submit failure and keeps form data editable", async () => {
    mockReadyContext()
    jest.mocked(quoteRequestsApi.createQuoteRequest).mockResolvedValue({
      ok: false,
      problem: "network",
      messageKey: "funeralHome:rfq.submit.errors.network",
    })

    renderRfqForm()
    fillValidForm()
    fireEvent.press(screen.getByText(de.funeralHome.rfq.actions.continueToReview))
    await waitFor(() => {
      expect(screen.getByText(de.funeralHome.rfq.review.title)).toBeTruthy()
    })

    fireEvent.press(screen.getByText(de.funeralHome.rfq.actions.send))
    await waitFor(() => {
      expect(screen.getByText(de.funeralHome.rfq.submit.errors.network)).toBeTruthy()
    })

    fireEvent.press(screen.getByText(de.funeralHome.rfq.review.backToEdit))
    await waitFor(() => {
      expect(screen.getByDisplayValue("Kränze")).toBeTruthy()
    })
  })

  test("recovers from unexpected submit exceptions and allows retry", async () => {
    mockReadyContext()
    jest
      .mocked(quoteRequestsApi.createQuoteRequest)
      .mockRejectedValueOnce(new Error("transport failed"))
      .mockResolvedValueOnce({
        ok: true,
        data: {
          id: "request-123",
          funeralHomeId: "fh-1",
          supplierId: "supplier-1",
          categoryId: "cat-flowers",
          subject: "Kränze",
          message: "Bitte ein Angebot vorbereiten.",
          deadline: "2026-06-10",
          attributes: { notes: "Weiße Blumen" },
          attachments: [],
          status: "SENT",
          createdAt: "2026-05-26T08:00:00.000+02:00",
          sentAt: "2026-05-26T08:00:00.000+02:00",
          respondedAt: null,
        },
      })

    renderRfqForm()
    fillValidForm()
    fireEvent.press(screen.getByText(de.funeralHome.rfq.actions.continueToReview))
    await waitFor(() => {
      expect(screen.getByText(de.funeralHome.rfq.review.title)).toBeTruthy()
    })

    fireEvent.press(screen.getByText(de.funeralHome.rfq.actions.send))
    await waitFor(() => {
      expect(screen.getByText(de.funeralHome.rfq.submit.errors.network)).toBeTruthy()
    })

    fireEvent.press(screen.getByText(de.funeralHome.rfq.actions.send))
    await waitFor(() => {
      expect(screen.getByText(de.funeralHome.rfq.receipt.title)).toBeTruthy()
    })
    expect(quoteRequestsApi.createQuoteRequest).toHaveBeenCalledTimes(2)
  })
})

function fillValidForm() {
  fireEvent.changeText(screen.getByLabelText(de.funeralHome.rfq.fields.subjectA11y), "Kränze")
  fireEvent.changeText(
    screen.getByLabelText(de.funeralHome.rfq.fields.messageA11y),
    "Bitte ein Angebot vorbereiten.",
  )
  fireEvent.changeText(screen.getByLabelText(de.funeralHome.rfq.fields.deadlineA11y), "2026-06-10")
  fireEvent.changeText(screen.getByLabelText("Besondere Hinweise"), "Weiße Blumen")
}
