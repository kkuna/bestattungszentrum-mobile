export const defaultLocale = "de"
export const fallbackLocale = "en"

export const supportedLocaleTags = ["de", "en"] as const

export type SupportedLocaleTag = (typeof supportedLocaleTags)[number]

export function getPrimaryLanguageTag(languageTag: string) {
  return languageTag.split("-")[0]
}

export function isSupportedLanguageTag(languageTag: string): languageTag is SupportedLocaleTag {
  const primaryTag = getPrimaryLanguageTag(languageTag)
  return supportedLocaleTags.includes(primaryTag as SupportedLocaleTag)
}

export function getInitialLocale(
  _deviceLocales: { languageTag: string }[] = [],
  savedLanguageTag?: string,
): SupportedLocaleTag {
  if (savedLanguageTag && isSupportedLanguageTag(savedLanguageTag)) {
    return getPrimaryLanguageTag(savedLanguageTag) as SupportedLocaleTag
  }

  return defaultLocale
}
