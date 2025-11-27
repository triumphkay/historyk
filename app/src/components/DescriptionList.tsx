import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Surface, Text, useTheme } from 'react-native-paper';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface DescriptionListProps {
  descriptions: string[];
}

const DescriptionList: React.FC<DescriptionListProps> = ({ descriptions }) => {
  const theme = useTheme();

  return (
    <Surface elevation={0} style={styles.container}>
      <View style={styles.chipRow}>
        {descriptions.map((description, index) => (
          <Surface
            key={`${index}-${description.slice(0, 8)}`}
            elevation={1}
            style={[styles.chip, { backgroundColor: theme.colors.secondaryContainer }]}
          >
            <Text style={[styles.chipText, { color: theme.colors.onSecondaryContainer }]}>
              {description}
            </Text>
          </Surface>
        ))}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
    width: '100%',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: spacing.xs,
  },
  chipText: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
});

export default DescriptionList;
