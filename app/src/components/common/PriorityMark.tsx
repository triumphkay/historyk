import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import AppText from "./AppText";
import type { TextStyle, StyleProp, ViewStyle } from "react-native";
import { typography } from "../../theme/typography";
import { getScoreFrequencyLabel } from "../../utils/score";
import { colors, frequency } from "@theme/colors";
import texts from "../../../assets/texts.json";

interface PriorityMarkProps {
  scores: Array<number | string>;
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}

const getImportanceColor = (label: string): string => {
  switch (label) {
    case texts.componentContents.prioprityVeryHigh:
      return frequency.veryHigh; // 빨간색
    case texts.componentContents.prioprityHigh:
      return frequency.high; // 주황색
    case texts.componentContents.prioprityNormal:
      return frequency.normal; // 노란색
    case texts.componentContents.prioprityLow:
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
      <AppText style={[styles.text, textStyle]}>
        {texts.componentContents.prioprity}:
      </AppText>
      <AppText style={[styles.point, textStyle]}>{label}</AppText>
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

const styles = StyleSheet.create({
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
  },
  point: {
    fontSize: typography.sizes.xs,
    fontWeight: "bold",
  },
});

export default PriorityMark;
