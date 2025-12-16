import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";

import { ActivityIndicator, Surface, useTheme } from "react-native-paper";
import AppText from "../components/common/AppText";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNewWordEraQuiz } from "../context/NewWordEraQuizContext";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme/spacing";
import { quizScreenStyles, eraQuizStyles } from "../theme/quizStyles";
import KeywordEraQuizCard from "../components/KeywordEraQuizCard";
import { QuizButton, QuizNavigation } from "../components/QuizLayout";
import texts from "../../assets/texts.json";

type Props = NativeStackScreenProps<RootStackParamList, "KeywordEraQuizScreen">;

const { width, height } = Dimensions.get("window");
const SHOULD_AVOID_KEYBOARD = height < 900;

const KeywordEraQuizScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const {
    problems,
    currentIndex,
    totalProblems,
    goToNext,
    goToPrevious,
    setCurrentIndex,
    loading,
    cardStates,
    updateCardState,
    resetAllCards,
  } = useNewWordEraQuiz();

  // Reset all cards when entering the screen
  useEffect(() => {
    resetAllCards();
  }, []);

  // Dismiss keyboard when changing cards
  useEffect(() => {
    Keyboard.dismiss();
  }, [currentIndex]);

  const keyboardShift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const showEvent = "keyboardDidShow";
    const hideEvent = "keyboardDidHide";

    const onShow = () => {
      // Only shift if screen is small
      const shiftValue = SHOULD_AVOID_KEYBOARD ? -150 : 0;
      Animated.timing(keyboardShift, {
        toValue: shiftValue,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

    const onHide = () => {
      Animated.timing(keyboardShift, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

    const showListener = Keyboard.addListener(showEvent, onShow);
    const hideListener = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showListener.remove();
      hideListener.remove();
    };
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

  // Use onViewableItemsChanged for reliable page tracking
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (isProgrammaticScroll.current) return;

      if (viewableItems && viewableItems.length > 0) {
        const firstVisible = viewableItems[0];
        if (
          firstVisible.index !== null &&
          firstVisible.index !== undefined &&
          firstVisible.index !== currentIndex
        ) {
          const newIndex = firstVisible.index;
          const prevIndex = currentIndex;
          setCurrentIndex(newIndex);
          // Reset previous card to front
          setTimeout(() => {
            updateCardState(prevIndex, { isFlipped: false });
          }, 0);
        }
      }
    }
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    waitForInteraction: true,
  });

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
    isFlipped: false,
  };
  const { isFlipped } = currentCardState;

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

  const content = (
    <>
      <QuizNavigation
        currentIndex={currentIndex}
        totalProblems={totalProblems}
        onPrevious={handlePrev}
        onNext={handleNext}
      />

      <View style={[styles.scrollContent, { padding: 0 }]}>
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
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewabilityConfig.current}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews={true}
          keyboardDismissMode="on-drag"
        />
      </View>

      <View style={styles.fixedButtonContainer}>
        <QuizButton isFlipped={isFlipped} onPress={handleFlip} />
      </View>
    </>
  );

  return (
    <Surface style={styles.container}>
      {Platform.OS === "android" ? (
        <Animated.View
          style={{ flex: 1, transform: [{ translateY: keyboardShift }] }}
        >
          {content}
        </Animated.View>
      ) : (
        <KeyboardAvoidingView
          behavior="position"
          enabled={SHOULD_AVOID_KEYBOARD}
          style={{ flex: 1 }}
          contentContainerStyle={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? -50 : 0}
        >
          {content}
        </KeyboardAvoidingView>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  ...quizScreenStyles,
  ...eraQuizStyles,
  fixedButtonContainer: {
    padding: spacing.md,
    marginTop: spacing.lg,
    alignItems: "center",
  },
});

export default KeywordEraQuizScreen;
