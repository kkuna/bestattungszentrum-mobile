import { Platform } from "react-native"
import {
  CormorantGaramond_400Regular as cormorantGaramondRegular,
  CormorantGaramond_700Bold as cormorantGaramondBold,
} from "@expo-google-fonts/cormorant-garamond"
import {
  NotoSans_300Light as notoSansLight,
  NotoSans_400Regular as notoSansRegular,
  NotoSans_500Medium as notoSansMedium,
  NotoSans_600SemiBold as notoSansSemiBold,
  NotoSans_700Bold as notoSansBold,
} from "@expo-google-fonts/noto-sans"

export const customFontsToLoad = {
  notoSansLight,
  notoSansRegular,
  notoSansMedium,
  notoSansSemiBold,
  notoSansBold,
  cormorantGaramondRegular,
  cormorantGaramondBold,
}

const fonts = {
  notoSans: {
    light: "notoSansLight",
    normal: "notoSansRegular",
    medium: "notoSansMedium",
    semiBold: "notoSansSemiBold",
    bold: "notoSansBold",
  },
  cormorantGaramond: {
    normal: "cormorantGaramondRegular",
    bold: "cormorantGaramondBold",
  },
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.notoSans,
  display: fonts.cormorantGaramond,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: Platform.select({ ios: fonts.helveticaNeue, android: fonts.sansSerif }),
  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),
}
