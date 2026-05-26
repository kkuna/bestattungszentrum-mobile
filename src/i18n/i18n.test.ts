import {
  formatDate,
  formatDateOnly,
  loadDateFnsLocale,
  resolveDateFnsLocaleName,
} from "@/utils/formatDate"

import de from "./de"
import en from "./en"
import {
  defaultLocale,
  fallbackLocale,
  getInitialLocale,
  getPrimaryLanguageTag,
  isSupportedLanguageTag,
} from "./locale"

describe("German-first locale selection", () => {
  it("defaults to German for first launch instead of using the device locale", () => {
    expect(defaultLocale).toBe("de")
    expect(getInitialLocale([{ languageTag: "en-US" }])).toBe("de")
  })

  it("keeps English as the secondary fallback catalog", () => {
    expect(fallbackLocale).toBe("en")
    expect(isSupportedLanguageTag("en")).toBe(true)
    expect(isSupportedLanguageTag("en-US")).toBe(true)
    expect(isSupportedLanguageTag("ar")).toBe(false)
    expect(isSupportedLanguageTag("fr-FR")).toBe(false)
    expect(en.auth.entry.title).toBe("Workspace access")
  })

  it("normalizes language tags to their primary tag", () => {
    expect(getPrimaryLanguageTag("de-DE")).toBe("de")
    expect(getPrimaryLanguageTag("en-US")).toBe("en")
    expect(getPrimaryLanguageTag("fr-FR")).toBe("fr")
  })

  it("keeps German and English shell catalogs structurally aligned", () => {
    expect(de.auth.entry).toEqual(
      expect.objectContaining({
        body: expect.any(String),
        forgotPasswordAction: expect.any(String),
        legalAction: expect.any(String),
        loginAction: expect.any(String),
        signupAction: expect.any(String),
        title: expect.any(String),
      }),
    )
    expect(Object.keys(de.auth.entry).sort()).toEqual(Object.keys(en.auth.entry).sort())
    expect(Object.keys(de.shared.legal).sort()).toEqual(Object.keys(en.shared.legal).sort())
  })

  it("loads German date-fns locale when German is active", () => {
    expect(resolveDateFnsLocaleName("de")).toBe("de")
    expect(resolveDateFnsLocaleName("de-DE")).toBe("de")
    expect(resolveDateFnsLocaleName("en-US")).toBe("en-US")
    expect(resolveDateFnsLocaleName("unsupported")).toBe("de")
  })

  it("formats dates with the loaded German date-fns locale", () => {
    loadDateFnsLocale()

    expect(formatDate("2026-05-24", "MMMM dd, yyyy")).toBe("Mai 24, 2026")
    expect(formatDateOnly("2026-06-10", "dd. MMM yyyy")).toBe("10. Juni 2026")
    expect(() => formatDateOnly("2026-02-31", "dd. MMM yyyy")).toThrow("Invalid date-only value")
  })
})
