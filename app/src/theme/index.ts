import {
  MD3DarkTheme,
  MD3LightTheme,
  configureFonts,
} from "react-native-paper";
import { colors, darkColors } from "./colors";

const FONT = {
  notoLight: "NotoSansKR-200",
  notoRegular: "NotoSansKR-400",
  notoMedium: "NotoSansKR-600",
  notoBold: "NotoSansKR-800",
  myeongRegular: "NanumMyeongjo-400",
  myeongBold: "NanumMyeongjo-800",
};

type FontEntry = (typeof MD3LightTheme.fonts)[keyof typeof MD3LightTheme.fonts];

const buildFontEntry = (
  source: FontEntry,
  family: string,
  weight: FontEntry["fontWeight"]
): FontEntry => ({
  ...source,
  fontFamily: family,
  fontWeight: weight,
});

const fontConfig = {
  ...MD3LightTheme.fonts,
  default: {
    fontFamily: FONT.notoRegular,
    fontWeight: "400",
    letterSpacing: 0,
  },
  displayLarge: buildFontEntry(
    MD3LightTheme.fonts.displayLarge,
    FONT.myeongBold,
    "800"
  ),
  displayMedium: buildFontEntry(
    MD3LightTheme.fonts.displayMedium,
    FONT.myeongRegular,
    "400"
  ),
  displaySmall: buildFontEntry(
    MD3LightTheme.fonts.displaySmall,
    FONT.myeongRegular,
    "400"
  ),
  headlineLarge: buildFontEntry(
    MD3LightTheme.fonts.headlineLarge,
    FONT.myeongBold,
    "800"
  ),
  headlineMedium: buildFontEntry(
    MD3LightTheme.fonts.headlineMedium,
    FONT.myeongRegular,
    "400"
  ),
  headlineSmall: buildFontEntry(
    MD3LightTheme.fonts.headlineSmall,
    FONT.myeongRegular,
    "400"
  ),
  titleLarge: buildFontEntry(
    MD3LightTheme.fonts.titleLarge,
    FONT.notoBold,
    "800"
  ),
  titleMedium: buildFontEntry(
    MD3LightTheme.fonts.titleMedium,
    FONT.notoMedium,
    "600"
  ),
  titleSmall: buildFontEntry(
    MD3LightTheme.fonts.titleSmall,
    FONT.notoRegular,
    "400"
  ),
  bodyLarge: buildFontEntry(
    MD3LightTheme.fonts.bodyLarge,
    FONT.notoRegular,
    "400"
  ),
  bodyMedium: buildFontEntry(
    MD3LightTheme.fonts.bodyMedium,
    FONT.notoRegular,
    "400"
  ),
  bodySmall: buildFontEntry(
    MD3LightTheme.fonts.bodySmall,
    FONT.notoLight,
    "200"
  ),
  labelLarge: buildFontEntry(
    MD3LightTheme.fonts.labelLarge,
    FONT.notoBold,
    "800"
  ),
  labelMedium: buildFontEntry(
    MD3LightTheme.fonts.labelMedium,
    FONT.notoMedium,
    "600"
  ),
  labelSmall: buildFontEntry(
    MD3LightTheme.fonts.labelSmall,
    FONT.notoLight,
    "200"
  ),
};

const paperFonts = configureFonts({
  config: fontConfig,
});

export type AppTheme = typeof MD3LightTheme & {
  colors: typeof colors;
};

export const lightTheme: AppTheme = {
  ...MD3LightTheme,
  dark: false,
  fonts: paperFonts,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
    background: colors.level1, // Match app background to prevent white flash
  },
};

export const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  dark: true,
  fonts: paperFonts,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
};

// Re-export colors for direct use in components
export {
  POINT_COLOR_1,
  POINT_COLOR_2,
} from "./colors";
