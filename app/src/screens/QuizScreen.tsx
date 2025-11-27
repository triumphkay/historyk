import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Animated,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Surface,
  Text,
  useTheme,
  TextInput,
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import DescriptionList from "../components/DescriptionList";
import ScoreFrequencyLabel from "../components/ScoreFrequencyLabel";
import TypeLabel from "../components/TypeLabel";
import { useQuiz } from "../context/QuizContext";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { mergeReferenceIds } from "../utils/references";
import { quizScreenStyles } from "../theme/quizStyles";

type Props = NativeStackScreenProps<RootStackParamList, "Quiz">;

const selectRandomDescriptions = (descriptions: string[]) => {
  if (descriptions.length <= 3) {
    return descriptions;
  }
  const shuffled = [...descriptions]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
  return shuffled.slice(0, 3);
  return shuffled.slice(0, 3);
};

const POINT_COLOR_1 = '#f75d00';

const QuizScreen: React.FC<Props> = ({ navigation }) => {
  const {
    currentProblem,
    currentIndex,
    totalProblems,
    goToNext,
    goToPrevious,
    answer,
    setAnswer,
    resetKey,
    loading,
  } = useQuiz();
  const theme = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalProblems - 1;
  const isCorrect = useMemo(
    () => (currentProblem ? answer.replace(/\s/g, "") === currentProblem.keyword.replace(/\s/g, "") : false),
    [answer, currentProblem]
  );
  const headerText = useMemo(
    () => `${currentIndex + 1} / ${totalProblems}`,
    [currentIndex, totalProblems]
  );
  const referenceEntries = useMemo(() => {
    if (!currentProblem) {
      return [];
    }
    return mergeReferenceIds(currentProblem.ref_id, currentProblem.q_ref_id);
  }, [currentProblem]);
  const referenceCount = referenceEntries.length;
  const displayDescriptions = useMemo(
    () => selectRandomDescriptions(currentProblem?.descriptions || []),
    [currentProblem?.id, currentProblem?.descriptions]
  );
  const answerLength = useMemo(() => {
    if (!currentProblem) return 0;
    return currentProblem.keyword.replace(/[ ·.]/g, "").length;
  }, [currentProblem]);

  // Reset flip when problem changes
  useEffect(() => {
    setIsFlipped(false);
    flipAnimation.setValue(0);
  }, [currentProblem?.id]);

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  if (loading) {
    return (
      <Surface style={quizScreenStyles.center}>
        <ActivityIndicator animating color={theme.colors.primary} />
      </Surface>
    );
  }

  if (!currentProblem) {
    return (
      <Surface style={quizScreenStyles.center}>
        <Text>출제 가능한 문제가 없습니다.</Text>
      </Surface>
    );
  }

  return (
    <Surface style={quizScreenStyles.container}>
      <Surface style={[styles.navigationBar, { backgroundColor: theme.colors.background }]} elevation={1}>
        <IconButton
          icon="chevron-left"
          onPress={goToPrevious}
          disabled={!canGoPrevious}
          size={32}
        />
        <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
          {headerText}
        </Text>
        <IconButton
          icon="chevron-right"
          onPress={goToNext}
          disabled={!canGoNext}
          size={32}
        />
      </Surface>
      
      <ScrollView
        contentContainerStyle={quizScreenStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ position: 'relative', height: 360 }}>
          {/* Front Side */}
          <Animated.View
            style={[
              styles.flipCard,
              { transform: [{ rotateY: frontInterpolate }] },
              isFlipped && styles.flipCardFrontHidden,
            ]}
            pointerEvents={isFlipped ? 'none' : 'auto'}
          >
            <Surface style={[quizScreenStyles.card, styles.fixedCard, { backgroundColor: '#000000' }]} elevation={3}>
              {/* Header Section */}
              <View style={styles.cardHeader}>
                <ScoreFrequencyLabel
                  scores={currentProblem.score}
                  textStyle={[quizScreenStyles.frequencyText, { color: 'rgba(255, 255, 255, 0.7)' }]}
                />
                <TypeLabel types={currentProblem.types} />
              </View>

              {/* Hint Section (Centered) */}
              <View style={styles.cardHint}>
                <DescriptionList descriptions={displayDescriptions} />
              </View>

              {/* Answer Section (Bottom) */}
              <View style={styles.cardAnswer}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, marginBottom: 4, marginLeft: 4 }}>
                  정답 ({answerLength}자)
                </Text>
                <TextInput
                  mode="flat"
                  value={answer}
                  onChangeText={setAnswer}
                  placeholder="답을 입력하세요"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  textColor={POINT_COLOR_1}
                  underlineColor="rgba(255, 255, 255, 0.5)"
                  activeUnderlineColor={theme.colors.primary}
                  style={{ backgroundColor: 'transparent', textAlign: 'center', fontSize: typography.sizes.lg, height: 42 }}
                />
              </View>
            </Surface>
          </Animated.View>

          {/* Back Side */}
          <Animated.View
            style={[
              styles.flipCard,
              styles.flipCardBack,
              { transform: [{ rotateY: backInterpolate }] },
            ]}
            pointerEvents={isFlipped ? 'auto' : 'none'}
          >
            <Surface
              style={[quizScreenStyles.card, styles.answerCard, styles.fixedCard]}
              elevation={3}
            >
              {/* Top Section: Result & Keyword */}
              <View>
                <Text
                  style={[
                    styles.resultText,
                    {
                      color: theme.colors.secondary,
                      opacity: answer && answer.trim().length > 0 ? 1 : 0,
                    },
                  ]}
                >
                  {isCorrect ? "정답입니다" : "오답입니다"}
                </Text>

                <View style={styles.keywordRow}>
                  <Text style={[styles.answerKeyword, { color: POINT_COLOR_1 }]}>
                    {currentProblem.keyword}
                  </Text>
                  <IconButton
                    icon="information-outline"
                    size={20}
                    onPress={() => {
                      navigation.navigate("KeywordDetail", {
                        keyword: currentProblem,
                      });
                    }}
                    style={{ margin: 0 }}
                  />
                </View>
              </View>

              {/* Center Section: Descriptions */}
              <View style={styles.centerSection}>
                <View style={{ maxHeight: 150, overflow: 'hidden' }}>
                  <DescriptionList 
                    descriptions={[
                      ...currentProblem.descriptions.slice(0, 7),
                      ...(currentProblem.descriptions.length > 7 ? ['...'] : [])
                    ]} 
                  />
                </View>
              </View>

              {/* Bottom Section: Info */}
              <View style={styles.infoRowBottom}>
                <ScoreFrequencyLabel
                  scores={currentProblem.score}
                  textStyle={styles.importanceText}
                />
                <Text style={styles.referenceCountText}>
                  출제 횟수: {referenceCount}회
                </Text>
              </View>
            </Surface>
          </Animated.View>
        </View>
      </ScrollView>

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
            justifyContent: 'center',
            alignItems: 'center',
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
  fixedCard: {
    height: 360,
    justifyContent: 'space-between',
  },
  cardHeader: {
    paddingTop: spacing.sm,
  },
  cardHint: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAnswer: {
    paddingBottom: spacing.md,
  },
  fixedButtonContainer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  countContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
  },
  countText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  flipCard: {
    width: "100%",
    backfaceVisibility: "hidden",
  },
  flipCardFrontHidden: {
    // This style is applied to the front card when it's flipped to ensure it's visually hidden
    // without affecting its position during the animation.
    // The backfaceVisibility handles the actual "flipping" visual.
    // We might not strictly need this if backfaceVisibility is enough,
    // but it can help with z-index issues or ensuring content isn't clickable.
  },
  flipCardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  answerCard: {
    padding: spacing.lg,
    alignItems: "stretch",
    justifyContent: "flex-start",
    minHeight: 300,
  },
  answerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.md,
  },
  answerKeyword: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  keywordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: spacing.md,
  },
  detailButton: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  detailButtonText: {
    fontSize: typography.sizes.sm,
    textDecorationLine: 'underline',
  },
  descriptionsContainer: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  infoRowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  importanceText: {
    fontSize: typography.sizes.sm,
  },
  referenceCountText: {
    fontSize: typography.sizes.sm,
  },

  resultText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
    textAlign: 'left',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
  },
  userAnswerText: {
    fontSize: typography.sizes.md,
    opacity: 0.7,
  },
  bottomButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  navButton: {
    flex: 1,
  },
  submitButton: {
    width: 200,
    height: 48,
    alignSelf: 'center',
    borderRadius: 999,
  },
});

export default QuizScreen;
