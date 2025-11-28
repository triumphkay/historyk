import 'styled-components/native';
import { colors } from './colors';

// styled-components 테마 타입 확장
declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: typeof colors;
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    typography: {
      sizes: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
      };
      weights: {
        regular: string;
        medium: string;
        bold: string;
      };
    };
    borderRadius: {
      sm: number;
      md: number;
      lg: number;
      full: number;
    };
  }
}
