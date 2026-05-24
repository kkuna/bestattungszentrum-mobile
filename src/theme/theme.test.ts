import { darkTheme, lightTheme } from "./theme"
import { customFontsToLoad, typography } from "./typography"

const requiredColorKeys = [
  "primary",
  "primaryPressed",
  "primaryAccent",
  "onPrimary",
  "background",
  "surface",
  "surfaceWarm",
  "ink",
  "text",
  "textMuted",
  "border",
  "success",
  "warning",
  "danger",
  "info",
] as const

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "")
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16) / 255,
    g: Number.parseInt(normalized.slice(2, 4), 16) / 255,
    b: Number.parseInt(normalized.slice(4, 6), 16) / 255,
  }
}

function channelToLinear(channel: number) {
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

function contrastRatio(foreground: string, background: string) {
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)
  const foregroundLuminance =
    0.2126 * channelToLinear(fg.r) + 0.7152 * channelToLinear(fg.g) + 0.0722 * channelToLinear(fg.b)
  const backgroundLuminance =
    0.2126 * channelToLinear(bg.r) + 0.7152 * channelToLinear(bg.g) + 0.0722 * channelToLinear(bg.b)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

describe("Bestattungszentrum theme", () => {
  it.each([
    ["light", lightTheme],
    ["dark", darkTheme],
  ])("exposes required semantic color tokens for the %s theme", (_name, theme) => {
    for (const colorKey of requiredColorKeys) {
      expect(theme.colors[colorKey]).toEqual(expect.any(String))
    }
  })

  it("uses the approved brand action colors without conflating danger and brand red", () => {
    expect(lightTheme.colors.primary).toBe("#B8312F")
    expect(lightTheme.colors.primaryPressed).toBe("#8E2422")
    expect(lightTheme.colors.primaryAccent).toBe("#C8102E")
    expect(lightTheme.colors.tint).toBe(lightTheme.colors.primary)
    expect(lightTheme.colors.error).toBe(lightTheme.colors.danger)
    expect(lightTheme.colors.danger).not.toBe(lightTheme.colors.primary)
  })

  it("keeps brand red contrast-safe on light and reversed action surfaces", () => {
    expect(
      contrastRatio(lightTheme.colors.primary, lightTheme.colors.surface),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(lightTheme.colors.onPrimary, lightTheme.colors.primary),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(lightTheme.colors.textMuted, lightTheme.colors.background),
    ).toBeGreaterThanOrEqual(4.5)
  })

  it("keeps button text contrast-safe in light and dark themes", () => {
    expect(
      contrastRatio(lightTheme.colors.primary, lightTheme.colors.surfaceWarm),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(lightTheme.colors.primary, lightTheme.colors.palette.primary100),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(lightTheme.colors.onPrimary, lightTheme.colors.primary),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(lightTheme.colors.onPrimary, lightTheme.colors.primaryPressed),
    ).toBeGreaterThanOrEqual(4.5)

    expect(
      contrastRatio(darkTheme.colors.palette.primary500, darkTheme.colors.surfaceWarm),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(darkTheme.colors.palette.primary500, darkTheme.colors.palette.neutral300),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(darkTheme.colors.onPrimary, darkTheme.colors.primary),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(darkTheme.colors.onPrimary, darkTheme.colors.primaryPressed),
    ).toBeGreaterThanOrEqual(4.5)
  })

  it.each([
    ["light", lightTheme],
    ["dark", darkTheme],
  ])(
    "keeps status foreground and background pairs contrast-safe in the %s theme",
    (_name, theme) => {
      expect(
        contrastRatio(theme.colors.success, theme.colors.successBackground),
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        contrastRatio(theme.colors.warning, theme.colors.warningBackground),
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        contrastRatio(theme.colors.danger, theme.colors.dangerBackground),
      ).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(theme.colors.info, theme.colors.infoBackground)).toBeGreaterThanOrEqual(
        4.5,
      )
    },
  )
})

describe("Bestattungszentrum typography", () => {
  it("uses a product UI font rather than Space Grotesk as the primary family", () => {
    expect(typography.primary.normal).not.toBe("spaceGroteskRegular")
    expect(typography.primary.medium).not.toBe("spaceGroteskMedium")
  })

  it("prepares a separate display family for restrained brand moments", () => {
    expect(typography.display.normal).toBe("cormorantGaramondRegular")
    expect(typography.display.bold).toBe("cormorantGaramondBold")
  })

  it("loads product and display fonts through the existing app font gate", () => {
    expect(customFontsToLoad).toHaveProperty("notoSansRegular")
    expect(customFontsToLoad).toHaveProperty("notoSansMedium")
    expect(customFontsToLoad).toHaveProperty("cormorantGaramondRegular")
    expect(customFontsToLoad).toHaveProperty("cormorantGaramondBold")
  })
})
