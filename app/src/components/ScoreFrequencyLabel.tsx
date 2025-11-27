import React, { useMemo } from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import type { TextStyle, StyleProp } from "react-native";
import { typography } from "../theme/typography";
import { getScoreFrequencyLabel } from "../utils/score";

interface ScoreFrequencyLabelProps {
  scores: Array<number | string>;
  textStyle?: StyleProp<TextStyle>;
}

const getImportanceColor = (label: string): string => {
  switch (label) {
    case "매우 높음":
      return "#FF0000"; // 빨간색
    case "높음":
      return "#FF8C00"; // 주황색
    case "보통":
      return "#FFD700"; // 노란색
    case "낮음":
      return "#00FF00"; // 초록색
    default:
      return "#808080"; // 회색 (기본값)
  }
};

const ScoreFrequencyLabel: React.FC<ScoreFrequencyLabelProps> = ({
  scores,
  textStyle,
}) => {
  const theme = useTheme();
  const label = useMemo(() => getScoreFrequencyLabel(scores), [scores]);

  if (!label) {
    return null;
  }

  const color = getImportanceColor(label);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Text
        style={[styles.text, { color: theme.colors.onSurfaceVariant }, textStyle]}
      >{`중요도: ${label}`}</Text>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        }}
      />
    </View>
  );
};

const styles = {
  text: {
    fontSize: typography.sizes.md,
  },
};

export default ScoreFrequencyLabel;
