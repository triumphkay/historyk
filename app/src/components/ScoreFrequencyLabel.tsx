import React, { useMemo } from 'react';
import { Text, useTheme } from 'react-native-paper';
import type { TextStyle } from 'react-native';
import { typography } from '../theme/typography';
import { getScoreFrequencyLabel } from '../utils/score';

interface ScoreFrequencyLabelProps {
  scores: Array<number | string>;
  textStyle?: TextStyle;
}

const ScoreFrequencyLabel: React.FC<ScoreFrequencyLabelProps> = ({ scores, textStyle }) => {
  const theme = useTheme();
  const label = useMemo(() => getScoreFrequencyLabel(scores), [scores]);

  if (!label) {
    return null;
  }

  return (
    <Text style={[styles.text, { color: theme.colors.onSurfaceVariant }, textStyle]}>{`중요도: ${label}`}</Text>
  );
};

const styles = {
  text: {
    fontSize: typography.sizes.md
  }
};

export default ScoreFrequencyLabel;
