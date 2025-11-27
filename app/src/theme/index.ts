import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

const regularFont = {
  fontFamily: 'NotoSansKR-Regular',
  fontWeight: '400',
  letterSpacing: 0,
};

const mediumFont = {
  fontFamily: 'NotoSansKR-Medium',
  fontWeight: '500',
  letterSpacing: 0,
};

const boldFont = {
  fontFamily: 'NotoSansKR-Bold',
  fontWeight: '700',
  letterSpacing: 0,
};

const fontConfig = {
  displayLarge: regularFont,
  displayMedium: regularFont,
  displaySmall: regularFont,
  headlineLarge: regularFont,
  headlineMedium: regularFont,
  headlineSmall: regularFont,
  titleLarge: boldFont,
  titleMedium: mediumFont,
  titleSmall: mediumFont,
  bodyLarge: regularFont,
  bodyMedium: regularFont,
  bodySmall: regularFont,
  labelLarge: mediumFont,
  labelMedium: mediumFont,
  labelSmall: regularFont,
};

const paperFonts = configureFonts({
  config: fontConfig,
});

// Ivory-gray grayscale theme (key color #ff685b reserved for future use)
const lightThemeColors = {
  primary: '#3d3935',
  onPrimary: '#FFFFFF',
  primaryContainer: '#e8e6e3',
  onPrimaryContainer: '#1a1816',
  secondary: '#5f5b57',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#e5e2de',
  onSecondaryContainer: '#1c1b19',
  tertiary: '#5f5b57',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#e5e2de',
  onTertiaryContainer: '#1c1b19',
  background: '#fdfcfa',
  onBackground: '#1c1b19',
  surface: '#fdfcfa',
  onSurface: '#1c1b19',
  surfaceVariant: '#f0eee9',
  onSurfaceVariant: '#4a4744',
  surfaceDisabled: '#1c1b191f',
  onSurfaceDisabled: '#1c1b1961',
  error: '#ba1a1a',
  onError: '#FFFFFF',
  errorContainer: '#ffdad6',
  onErrorContainer: '#410002',
  outline: '#7b7773',
  outlineVariant: '#ccc9c4',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#313028',
  inverseOnSurface: '#f5f1ea',
  inversePrimary: '#c9c5c0',
  elevation: {
    level0: 'transparent',
    level1: '#f7f5f2',
    level2: '#f4f1ee',
    level3: '#f0ede9',
    level4: '#efeae6',
    level5: '#ece8e3'
  }
};

// Dark mode with ivory-gray grayscale
const darkThemeColors = {
  primary: '#c9c5c0',
  onPrimary: '#313028',
  primaryContainer: '#48453f',
  onPrimaryContainer: '#e5e2dc',
  secondary: '#cac6c1',
  onSecondary: '#323027',
  secondaryContainer: '#49453d',
  onSecondaryContainer: '#e6e3dd',
  tertiary: '#cac6c1',
  onTertiary: '#323027',
  tertiaryContainer: '#49453d',
  onTertiaryContainer: '#e6e3dd',
  background: '#1c1b19',
  onBackground: '#e6e3dd',
  surface: '#1c1b19',
  onSurface: '#e6e3dd',
  surfaceVariant: '#4a4744',
  onSurfaceVariant: '#ccc9c4',
  surfaceDisabled: '#e6e3dd1f',
  onSurfaceDisabled: '#e6e3dd61',
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  outline: '#95918c',
  outlineVariant: '#4a4744',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#e6e3dd',
  inverseOnSurface: '#313028',
  inversePrimary: '#3d3935',
  elevation: {
    level0: 'transparent',
    level1: '#24221f',
    level2: '#292724',
    level3: '#2e2c28',
    level4: '#302d29',
    level5: '#33302c'
  }
};

export const lightTheme = {
  ...MD3LightTheme,
  fonts: paperFonts,
  colors: {
    ...MD3LightTheme.colors,
    ...lightThemeColors
  }
};

export const darkTheme = {
  ...MD3DarkTheme,
  fonts: paperFonts,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkThemeColors
  }
};
