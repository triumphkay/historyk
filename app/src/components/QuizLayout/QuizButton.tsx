import React from "react";
import { StyleSheet } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { typography } from "../../theme/typography";

interface QuizButtonProps {
  isFlipped: boolean;
  onPress: () => void;
}

const QuizButton: React.FC<QuizButtonProps> = ({ isFlipped, onPress }) => {
  const theme = useTheme();

  return (
    <Button
      mode="contained"
      style={[
        styles.button,
        {
          borderWidth: 1,
          borderColor: isFlipped
            ? (theme.colors as any).level8
            : theme.colors.primary,
        },
      ]}
      icon={isFlipped ? "undo" : "check"}
      buttonColor={
        isFlipped ? (theme.colors as any).level3 : theme.colors.primary
      }
      textColor={
        isFlipped ? (theme.colors as any).level8 : theme.colors.onPrimary
      }
      onPress={onPress}
      labelStyle={{
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.medium,
      }}
      contentStyle={{
        height: 48,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isFlipped ? "문제 보기" : "정답 확인"}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 50,
    alignSelf: "center",
    borderRadius: 999,
  },
});

export default QuizButton;
