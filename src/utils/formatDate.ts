// Note the syntax of these imports from the date-fns library.
// If you import with the syntax: import { format } from "date-fns" the ENTIRE library
// will be included in your production bundle (even if you only use one function).
// This is because react-native does not support tree-shaking.
import { format } from "date-fns/format"
import type { Locale } from "date-fns/locale"
import { parseISO } from "date-fns/parseISO"
import i18n from "i18next"

import { defaultLocale, getPrimaryLanguageTag } from "@/i18n/locale"

type Options = Parameters<typeof format>[2]

let dateFnsLocale: Locale

export const resolveDateFnsLocaleName = (languageTag = i18n.language) => {
  const primaryTag = getPrimaryLanguageTag(languageTag ?? defaultLocale)

  switch (primaryTag) {
    case "de":
      return "de"
    case "en":
      return "en-US"
    case "ar":
      return "ar"
    case "ko":
      return "ko"
    case "es":
      return "es"
    case "fr":
      return "fr"
    case "hi":
      return "hi"
    case "ja":
      return "ja"
    default:
      return defaultLocale
  }
}

export const loadDateFnsLocale = () => {
  switch (resolveDateFnsLocaleName()) {
    case "de":
      dateFnsLocale = require("date-fns/locale/de").de
      break
    case "en-US":
      dateFnsLocale = require("date-fns/locale/en-US").enUS
      break
    case "ar":
      dateFnsLocale = require("date-fns/locale/ar").ar
      break
    case "ko":
      dateFnsLocale = require("date-fns/locale/ko").ko
      break
    case "es":
      dateFnsLocale = require("date-fns/locale/es").es
      break
    case "fr":
      dateFnsLocale = require("date-fns/locale/fr").fr
      break
    case "hi":
      dateFnsLocale = require("date-fns/locale/hi").hi
      break
    case "ja":
      dateFnsLocale = require("date-fns/locale/ja").ja
      break
  }
}

export const formatDate = (date: string, dateFormat?: string, options?: Options) => {
  const dateOptions = {
    ...options,
    locale: dateFnsLocale,
  }
  return format(parseISO(date), dateFormat ?? "MMM dd, yyyy", dateOptions)
}
