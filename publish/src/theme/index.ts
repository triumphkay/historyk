import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Update the values in lightThemeColors whenever you want to refresh the light palette.
const lightThemeColors = {
  primary: '#1A2A5A',
  onPrimary: '#F5F7FF',
  secondary: '#8C7A64',
  onSecondary: '#FFFFFF',
  background: '#F7F5EF',
  surface: '#FFFFFF',
  error: '#B3261E',
  outline: '#C2C2C2',
  text: '#1F1F1F',
  textSecondary: '#4A4A4A'
};

// Update the values in darkThemeColors whenever you want to refresh the dark palette.
const darkThemeColors = {
  primary: '#AFC0FF',
  onPrimary: '#0C122A',
  secondary: '#C4AE99',
  onSecondary: '#2B1F12',
  background: '#111217',
  surface: '#1B1C23',
  error: '#F2B8B5',
  outline: '#60636F',
  text: '#F4F4F4',
  textSecondary: '#C4C6CF'
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightThemeColors
  }
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkThemeColors
  }
};
