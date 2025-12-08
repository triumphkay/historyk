import React, { useEffect, useMemo, useState, useRef } from "react";
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
import { useNewWordEraQuiz } from "../context/NewWordEraQuizContext";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme/spacing";
import { quizScreenStyles, eraQuizStyles } from "../theme/quizStyles";
import KeywordEraQuizCard from "../components/KeywordEraQuizCard";
import { parseYearParts } from "../utils/eraQuiz";
import keyAgeData from "../../assets/key-timeline.json";
import { TypeDetail } from "../types/TypeDetail";
import { QuizButton, QuizNavigation } from "../components/QuizLayout";
import texts from "../../assets/texts.json";

type Props = NativeStackScreenProps<RootStackParamList, "KeywordEraQuizScreen">;

const { width } = Dimensions.get("window");

const KeywordEraQuizScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const {
    problems,
    currentProblem,
    selectedEraIndex,
    currentIndex,
    totalProblems,
    goToNext,
    goToPrevious,
    setCurrentIndex,
    loading,
    resetKey,
    cardStates,
    updateCardState,
    resetAllCards,
  } = useNewWordEraQuiz();

  // Reset all cards when entering the screen
  useEffect(() => {
    resetAllCards();
  }, []);

  const flatListRef = useRef<FlatList>(null);
  const isProgrammaticScroll = useRef(false);

  // Sync scroll with currentIndex
  useEffect(() => {
    if (flatListRef.current && problems.length > 0) {
      if (isProgrammaticScroll.current) {
        flatListRef.current.scrollToIndex({
          index: currentIndex,
          animated: true,
        });
        isProgrammaticScroll.current = false;
      }
    }
  }, [currentIndex, problems.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
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
    country: "",
    leader: "",
    year: "",
    month: "",
    isFlipped: false,
  };
  const { country, leader, year, month, isFlipped } = currentCardState;

  // const metadata = keywordTypes as {
  //   "key-age": Array<{ nation: string; list: string[] }>;
  //   "types-details": TypeDetail[];
  // };
  // const keyAgeData = metadata["key-age"] || [];

  // Get selected era and det_era based on selectedEraIndex
  const selectedEra = useMemo(() => {
    if (!currentProblem || !currentProblem.era[selectedEraIndex]) return "";
    return currentProblem.era[selectedEraIndex];
  }, [currentProblem, selectedEraIndex]);

  const selectedDetEra = useMemo(() => {
    if (!currentProblem || !currentProblem.det_era[selectedEraIndex]) return "";
    return currentProblem.det_era[selectedEraIndex];
  }, [currentProblem, selectedEraIndex]);

  const yearParts = useMemo(
    () => parseYearParts(currentProblem?.years || ""),
    [currentProblem]
  );

  const isCorrect = useMemo(() => {
    if (!currentProblem) return false;

    // Check Era (Country)
    if (country !== selectedEra) return false;

    // Check Detail Era (Leader)
    const hasLeaderAnswer = Boolean(selectedDetEra.trim());
    if (hasLeaderAnswer && leader !== selectedDetEra) return false;

    // Check Year
    const shouldShowYearInputs = currentProblem.years_check === "true";
    if (shouldShowYearInputs) {
      if (year !== yearParts.year) return false;
      if (yearParts.month && month !== yearParts.month) return false;
    }

    return true;
  }, [
    currentProblem,
    country,
    leader,
    year,
    month,
    selectedEra,
    selectedDetEra,
    yearParts,
  ]);

  const handleFlip = () => {
    updateCardState(currentIndex, { isFlipped: !isFlipped });
  };

  if (loading) {
    return (
      <Surface style={styles.center}>
        <ActivityIndicator animating />
      </Surface>
    );
  }

  if (!problems || problems.length === 0) {
    return (
      <Surface style={styles.center}>
        <AppText>{texts.componentContents.noQuestion}</AppText>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <QuizNavigation
        currentIndex={currentIndex}
        totalProblems={totalProblems}
        onPrevious={handlePrev}
        onNext={handleNext}
      />

      <View style={[styles.scrollContent, { padding: 0, flex: 1 }]}>
        <FlatList
          ref={flatListRef}
          data={problems}
          renderItem={({ item, index }) => (
            <KeywordEraQuizCard problem={item} index={index} />
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
  ...quizScreenStyles,
  ...eraQuizStyles,
  fixedButtonContainer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
});

export default KeywordEraQuizScreen;
