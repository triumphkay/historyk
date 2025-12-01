import React from "react";
import { StyleSheet } from "react-native";
import { IconButton, Surface } from "react-native-paper";
import { spacing } from "../../theme/spacing";
import AppText from "../common/AppText";

interface QuizNavigationProps {
  currentIndex: number;
  totalProblems: number;
  onPrevious: () => void;
  onNext: () => void;
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({
  currentIndex,
  totalProblems,
  onPrevious,
  onNext,
}) => {
  return (
    <Surface style={styles.navigationBar} elevation={0}>
      <IconButton
        icon="chevron-left"
        onPress={onPrevious}
        disabled={currentIndex === 0}
        size={32}
      />
      <AppText variant="bodyLarge">
        <AppText style={styles.current}>{currentIndex + 1}</AppText> / {totalProblems}
      </AppText>
      <IconButton
        icon="chevron-right"
        onPress={onNext}
        disabled={currentIndex === totalProblems - 1}
        size={32}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  navigationBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  current: {
    fontWeight: "800",
  },
});

export default QuizNavigation;
