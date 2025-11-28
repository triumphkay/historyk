import React, { useMemo, useRef, useEffect } from "react";
import { StyleSheet, View, Animated, Dimensions } from "react-native";
import {
  IconButton,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DescriptionList from "./DescriptionList";
import ScoreFrequencyLabel from "./ScoreFrequencyLabel";
import TypeLabel from "./TypeLabel";
import { QuizItem } from "../types/QuizItem";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { mergeReferenceIds } from "../utils/references";
import { quizScreenStyles } from "../theme/quizStyles";
import { useQuiz } from "../context/QuizContext";
import { POINT_COLOR_1 } from "../theme";

interface Props {
  problem: QuizItem;
  index: number;
}

const { width } = Dimensions.get("window");

const selectRandomDescriptions = (descriptions: string[]) => {
  if (descriptions.length <= 3) {
    return descriptions;
  }
  const shuffled = [...descriptions]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
  return shuffled.slice(0, 3);
};

const QuizCard: React.FC<Props> = ({ problem, index }) => {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { cardStates, updateCardState } = useQuiz();
  const cardState = cardStates[index] || { answer: "", isFlipped: false };
  const { answer, isFlipped } = cardState;

  const flipAnimation = useRef(new Animated.Value(0)).current;

  const isCorrect = useMemo(
    () =>
      problem
        ? answer.replace(/\s/g, "") === problem.keyword.replace(/\s/g, "")
        : false,
    [answer, problem]
  );

  const referenceEntries = useMemo(() => {
    if (!problem) {
      return [];
    }
    return mergeReferenceIds(problem.ref_id, problem.q_ref_id);
  }, [problem]);

  const referenceCount = referenceEntries.length;

  const displayDescriptions = useMemo(
    () => selectRandomDescriptions(problem?.descriptions || []),
    [problem?.id, problem?.descriptions]
  );

  const answerLength = useMemo(() => {
    if (!problem) return 0;
    return problem.keyword.replace(/[ ·.]/g, "").length;
  }, [problem]);

  useEffect(() => {
    const toValue = isFlipped ? 1 : 0;
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [isFlipped]);

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const setAnswer = (text: string) => {
    updateCardState(index, { answer: text });
  };

  return (
    <View style={{ width: width, paddingHorizontal: spacing.md }}>
      <View style={{ position: "relative", height: 360 }}>
        {/* Front Side */}
        <Animated.View
          style={[
            styles.flipCard,
            { transform: [{ rotateY: frontInterpolate }] },
            isFlipped && styles.flipCardFrontHidden,
          ]}
          pointerEvents={isFlipped ? "none" : "auto"}
        >
          <Surface
            style={[
              quizScreenStyles.card,
              styles.fixedCard,
              { backgroundColor: theme.colors.primary },
            ]}
            elevation={3}
          >
            {/* Header Section */}
            <View style={styles.cardHeader}>
              <ScoreFrequencyLabel
                scores={problem.score}
                textStyle={[
                  quizScreenStyles.frequencyText,
                  { color: theme.colors.onPrimary, opacity: 0.7 },
                ]}
              />
              <TypeLabel types={problem.types} />
            </View>

            {/* Hint Section (Centered) */}
            <View style={styles.cardHint}>
              <DescriptionList descriptions={displayDescriptions} />
            </View>

            {/* Answer Section (Bottom) */}
            <View style={styles.cardAnswer}>
              <Text
                style={{
                  color: theme.colors.onPrimary,
                  opacity: 0.7,
                  fontSize: 12,
                  marginBottom: 4,
                  marginLeft: 4,
                }}
              >
                정답 ({answerLength}자)
              </Text>
              <TextInput
                mode="flat"
                value={answer}
                onChangeText={setAnswer}
                placeholder="답을 입력하세요"
                placeholderTextColor={theme.colors.onPrimary}
                textColor={POINT_COLOR_1}
                underlineColor={theme.colors.onPrimary}
                activeUnderlineColor={theme.colors.primary}
                style={{
                  backgroundColor: "transparent",
                  textAlign: "center",
                  fontSize: typography.sizes.lg,
                  height: 42,
                }}
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
          pointerEvents={isFlipped ? "auto" : "none"}
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
                  {problem.keyword}
                </Text>
                <IconButton
                  icon="information-outline"
                  size={20}
                  onPress={() => {
                    navigation.navigate("KeywordDetail", {
                      keyword: problem,
                    });
                  }}
                  style={{ margin: 0 }}
                />
              </View>
            </View>

            {/* Center Section: Descriptions */}
            <View style={styles.centerSection}>
              <View style={{ maxHeight: 150, overflow: "hidden" }}>
                <DescriptionList
                  descriptions={[
                    ...problem.descriptions.slice(0, 7),
                    ...(problem.descriptions.length > 7 ? ["..."] : []),
                  ]}
                />
              </View>
            </View>

            {/* Bottom Section: Info */}
            <View style={styles.infoRowBottom}>
              <ScoreFrequencyLabel
                scores={problem.score}
                textStyle={styles.importanceText}
              />
              <Text style={styles.referenceCountText}>
                출제 횟수: {referenceCount}회
              </Text>
            </View>
          </Surface>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fixedCard: {
    height: 360,
    justifyContent: "space-between",
  },
  cardHeader: {
    paddingTop: spacing.sm,
  },
  cardHint: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardAnswer: {
    paddingBottom: spacing.md,
  },
  flipCard: {
    width: "100%",
    backfaceVisibility: "hidden",
  },
  flipCardFrontHidden: {},
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
  answerKeyword: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  keywordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: spacing.md,
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
    textAlign: "left",
  },
  centerSection: {
    flex: 1,
    justifyContent: "center",
  },
});

export default QuizCard;
