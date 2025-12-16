import React from "react";
import { StyleSheet } from "react-native";
import { Surface, useTheme } from "react-native-paper";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import AppText from "./AppText";
import { AppTheme } from "../../theme";

interface KeywordChipProps {
  text: string;
  variant?: "front" | "back";
}

const KeywordChip: React.FC<KeywordChipProps> = ({
  text,
  variant = "front",
}) => {
  const theme = useTheme<AppTheme>();

  const chipBgColor =
    variant === "back" ? theme.colors.level3 : theme.colors.onGrey;
  const chipTextColor =
    variant === "back" ? theme.colors.level8 : theme.colors.grey;

  return (
    <Surface
      elevation={1}
      style={[styles.chip, { backgroundColor: chipBgColor }]}
    >
      <AppText style={[styles.chipText, { color: chipTextColor }]}>
        {text}
      </AppText>
    </Surface>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    // paddingVertical: 8,
    height: 42,
    borderRadius: 21,
    // alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: typography.sizes.lg,
    fontWeight: 700,
    // height: typography.sizes.xxl,
    // height: 26,
    // lineHeight: 25,
    // lineHeight: typography.sizes.xxl,
  },
});

export default KeywordChip;
