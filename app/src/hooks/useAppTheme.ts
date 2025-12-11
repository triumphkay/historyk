import { useTheme } from 'react-native-paper';
import { AppTheme } from '../theme';

export const useAppTheme = () => useTheme<AppTheme>();
