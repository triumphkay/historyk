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
import { ActivityIndicator, Surface, useTheme } from "react-native-paper";
import AppText from "../components/common/AppText";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuiz } from "../context/QuizContext";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme/spacing";
import { quizScreenStyles } from "../theme/quizStyles";
import QuizCard from "../components/QuizCard";
import { QuizButton, QuizNavigation } from "../components/QuizLayout";

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
    resetAllCards,
  } = useQuiz();
  const theme = useTheme();

  // Reset all cards when entering the screen
  useEffect(() => {
    resetAllCards();
  }, []);

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
        // Keep isProgrammaticScroll true until scroll completes
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 300); // Adjust timing based on animation duration
      }
    }
  }, [currentIndex, quizProblems.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Skip state update during programmatic scroll
    if (isProgrammaticScroll.current) return;
    
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentIndex && index >= 0 && index < totalProblems) {
      const prevIndex = currentIndex;
      setCurrentIndex(index);
      // Reset previous card to front after drag
      setTimeout(() => {
        updateCardState(prevIndex, { isFlipped: false });
      }, 0);
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
  // const currentProblem = quizProblems[currentIndex];

  const handleFlip = () => {
    updateCardState(currentIndex, { isFlipped: !isFlipped });
  };

  // const isCorrect = useMemo(
  //   () =>
  //     currentProblem
  //       ? answer.replace(/\s/g, "") ===
  //         currentProblem.keyword.replace(/\s/g, "")
  //       : false,
  //   [answer, currentProblem]
  // );

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
        <AppText>출제 가능한 문제가 없습니다.</AppText>
      </Surface>
    );
  }

  return (
    <Surface style={quizScreenStyles.container}>
      <QuizNavigation
        currentIndex={currentIndex}
        totalProblems={totalProblems}
        onPrevious={handlePrev}
        onNext={handleNext}
      />

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
        <QuizButton isFlipped={isFlipped} onPress={handleFlip} />
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  fixedButtonContainer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
});

export default QuizScreen;
