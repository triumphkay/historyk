/**
 * Application Color Palette
 *
 * This file defines all colors used throughout the application.
 * The palette is based on a level system from 0 (White) to 11 (Black).
 * Key colors are LEVEL_3 and LEVEL_8.
 */

// Level System (0: White -> 11: Black)
export const LEVEL_0 = "#FFFFFF";
export const LEVEL_1 = "#F1EFED";
export const LEVEL_2 = "#E3E0DA";
export const LEVEL_3 = "#D5D0C8"; // Key Color (Light Theme Background Accent / Dark Theme Text Accent)
export const LEVEL_4 = "#B8B4AC";
export const LEVEL_5 = "#9B9790";
export const LEVEL_6 = "#7E7B73";
export const LEVEL_7 = "#615E57";
export const LEVEL_8 = "#44423B"; // Key Color (Light Theme Text / Dark Theme Background Accent)
export const LEVEL_9 = "#2D2C27";
export const LEVEL_10 = "#171614";
export const LEVEL_11 = "#000000";

// Point Colors
export const POINT_COLOR_1 = "#D54942"; // Red (Emphasis, Secondary)
export const POINT_COLOR_2 = "#5265F8"; // Blue (Tertiary)

// Frequency Colors
export const frequency = {
  veryHigh: "#FF0000",
  high: "#FF8C00",
  normal: "#FFD700",
  low: "#00FF00",
};

// --- Color Definitions by Role (Light / Dark) ---

// Levels Mapping
const levels = {
  level0: { light: LEVEL_0, dark: LEVEL_11 },
  level1: { light: LEVEL_1, dark: LEVEL_10 },
  level2: { light: LEVEL_2, dark: LEVEL_9 },
  level3: { light: LEVEL_3, dark: LEVEL_8 },
  level4: { light: LEVEL_4, dark: LEVEL_7 },
  level5: { light: LEVEL_5, dark: LEVEL_6 },
  level6: { light: LEVEL_6, dark: LEVEL_5 },
  level7: { light: LEVEL_7, dark: LEVEL_4 },
  level8: { light: LEVEL_8, dark: LEVEL_3 },
  level9: { light: LEVEL_9, dark: LEVEL_2 },
  level10: { light: LEVEL_10, dark: LEVEL_1 },
  level11: { light: LEVEL_11, dark: LEVEL_0 },
};

// Primary
const primary = { light: LEVEL_8, dark: LEVEL_3 };
const onPrimary = { light: LEVEL_0, dark: LEVEL_11 };
const primaryContainer = { light: LEVEL_3, dark: LEVEL_8 };
const onPrimaryContainer = { light: LEVEL_9, dark: LEVEL_2 };

// Secondary
const secondary = { light: POINT_COLOR_1, dark: "#FFB3AE" };
const onSecondary = { light: LEVEL_0, dark: "#5A1412" };
const secondaryContainer = { light: "#FFE8E6", dark: "#7D2E2A" };
const onSecondaryContainer = { light: "#5A1412", dark: "#FFE8E6" };

// Grey
const grey = { light: LEVEL_1, dark: LEVEL_8 };
const onGrey = { light: LEVEL_8, dark: LEVEL_3 };
const greyContainer = { light: LEVEL_1, dark: LEVEL_10 };
const onGreyContainer = { light: LEVEL_8, dark: LEVEL_3 };

// Tertiary
const tertiary = { light: POINT_COLOR_2, dark: "#B8C3FF" };
const onTertiary = { light: LEVEL_0, dark: "#0A1A5C" };
const tertiaryContainer = { light: "#E0E3FF", dark: "#2E3F8F" };
const onTertiaryContainer = { light: "#0A1A5C", dark: "#E0E3FF" };

// Error
const error = { light: POINT_COLOR_1, dark: "#FFB3AE" };
const onError = { light: LEVEL_0, dark: "#5A1412" };
const errorContainer = { light: "#FFE8E6", dark: "#7D2E2A" };
const onErrorContainer = { light: "#5A1412", dark: "#FFE8E6" };

// Background & Surface
const background = { light: LEVEL_3, dark: LEVEL_8 };
const onBackground = { light: LEVEL_11, dark: LEVEL_1 };
const surface = { light: LEVEL_2, dark: LEVEL_10 };
const onSurface = { light: LEVEL_10, dark: LEVEL_2 };
const surfaceVariant = { light: LEVEL_1, dark: LEVEL_10 };
const onSurfaceVariant = { light: LEVEL_9, dark: LEVEL_3 };
const surfaceDisabled = {
  light: "rgba(68, 66, 59, 0.12)",
  dark: "rgba(213, 208, 200, 0.12)",
};
const onSurfaceDisabled = {
  light: "rgba(68, 66, 59, 0.38)",
  dark: "rgba(213, 208, 200, 0.38)",
};

// Outline
const outline = { light: LEVEL_6, dark: LEVEL_5 };
const outlineVariant = { light: LEVEL_4, dark: LEVEL_7 };

// Other
const shadow = { light: LEVEL_11, dark: LEVEL_11 };
const scrim = { light: LEVEL_11, dark: LEVEL_11 };
const inverseSurface = { light: LEVEL_9, dark: LEVEL_2 };
const inverseOnSurface = { light: LEVEL_1, dark: LEVEL_9 };
const inversePrimary = { light: LEVEL_3, dark: LEVEL_8 };
const backdrop = {
  light: "rgba(68, 66, 59, 0.4)",
  dark: "rgba(68, 66, 59, 0.4)",
};

// Elevation
const elevation = {
  level0: { light: "transparent", dark: "transparent" },
  level1: { light: LEVEL_0, dark: LEVEL_10 },
  level2: { light: LEVEL_1, dark: LEVEL_9 },
  level3: { light: LEVEL_2, dark: LEVEL_9 },
  level4: { light: LEVEL_2, dark: LEVEL_8 },
  level5: { light: LEVEL_3, dark: LEVEL_8 },
};

// --- Exported Theme Objects ---

export const colors = {
  // Levels
  level0: levels.level0.light,
  level1: levels.level1.light,
  level2: levels.level2.light,
  level3: levels.level3.light,
  level4: levels.level4.light,
  level5: levels.level5.light,
  level6: levels.level6.light,
  level7: levels.level7.light,
  level8: levels.level8.light,
  level9: levels.level9.light,
  level10: levels.level10.light,
  level11: levels.level11.light,

  // Primary
  primary: primary.light,
  onPrimary: onPrimary.light,
  primaryContainer: primaryContainer.light,
  onPrimaryContainer: onPrimaryContainer.light,

  // Secondary
  secondary: secondary.light,
  onSecondary: onSecondary.light,
  secondaryContainer: secondaryContainer.light,
  onSecondaryContainer: onSecondaryContainer.light,

  // Grey
  grey: grey.light,
  onGrey: onGrey.light,
  greyContainer: greyContainer.light,
  onGreyContainer: onGreyContainer.light,

  // Tertiary
  tertiary: tertiary.light,
  onTertiary: onTertiary.light,
  tertiaryContainer: tertiaryContainer.light,
  onTertiaryContainer: onTertiaryContainer.light,

  // Error
  error: error.light,
  onError: onError.light,
  errorContainer: errorContainer.light,
  onErrorContainer: onErrorContainer.light,

  // Background & Surface
  background: background.light,
  onBackground: onBackground.light,
  surface: surface.light,
  onSurface: onSurface.light,
  surfaceVariant: surfaceVariant.light,
  onSurfaceVariant: onSurfaceVariant.light,
  surfaceDisabled: surfaceDisabled.light,
  onSurfaceDisabled: onSurfaceDisabled.light,

  // Outline
  outline: outline.light,
  outlineVariant: outlineVariant.light,

  // Other
  shadow: shadow.light,
  scrim: scrim.light,
  inverseSurface: inverseSurface.light,
  inverseOnSurface: inverseOnSurface.light,
  inversePrimary: inversePrimary.light,
  backdrop: backdrop.light,

  // Elevation
  elevation: {
    level0: elevation.level0.light,
    level1: elevation.level1.light,
    level2: elevation.level2.light,
    level3: elevation.level3.light,
    level4: elevation.level4.light,
    level5: elevation.level5.light,
  },
} as const;

export const darkColors = {
  // Levels
  level0: levels.level0.dark,
  level1: levels.level1.dark,
  level2: levels.level2.dark,
  level3: levels.level3.dark,
  level4: levels.level4.dark,
  level5: levels.level5.dark,
  level6: levels.level6.dark,
  level7: levels.level7.dark,
  level8: levels.level8.dark,
  level9: levels.level9.dark,
  level10: levels.level10.dark,
  level11: levels.level11.dark,

  // Primary
  primary: primary.dark,
  onPrimary: onPrimary.dark,
  primaryContainer: primaryContainer.dark,
  onPrimaryContainer: onPrimaryContainer.dark,

  // Secondary
  secondary: secondary.dark,
  onSecondary: onSecondary.dark,
  secondaryContainer: secondaryContainer.dark,
  onSecondaryContainer: onSecondaryContainer.dark,

  // Grey
  grey: grey.dark,
  onGrey: onGrey.dark,
  greyContainer: greyContainer.dark,
  onGreyContainer: onGreyContainer.dark,

  // Tertiary
  tertiary: tertiary.dark,
  onTertiary: onTertiary.dark,
  tertiaryContainer: tertiaryContainer.dark,
  onTertiaryContainer: onTertiaryContainer.dark,

  // Error
  error: error.dark,
  onError: onError.dark,
  errorContainer: errorContainer.dark,
  onErrorContainer: onErrorContainer.dark,

  // Background & Surface
  background: background.dark,
  onBackground: onBackground.dark,
  surface: surface.dark,
  onSurface: onSurface.dark,
  surfaceVariant: surfaceVariant.dark,
  onSurfaceVariant: onSurfaceVariant.dark,
  surfaceDisabled: surfaceDisabled.dark,
  onSurfaceDisabled: onSurfaceDisabled.dark,

  // Outline
  outline: outline.dark,
  outlineVariant: outlineVariant.dark,

  // Other
  shadow: shadow.dark,
  scrim: scrim.dark,
  inverseSurface: inverseSurface.dark,
  inverseOnSurface: inverseOnSurface.dark,
  inversePrimary: inversePrimary.dark,
  backdrop: backdrop.dark,

  // Elevation
  elevation: {
    level0: elevation.level0.dark,
    level1: elevation.level1.dark,
    level2: elevation.level2.dark,
    level3: elevation.level3.dark,
    level4: elevation.level4.dark,
    level5: elevation.level5.dark,
  },
} as const;
