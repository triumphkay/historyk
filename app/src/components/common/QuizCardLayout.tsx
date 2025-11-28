import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Surface, useTheme } from "react-native-paper";
import { spacing } from "../../theme/spacing";
import { quizScreenStyles } from "../../theme/quizStyles";

interface QuizCardLayoutProps {
  header?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "front" | "back";
  style?: ViewStyle;
}

const QuizCardLayout: React.FC<QuizCardLayoutProps> = ({
  header,
  body,
  footer,
  variant = "front",
  style,
}) => {
  const theme = useTheme();

  return (
    <Surface
      style={[
        quizScreenStyles.card,
        styles.card,
        variant === "front"
          ? { backgroundColor: theme.colors.greyContainer }
          : { backgroundColor: theme.colors.level6 },
        style,
      ]}
      elevation={3}
    >
      {/* Header Section */}
      <View style={styles.header}>{header}</View>

      {/* Body Section (Centered) */}
      <View style={styles.body}>{body}</View>

      {/* Footer Section */}
      <View style={styles.footer}>{footer}</View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    height: "100%",
    justifyContent: "space-between",
  },
  backCard: {
    // padding: spacing.lg,
    // alignItems: "stretch",
    // justifyContent: "flex-start",
  },
  header: {
    // paddingTop: spacing.sm,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // Default center, can be overridden by content style
  },
  footer: {
    // paddingBottom: spacing.md,
  },
});

export default QuizCardLayout;
