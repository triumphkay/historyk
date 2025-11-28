import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuiz } from "../context/QuizContext";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { quizScreenStyles } from "../theme/quizStyles";
import QuizCard from "../components/QuizCard";

type Props = NativeStackScreenProps<RootStackParamList, "Quiz">;

const { width } = Dimensions.get("window");

const QuizScreen: React.FC<Props> = ({ navigation }) => {
  const {
    quizProblems,
    currentIndex,
    totalProblems,
    goToNext,
    goToPrevious,
    setCurrentIndex,
    loading,
    cardStates,
    updateCardState,
  } = useQuiz();
  const theme = useTheme();

  const flatListRef = useRef<FlatList>(null);
  const isProgrammaticScroll = useRef(false);

  // Sync scroll with currentIndex
  useEffect(() => {
    if (flatListRef.current && quizProblems.length > 0) {
      if (isProgrammaticScroll.current) {
        flatListRef.current.scrollToIndex({
          index: currentIndex,
          animated: true,
        });
        isProgrammaticScroll.current = false;
      }
    }
  }, [currentIndex, quizProblems.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentIndex && index >= 0 && index < totalProblems) {
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    isProgrammaticScroll.current = true;
    goToNext();
  };

  const handlePrev = () => {
    isProgrammaticScroll.current = true;
    goToPrevious();
  };

  // Get current card state
  const currentCardState = cardStates[currentIndex] || {
    answer: "",
    isFlipped: false,
  };
  const { isFlipped, answer } = currentCardState;
  const currentProblem = quizProblems[currentIndex];

  const handleFlip = () => {
    updateCardState(currentIndex, { isFlipped: !isFlipped });
  };

  const isCorrect = useMemo(
    () =>
      currentProblem
        ? answer.replace(/\s/g, "") ===
          currentProblem.keyword.replace(/\s/g, "")
        : false,
    [answer, currentProblem]
  );

  if (loading) {
    return (
      <Surface style={quizScreenStyles.center}>
        <ActivityIndicator animating color={theme.colors.primary} />
      </Surface>
    );
  }

  if (!quizProblems || quizProblems.length === 0) {
    return (
      <Surface style={quizScreenStyles.center}>
        <Text>출제 가능한 문제가 없습니다.</Text>
      </Surface>
    );
  }

  return (
    <Surface style={quizScreenStyles.container}>
      <Surface style={[styles.navigationBar]} elevation={1}>
        <IconButton
          icon="chevron-left"
          onPress={handlePrev}
          disabled={currentIndex === 0}
          size={32}
        />
        <Text variant="bodyLarge">
          {currentIndex + 1} / {totalProblems}
        </Text>
        <IconButton
          icon="chevron-right"
          onPress={handleNext}
          disabled={currentIndex === totalProblems - 1}
          size={32}
        />
      </Surface>

      <View style={[quizScreenStyles.scrollContent, { padding: 0, flex: 1 }]}>
        <FlatList
          ref={flatListRef}
          data={quizProblems}
          renderItem={({ item, index }) => (
            <QuizCard problem={item} index={index} />
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews={true}
        />
      </View>

      <View style={styles.fixedButtonContainer}>
        <Button
          mode="contained"
          style={[
            styles.submitButton,
            isFlipped && {
              borderWidth: 1,
              borderColor: theme.dark
                ? theme.colors.onSurface
                : theme.colors.onPrimary,
            },
          ]}
          icon={isFlipped ? "undo" : "check"}
          buttonColor={
            isFlipped
              ? theme.dark
                ? theme.colors.surface
                : theme.colors.primary
              : isCorrect
              ? theme.colors.secondary
              : theme.colors.primary
          }
          textColor={
            isFlipped
              ? theme.dark
                ? theme.colors.onSurface
                : theme.colors.onPrimary
              : undefined
          }
          onPress={handleFlip}
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
      </View>
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
  fixedButtonContainer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
  submitButton: {
    width: 200,
    height: 48,
    alignSelf: "center",
    borderRadius: 999,
  },
});

export default QuizScreen;
