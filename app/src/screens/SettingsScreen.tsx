import React from 'react';
import { StyleSheet } from 'react-native';
import { List, Surface, Switch, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ThemePreference, useThemePreference } from '../context/ThemePreferenceContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = () => {
  const theme = useTheme();
  const { preference, setPreference } = useThemePreference();
  const isDarkMode = preference === 'dark';

  const toggleDarkMode = async () => {
    await setPreference(isDarkMode ? 'light' : 'dark');
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>설정</Text>
      <List.Section>
        <List.Item
          title="다크 모드"
          titleStyle={{ color: theme.colors.onSurface }}
          right={() => (
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              color={theme.colors.primary}
            />
          )}
        />
      </List.Section>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md
  }
});

export default SettingsScreen;
