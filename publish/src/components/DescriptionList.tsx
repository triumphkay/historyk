import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface DescriptionListProps {
  descriptions: string[];
}

const DescriptionList: React.FC<DescriptionListProps> = ({ descriptions }) => {
  const theme = useTheme();

  return (
    <Surface elevation={0} style={styles.container}>
      {descriptions.map((description, index) => (
        <Text key={`${index}-${description.slice(0, 8)}`} style={[styles.description, { color: theme.colors.onSurface }]}>
          {`${index + 1}. ${description}`}
        </Text>
      ))}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
    gap: spacing.sm
  },
  description: {
    fontSize: typography.sizes.md,
    lineHeight: 22
  }
});

export default DescriptionList;
