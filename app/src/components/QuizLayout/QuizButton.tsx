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
            ? (theme.colors as any).level6
            : theme.colors.primary,
        },
      ]}
      icon={isFlipped ? "undo" : "check"}
      buttonColor={
        isFlipped ? (theme.colors as any).level1 : theme.colors.primary
      }
      textColor={
        isFlipped ? (theme.colors as any).level8 : theme.colors.onPrimary
      }
      onPress={onPress}
      labelStyle={{
        fontSize: typography.sizes.md,
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
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 3,
  },
});

export default QuizButton;
