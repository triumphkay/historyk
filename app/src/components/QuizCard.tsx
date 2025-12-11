import React, { useMemo } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { IconButton, TextInput } from "react-native-paper";
import AppText from "./common/AppText";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DescriptionList from "./DescriptionList";
import PriorityMark from "./common/PriorityMark";
import TypeLabel from "./TypeLabel";
import { QuizItem } from "../types/QuizItem";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { mergeReferenceIds } from "../utils/references";
import { quizScreenStyles } from "../theme/quizStyles";
import { useQuiz } from "../context/QuizContext";
import { POINT_COLOR_1 } from "../theme";
import { useAppTheme } from "../hooks/useAppTheme";
import FlipCard from "./common/FlipCard";
import QuizCardLayout from "./common/QuizCardLayout";
import texts from "../../assets/texts.json";

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
  const theme = useAppTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { cardStates, updateCardState } = useQuiz();
  const cardState = cardStates[index] || { answer: "", isFlipped: false };
  const { answer, isFlipped } = cardState;

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

  const setAnswer = (text: string) => {
    updateCardState(index, { answer: text });
  };

  // --- Front Content ---
  const FrontHeader = (
    <View style={styles.cardHeader}>
      <PriorityMark scores={problem.score} style={styles.cardScore} />
      <TypeLabel types={problem.types} />
    </View>
  );

  const FrontBody = <DescriptionList descriptions={displayDescriptions} />;

  const FrontFooter = (
    <View>
      <AppText
        style={{
          fontSize: 12,
          marginBottom: 4,
          marginLeft: 4,
        }}
      >
        {texts.componentContents.answer} ({answerLength}
        {texts.componentContents.textLength})
      </AppText>
      <TextInput
        mode="flat"
        value={answer}
        onChangeText={setAnswer}
        placeholder={texts.keywordQuiz.writeHere}
        placeholderTextColor={theme.colors.level4}
        textColor={POINT_COLOR_1}
        // underlineColor={theme.colors.onPrimary}
        // activeUnderlineColor={theme.colors.primary}
        style={{
          // backgroundColor: "transparent",
          textAlign: "center",
          fontSize: typography.sizes.lg,
          height: 42,
        }}
      />
    </View>
  );

  const backTextColor = theme.colors.level3;

  // --- Back Content ---
  const BackHeader = (
    <View>
      <AppText
        style={[
          styles.resultText,
          {
            color: backTextColor,
            opacity: answer && answer.trim().length > 0 ? 1 : 0,
          },
        ]}
      >
        {isCorrect
          ? texts.componentContents.correct
          : texts.componentContents.notCorrect}
      </AppText>

      <View style={styles.keywordRow}>
        <AppText style={[styles.answerKeyword, { color: backTextColor }]}>
          {problem.keyword}
        </AppText>
        <IconButton
          icon="information-outline"
          size={20}
          iconColor={backTextColor}
          onPress={() => {
            navigation.navigate("KeywordDetail", {
              keyword: problem,
            });
          }}
          style={{ margin: 0 }}
        />
      </View>
    </View>
  );

  const BackBody = (
    <View style={{ width: "100%", maxHeight: 150, overflow: "hidden" }}>
      <DescriptionList
        variant="back"
        descriptions={[
          ...problem.descriptions.slice(0, 7),
          ...(problem.descriptions.length > 7 ? ["..."] : []),
        ]}
      />
    </View>
  );

  const BackFooter = (
    <View style={styles.infoRowBottom}>
      <PriorityMark
        scores={problem.score}
        textStyle={[styles.importanceText, { color: backTextColor }]}
      />
      <AppText style={[styles.referenceCountText, { color: backTextColor }]}>
        {texts.componentContents.count}: {referenceCount}
        {texts.componentContents.countTimes}
      </AppText>
    </View>
  );

  return (
    <View style={{ width: width, paddingHorizontal: spacing.md }}>
      <FlipCard
        isFlipped={isFlipped}
        frontContent={
          <QuizCardLayout
            header={FrontHeader}
            body={FrontBody}
            footer={FrontFooter}
            variant="front"
          />
        }
        backContent={
          <QuizCardLayout
            header={BackHeader}
            body={BackBody}
            footer={BackFooter}
            variant="back"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    // paddingTop: spacing.sm,
  },
  cardScore: {
    marginBottom: spacing.sm,
  },
  answerKeyword: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  keywordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    // marginBottom: spacing.md,
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
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs,
  },
});

export default QuizCard;
