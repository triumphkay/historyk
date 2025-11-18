import React from 'react';
import { StyleSheet } from 'react-native';
import { List, SegmentedButtons, Surface, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ThemePreference, useThemePreference } from '../context/ThemePreferenceContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = () => {
  const theme = useTheme();
  const { preference, setPreference } = useThemePreference();

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>설정</Text>
      <List.Section>
        <List.Subheader style={{ color: theme.colors.onSurfaceVariant }}>테마 설정</List.Subheader>
        <SegmentedButtons
          value={preference}
          onValueChange={(value) => setPreference(value as ThemePreference)}
          buttons={[
            { label: '라이트 모드', value: 'light' },
            { label: '다크 모드', value: 'dark' },
            { label: '시스템 설정', value: 'system' }
          ]}
          style={styles.segment}
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
  },
  segment: {
    marginTop: spacing.sm
  }
});

export default SettingsScreen;
