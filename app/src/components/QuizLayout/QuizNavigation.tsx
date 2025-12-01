import React from "react";
import { StyleSheet } from "react-native";
import { IconButton, Surface, Text } from "react-native-paper";
import { spacing } from "../../theme/spacing";

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
    <Surface style={styles.navigationBar} elevation={1}>
      <IconButton
        icon="chevron-left"
        onPress={onPrevious}
        disabled={currentIndex === 0}
        size={32}
      />
      <Text variant="bodyLarge">
        {currentIndex + 1} / {totalProblems}
      </Text>
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
    paddingVertical: spacing.xs,
  },
});

export default QuizNavigation;
