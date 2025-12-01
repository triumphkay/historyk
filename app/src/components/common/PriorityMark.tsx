import React, { useMemo } from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import type { TextStyle, StyleProp, ViewStyle } from "react-native";
import { typography } from "../../theme/typography";
import { getScoreFrequencyLabel } from "../../utils/score";
import { colors, frequency } from "@theme/colors";

interface PriorityMarkProps {
  scores: Array<number | string>;
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}

const getImportanceColor = (label: string): string => {
  switch (label) {
    case "매우 높음":
      return frequency.veryHigh; // 빨간색
    case "높음":
      return frequency.high; // 주황색
    case "보통":
      return frequency.normal; // 노란색
    case "낮음":
      return frequency.low; // 초록색
    default:
      return colors.primary; // 회색 (기본값)
  }
};

const PriorityMark: React.FC<PriorityMarkProps> = ({
  scores,
  textStyle,
  style,
}) => {
  const theme = useTheme();
  const label = useMemo(() => getScoreFrequencyLabel(scores), [scores]);

  if (!label) {
    return null;
  }

  const color = getImportanceColor(label);

  return (
    <View
      style={[{ flexDirection: "row", alignItems: "center", gap: 6 }, style]}
    >
      <Text style={[styles.text, textStyle]}>중요도:</Text>
      <Text style={[styles.point, textStyle]}>{label}</Text>
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
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  point: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
};

export default PriorityMark;
