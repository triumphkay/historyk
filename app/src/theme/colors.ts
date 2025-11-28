/**
 * Application Color Palette
 *
 * This file defines all colors used throughout the application.
 * Update these values to change the app's color scheme globally.
 */

export const LEVEL_0 = "#FFFFFF";
export const LEVEL_1 = "#F1EFED";
export const LEVEL_2 = "#E3E0DA";
export const LEVEL_3 = "#D5D0C8"; // key value
export const LEVEL_4 = "#B8B4AC";
export const LEVEL_5 = "#9B9790";
export const LEVEL_6 = "#7E7B73";
export const LEVEL_7 = "#615E57";
export const LEVEL_8 = "#44423B"; // key value
export const LEVEL_9 = "#2D2C27";
export const LEVEL_10 = "#171614";
export const LEVEL_11 = "#000000";

// Base Colors
export const LIGHT_COLOR = LEVEL_3; // 밝은 색 (배경, 컨테이너)
export const DARK_COLOR = LEVEL_8; // 어두운 색 (텍스트, Primary)
export const POINT_COLOR_1 = "#D54942"; // 포인트 컬러 1 (강조, Secondary)
export const POINT_COLOR_2 = "#5265F8"; // 포인트 컬러 2 (Tertiary)

// alert Colors

export const frequency = {
  veryHigh: "#FF0000",
  high: "#FF8C00",
  normal: "#FFD700",
  low: "#00FF00",
};

// Derived Colors
export const colors = {
  // Primary
  primary: DARK_COLOR,
  onPrimary: "#FFFFFF",
  primaryContainer: LIGHT_COLOR,
  onPrimaryContainer: DARK_COLOR,

  // Secondary (Point Color 1)
  secondary: POINT_COLOR_1,
  onSecondary: "#FFFFFF",
  secondaryContainer: "#FFE8E6",
  onSecondaryContainer: "#5A1412",

  // Tertiary (Point Color 2)
  tertiary: POINT_COLOR_2,
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#E0E3FF",
  onTertiaryContainer: "#0A1A5C",

  // Error (using Point Color 1)
  error: POINT_COLOR_1,
  onError: "#FFFFFF",
  errorContainer: "#FFE8E6",
  onErrorContainer: "#5A1412",

  // Background
  background: "#FDFCFB",
  onBackground: DARK_COLOR,

  // Surface
  surface: "#FDFCFB",
  onSurface: DARK_COLOR,
  surfaceVariant: "#E8E4DC",
  onSurfaceVariant: "#5A5850",
  surfaceDisabled: "rgba(68, 66, 59, 0.12)",
  onSurfaceDisabled: "rgba(68, 66, 59, 0.38)",

  // Outline
  outline: "#7A7770",
  outlineVariant: "#CCC8C0",

  // Other
  shadow: "#000000",
  scrim: "#000000",
  inverseSurface: DARK_COLOR,
  inverseOnSurface: "#F5F3EF",
  inversePrimary: LIGHT_COLOR,
  backdrop: "rgba(68, 66, 59, 0.4)",

  // Elevation levels
  elevation: {
    level0: "transparent",
    level1: "#F7F5F2",
    level2: "#F4F1EE",
    level3: "#F0EDE9",
    level4: "#EFEAE6",
    level5: "#ECE8E3",
  },
} as const;

// Dark theme colors (for future use)
export const darkColors = {
  primary: LIGHT_COLOR,
  onPrimary: DARK_COLOR,
  primaryContainer: "#5A5850",
  onPrimaryContainer: "#E8E4DC",

  secondary: "#FFB3AE",
  onSecondary: "#5A1412",
  secondaryContainer: "#7D2E2A",
  onSecondaryContainer: "#FFE8E6",

  tertiary: "#B8C3FF",
  onTertiary: "#0A1A5C",
  tertiaryContainer: "#2E3F8F",
  onTertiaryContainer: "#E0E3FF",

  error: "#FFB3AE",
  onError: "#5A1412",
  errorContainer: "#7D2E2A",
  onErrorContainer: "#FFE8E6",

  background: "#1C1B19",
  onBackground: "#E8E4DC",

  surface: "#1C1B19",
  onSurface: "#E8E4DC",
  surfaceVariant: "#5A5850",
  onSurfaceVariant: "#CCC8C0",
  surfaceDisabled: "rgba(232, 228, 220, 0.12)",
  onSurfaceDisabled: "rgba(232, 228, 220, 0.38)",

  outline: "#95918C",
  outlineVariant: "#5A5850",

  shadow: "#000000",
  scrim: "#000000",
  inverseSurface: "#E8E4DC",
  inverseOnSurface: DARK_COLOR,
  inversePrimary: DARK_COLOR,
  backdrop: "rgba(68, 66, 59, 0.4)",

  elevation: {
    level0: "transparent",
    level1: "#24221F",
    level2: "#292724",
    level3: "#2E2C28",
    level4: "#302D29",
    level5: "#33302C",
  },
} as const;
