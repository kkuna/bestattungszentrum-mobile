import { Image } from "react-native"
import { fireEvent, render } from "@testing-library/react-native"
import i18n from "i18next"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import type { CategoryDto, SupplierDto } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"

import { SupplierCard } from "./SupplierCard"

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

jest.mock("react-native-safe-area-context", () =>
  Object.assign({}, jest.requireActual("react-native-safe-area-context"), {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
  }),
)

const category: CategoryDto = {
  id: "cat-flowers",
  slug: "flowers",
  nameDe: "Trauerfloristik",
  nameEn: "Funeral floristry",
  parentId: null,
  icon: "flower",
  quoteFormSchema: {},
  isActive: true,
}

const supplier: SupplierDto = {
  id: "supplier-1",
  legalName: "Trauerhilfe GmbH",
  tradingName: "Trauerhilfe Berlin",
  hrCourt: "AG Berlin",
  hrType: "HRB",
  hrNumber: "12345",
  vatId: "DE123456789",
  address: {
    street: "Hauptstrasse 1",
    zip: "10115",
    city: "Berlin",
    country: "DE",
  },
  phone: "+4930123456",
  contactEmail: "kontakt@trauerhilfe.example",
  publicDescription: "Regionale Begleitung fuer Bestattungsinstitute mit langen deutschen Texten.",
  logoUrl: null,
  categoryIds: ["cat-flowers", "cat-raw"],
  regionsServed: ["Berlin", "Brandenburg"],
  languages: ["de", "en"],
  certifications: ["DIN 15017"],
  accountStatus: "ACTIVE",
  subscriptionTier: "standard",
  billingEmail: "rechnung@trauerhilfe.example",
  createdAt: "2026-05-24T09:00:00.000Z",
}

function renderCard(overrides: Partial<SupplierDto> = {}, onOpenDetail = jest.fn()) {
  return {
    onOpenDetail,
    ...render(
      <SafeAreaProvider>
        <ThemeProvider>
          <SupplierCard
            supplier={{ ...supplier, ...overrides }}
            categories={[category]}
            onOpenDetail={onOpenDetail}
          />
        </ThemeProvider>
      </SafeAreaProvider>,
    ),
  }
}

describe("SupplierCard", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    i18n.language = "de"
  })

  test("renders supplier identity, fallback logo mark, localized category labels, and detail CTA", () => {
    const screen = renderCard()

    expect(screen.getByText("T")).toBeTruthy()
    expect(screen.getByText("Trauerhilfe Berlin")).toBeTruthy()
    expect(screen.getByText("Trauerfloristik")).toBeTruthy()
    expect(screen.queryByText("cat-raw")).toBeNull()
    expect(screen.getByText("Berlin, Brandenburg")).toBeTruthy()
    expect(screen.getByText("DE, EN")).toBeTruthy()
    expect(screen.getByText("DIN 15017")).toBeTruthy()
    expect(screen.getByText(de.funeralHome.discover.card.status.requestable)).toBeTruthy()
    expect(screen.getByLabelText(de.funeralHome.discover.card.status.requestableA11y)).toBeTruthy()

    fireEvent.press(screen.getByText(de.funeralHome.discover.card.detailAction))
    expect(screen.onOpenDetail).toHaveBeenCalledTimes(1)
  })

  test("falls back to legal name and labels inactive suppliers while still allowing detail review", () => {
    const screen = renderCard({
      accountStatus: "SUSPENDED",
      tradingName: "",
    })

    expect(screen.getByText("Trauerhilfe GmbH")).toBeTruthy()
    expect(screen.getByText(de.funeralHome.discover.card.status.unavailable)).toBeTruthy()
    fireEvent.press(screen.getByText(de.funeralHome.discover.card.detailAction))
    expect(screen.onOpenDetail).toHaveBeenCalledTimes(1)
  })

  test("ignores unsafe supplier logo URLs", () => {
    const screen = renderCard({ logoUrl: "javascript:alert(1)" })

    expect(screen.getByText("T")).toBeTruthy()
    expect(screen.UNSAFE_queryByType(Image)).toBeNull()
  })
})
