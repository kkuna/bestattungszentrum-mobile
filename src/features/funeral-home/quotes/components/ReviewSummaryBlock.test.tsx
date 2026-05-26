import { fireEvent, render, screen } from "@testing-library/react-native"
import i18n from "i18next"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import { ThemeProvider } from "@/theme/context"

import { ReviewSummaryBlock, formatAttributeValue } from "./ReviewSummaryBlock"

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

describe("ReviewSummaryBlock", () => {
  beforeEach(() => {
    i18n.language = "de"
  })

  test("renders user-safe review values and edit actions", () => {
    const onEditBasics = jest.fn()
    const onEditCategoryFields = jest.fn()
    const onEditAttachments = jest.fn()

    renderReview({
      onEditAttachments,
      onEditBasics,
      onEditCategoryFields,
    })

    expect(screen.getByText(de.funeralHome.rfq.review.title)).toBeTruthy()
    expect(screen.getByText("Trauerhilfe Berlin")).toBeTruthy()
    expect(screen.getByText("Trauerfloristik")).toBeTruthy()
    expect(screen.getByText("Weiße Blumen")).toBeTruthy()
    expect(screen.queryByText("supplier-1")).toBeNull()
    expect(screen.queryByText("fields.0")).toBeNull()

    fireEvent.press(screen.getAllByText(de.funeralHome.rfq.review.editAction)[1])
    expect(onEditCategoryFields).toHaveBeenCalledTimes(1)
  })

  test("formats option, boolean, and missing dynamic values", () => {
    expect(
      formatAttributeValue(
        {
          errorKey: "funeralHome:rfq.validation.required",
          id: "color",
          label: "Farbe",
          options: [{ label: "Weiß", value: "WHITE" }],
          required: false,
          sourcePath: "fields.0",
          type: "select",
        },
        "WHITE",
      ),
    ).toBe("Weiß")
    expect(
      formatAttributeValue(
        {
          errorKey: "funeralHome:rfq.validation.required",
          id: "express",
          label: "Express",
          required: false,
          sourcePath: "fields.1",
          type: "boolean",
        },
        true,
      ),
    ).toBe(de.funeralHome.rfq.review.booleanYes)
    expect(
      formatAttributeValue(
        {
          errorKey: "funeralHome:rfq.validation.required",
          id: "missing",
          label: "Fehlt",
          required: false,
          sourcePath: "fields.2",
          type: "text",
        },
        "",
      ),
    ).toBe(de.funeralHome.rfq.review.notProvided)
  })
})

function renderReview(handlers: {
  onEditAttachments: () => void
  onEditBasics: () => void
  onEditCategoryFields: () => void
}) {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <ReviewSummaryBlock
          attachmentFields={[
            {
              errorKey: "funeralHome:rfq.validation.required",
              id: "upload",
              label: "Dokumente",
              required: false,
              sourcePath: "fields.2",
              type: "attachmentPlaceholder",
            },
          ]}
          categoryName="Trauerfloristik"
          dynamicFields={[
            {
              errorKey: "funeralHome:rfq.validation.required",
              id: "notes",
              label: "Besondere Hinweise",
              required: true,
              sourcePath: "fields.0",
              type: "text",
            },
          ]}
          supplierName="Trauerhilfe Berlin"
          values={{
            attributes: { notes: "Weiße Blumen" },
            deadline: "2026-06-10",
            message: "Bitte ein Angebot vorbereiten.",
            quantity: "",
            subject: "Kränze",
          }}
          {...handlers}
        />
      </ThemeProvider>
    </SafeAreaProvider>,
  )
}
