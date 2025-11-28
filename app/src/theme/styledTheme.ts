import { colors } from './colors';

/**
 * Styled Components Theme
 * 
 * This theme is used with styled-components/native
 * Import and use with: const theme = useTheme();
 */
export const styledTheme = {
  colors,
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
    weights: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 999,
  },
} as const;
