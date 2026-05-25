import { fireEvent, render } from "@testing-library/react-native"
import i18n from "i18next"
import { SafeAreaProvider } from "react-native-safe-area-context"

import de from "@/i18n/de"
import en from "@/i18n/en"
import { ThemeProvider } from "@/theme/context"

import { AppSearchHeader } from "./AppSearchHeader"

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

function renderHeader(props: Partial<React.ComponentProps<typeof AppSearchHeader>> = {}) {
  const onQueryChange = jest.fn()
  const onClearQuery = jest.fn()

  return {
    onClearQuery,
    onQueryChange,
    ...render(
      <SafeAreaProvider>
        <ThemeProvider>
          <AppSearchHeader
            query=""
            resultCount={0}
            onQueryChange={onQueryChange}
            onClearQuery={onClearQuery}
            {...props}
          />
        </ThemeProvider>
      </SafeAreaProvider>,
    ),
  }
}

describe("AppSearchHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    i18n.language = "de"
  })

  test("renders localized supplier search copy and forwards search text", () => {
    const screen = renderHeader()

    expect(screen.getByText(de.funeralHome.discover.search.eyebrow)).toBeTruthy()
    expect(screen.getByPlaceholderText(de.funeralHome.discover.search.placeholder)).toBeTruthy()
    expect(
      screen.getByLabelText(de.funeralHome.discover.search.inputAccessibilityLabel),
    ).toBeTruthy()
    expect(
      screen.getByLabelText(de.funeralHome.discover.search.resultCountAccessibilityLabel),
    ).toBeTruthy()

    fireEvent.changeText(
      screen.getByPlaceholderText(de.funeralHome.discover.search.placeholder),
      "Floristik",
    )

    expect(screen.onQueryChange).toHaveBeenCalledWith("Floristik")
  })

  test("localizes accessibility labels in English", () => {
    i18n.language = "en"

    const screen = renderHeader()

    expect(
      screen.getByLabelText(en.funeralHome.discover.search.inputAccessibilityLabel),
    ).toBeTruthy()
    expect(
      screen.getByLabelText(en.funeralHome.discover.search.resultCountAccessibilityLabel),
    ).toBeTruthy()
  })

  test("shows reversible selected-search state with an individual clear affordance", () => {
    const screen = renderHeader({ query: "Floristik", resultCount: 2 })

    expect(screen.getByText(de.funeralHome.discover.search.selectedLabel)).toBeTruthy()
    expect(screen.getByText(de.funeralHome.discover.search.clearQueryAction)).toBeTruthy()
    expect(screen.getByText("2")).toBeTruthy()

    fireEvent.press(screen.getByText(de.funeralHome.discover.search.clearQueryAction))
    expect(screen.onClearQuery).toHaveBeenCalledTimes(1)
  })
})
