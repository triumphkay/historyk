import React, { useRef, useEffect } from "react";
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
  TouchableWithoutFeedback,
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
import texts from "../../assets/texts.json";

type Props = NativeStackScreenProps<RootStackParamList, "Quiz">;

const { width, height } = Dimensions.get("window");

// Adjust threshold as needed. iPhone 14 is ~844. SE is ~667.
const SHOULD_AVOID_KEYBOARD = height < 900;

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
  // Get current card state
  const currentCardState = cardStates[currentIndex] || {
    answer: "",
    isFlipped: false,
  };
  const { isFlipped } = currentCardState;

  const handleFlip = () => {
    updateCardState(currentIndex, { isFlipped: !isFlipped });
  };

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

      <View style={[quizScreenStyles.scrollContent, { padding: 0 }]}>
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
          initialScrollIndex={currentIndex}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews={true}
        />
      </View>

      <View style={styles.fixedButtonContainer}>
        <QuizButton isFlipped={isFlipped} onPress={handleFlip} />
      </View>
    </>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Surface style={quizScreenStyles.container}>
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
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  fixedButtonContainer: {
    padding: spacing.md,
    marginTop: spacing.lg,
    alignItems: "center",
  },
});

export default QuizScreen;
