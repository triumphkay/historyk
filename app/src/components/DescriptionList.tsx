import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Surface, useTheme } from 'react-native-paper';
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
        {descriptions.map((description, index) => {
          const sanitized = description.replace(/\d+/g, '').trim();
          if (!sanitized) {
            return null;
          }
          return (
            <Chip
              key={`${index}-${sanitized.slice(0, 8)}`}
              mode="outlined"
              style={[styles.chip, { borderColor: theme.colors.outline }]}
              textStyle={[styles.chipText, { color: theme.colors.onSurface }]}
            >
              {sanitized}
            </Chip>
          );
        })}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg
  },
  chipRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
    alignSelf: 'center'
  },
  chipText: {
    fontSize: typography.sizes.md,
    lineHeight: 22
  }
});

export default DescriptionList;
