import {
  MD3DarkTheme,
  MD3LightTheme,
  configureFonts,
} from "react-native-paper";
import { colors, darkColors } from "./colors";

const fontConfig = {
  ...MD3LightTheme.fonts,
  default: {
    ...MD3LightTheme.fonts.default,
    fontFamily: "NotoSansKR-Regular",
  },
};

const paperFonts = configureFonts({
  config: fontConfig,
});

export const lightTheme = {
  ...MD3LightTheme,
  dark: false,
  fonts: paperFonts,
  colors: colors,
};

export const darkTheme = {
  ...MD3DarkTheme,
  dark: true,
  fonts: paperFonts,
  colors: darkColors,
};

// Re-export colors for direct use in components
export {
  POINT_COLOR_1,
  POINT_COLOR_2,
  LIGHT_COLOR,
  DARK_COLOR,
} from "./colors";
