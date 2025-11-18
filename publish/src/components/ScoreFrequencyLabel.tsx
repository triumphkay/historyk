import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { getScoreFrequencyLabel } from '../utils/score';

interface ScoreFrequencyLabelProps {
  scores: Array<number | string>;
}

const ScoreFrequencyLabel: React.FC<ScoreFrequencyLabelProps> = ({ scores }) => {
  const theme = useTheme();
  const label = useMemo(() => getScoreFrequencyLabel(scores), [scores]);

  if (!label) {
    return null;
  }

  return (
    <Surface elevation={0} style={styles.container}>
      <Text style={[styles.text, { color: theme.colors.onSurfaceVariant }]}>{`출제빈도: ${label}`}</Text>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md
  },
  text: {
    fontSize: typography.sizes.md
  }
});

export default ScoreFrequencyLabel;
