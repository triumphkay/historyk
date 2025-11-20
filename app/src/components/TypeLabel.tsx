import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { pickDisplayType } from '../utils/types';
import { TypeDetail } from '../types/TypeDetail';
import typeMetadata from '../../assets/keyword-types.json';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const typeDetails = (typeMetadata as { 'types-details': TypeDetail[] })['types-details'] || [];

interface TypeLabelProps {
  types: string[];
}

const TypeLabel: React.FC<TypeLabelProps> = ({ types }) => {
  const theme = useTheme();
  const selectedType = useMemo(() => pickDisplayType(types), [types]);

  const questionText = useMemo(() => {
    if (!selectedType) {
      return null;
    }
    const detail = typeDetails.find((item) => item.title === selectedType);
    return detail?.question || selectedType;
  }, [selectedType]);

  if (!questionText) {
    return null;
  }

  return (
    <Surface elevation={1} style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Text style={[styles.text, { color: theme.colors.onSurface }]}>{questionText}</Text>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    marginBottom: spacing.sm
  },
  text: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium
  }
});

export default TypeLabel;
