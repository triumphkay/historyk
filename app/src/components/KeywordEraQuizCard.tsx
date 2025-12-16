import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { IconButton, TextInput, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import TypeLabel from "./TypeLabel";
import PriorityMark from "./common/PriorityMark";
import DropdownSelect from "./DropdownSelect";
import DescriptionList from "./DescriptionList";
import {
  ExtendedNewWordEraItem,
  useNewWordEraQuiz,
} from "../context/NewWordEraQuizContext";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { mergeReferenceIds } from "../utils/references";
import { parseYearParts } from "../utils/eraQuiz";
import keyTimelineStruct from "../../assets/key-timeline.json";
import keyAgeStruct from "../../assets/key-age.json";
import { TypeDetail } from "../types/TypeDetail";
import { quizScreenStyles, eraQuizStyles } from "../theme/quizStyles";
import { POINT_COLOR_1 } from "../theme";
import FlipCard from "./common/FlipCard";
import QuizCardLayout from "./common/QuizCardLayout";
import AppText from "./common/AppText";
import texts from "../../assets/texts.json";

interface Props {
  problem: ExtendedNewWordEraItem;
  index: number;
}

const { width } = Dimensions.get("window");

const KeywordEraQuizCard: React.FC<Props> = ({ problem, index }) => {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { cardStates, updateCardState } = useNewWordEraQuiz();
  const cardState = cardStates[index] || {
    country: "",
    leader: "",
    year: "",
    month: "",
    isFlipped: false,
  };
  const { country, leader, year, month, isFlipped } = cardState;

  const selectedEraIndex = problem.selectedEraIndex;
  const quizMode = problem.quizMode;

  const selectedEra = useMemo(() => {
    if (!problem || !problem.era[selectedEraIndex]) return "";
    return problem.era[selectedEraIndex];
  }, [problem, selectedEraIndex]);

  const selectedDetEra = useMemo(() => {
    if (!problem || !problem.det_era[selectedEraIndex]) return "";
    return problem.det_era[selectedEraIndex];
  }, [problem, selectedEraIndex]);

  const selectedSubEra = useMemo(() => {
    if (!problem || !problem.sub_era || !problem.sub_era[selectedEraIndex])
      return "";
    return problem.sub_era[selectedEraIndex];
  }, [problem, selectedEraIndex]);

  // Determine what to show based on quiz mode
  const showEraDropdown = quizMode === "era-only";
  const showSubEraDropdown =
    quizMode === "sub-era" ||
    (quizMode === "random-sub-or-det" && problem.selectedField === "sub_era");
  const showDetEraDropdown =
    quizMode === "det-era" ||
    (quizMode === "random-sub-or-det" && problem.selectedField === "det_era");

  const countryOptions = useMemo(
    () => Array.from(new Set(keyTimelineStruct.map((item) => item.nation))),
    []
  );

  const leaderOptions = useMemo(() => {
    const targetEra = showEraDropdown ? country : selectedEra;

    if (showSubEraDropdown) {
      // Use key-age.json for eras/periods
      const entry = (keyAgeStruct as any[]).find(
        (item) => item.nation === targetEra
      );
      return entry ? entry.periods : [];
    } else {
      // Use key-timeline.json for rulers/leaders (det-era)
      const entry = keyTimelineStruct.find((item) => item.nation === targetEra);
      return entry ? entry.list : [];
    }
  }, [showEraDropdown, country, selectedEra, showSubEraDropdown]);

  // Auto-initialize country when era is fixed
  useEffect(() => {
    if (!showEraDropdown && !country) {
      updateCardState(index, { country: selectedEra });
    }
  }, [showEraDropdown, selectedEra, country, index, updateCardState]);

  const yearParts = useMemo(
    () => parseYearParts(problem?.years || ""),
    [problem]
  );
  const referenceEntries = useMemo(
    () => mergeReferenceIds(problem?.ref_id || [], problem?.q_ref_id || []),
    [problem]
  );

  const isCorrect = useMemo(() => {
    if (!problem) return false;

    if (showEraDropdown) {
      return country === selectedEra;
    }

    // For sub-era and det-era modes, we use the 'leader' state for the second dropdown
    if (showSubEraDropdown) {
      return leader === selectedSubEra;
    }

    if (showDetEraDropdown) {
      return leader === selectedDetEra;
    }

    return false;
  }, [
    problem,
    country,
    leader,
    selectedEra,
    selectedSubEra,
    selectedDetEra,
    showEraDropdown,
    showSubEraDropdown,
    showDetEraDropdown,
  ]);

  const handleNumericChange = (value: string, length: number) =>
    value.replace(/[^0-9]/g, "").slice(0, length);

  const setCountry = (val: string) => updateCardState(index, { country: val });
  const setLeader = (val: string) => updateCardState(index, { leader: val });
  const setYear = (val: string) => updateCardState(index, { year: val });
  const setMonth = (val: string) => updateCardState(index, { month: val });

  // Has the user provided an answer for the active field?
  const hasAnswered = showEraDropdown ? Boolean(country) : Boolean(leader);

  // --- Front Content ---
  const FrontHeader = (
    <View style={styles.cardHeader}>
      <PriorityMark scores={problem.scores} style={styles.cardScore} />
      <TypeLabel
        types={problem.types}
        preferEraType={true}
        useAgeQuestion={true}
      />
    </View>
  );

  const FrontBody = (
    <AppText style={[styles.keyword]}>
      {problem.keyword}
      {problem.era_script &&
      problem.era_script.length > 0 &&
      problem.era_script[0]
        ? ` ${problem.era_script[0]}`
        : ""}
    </AppText>
  );

  const FrontFooter = (
    <View>
      <View style={styles.dropdownRow}>
        {showEraDropdown ? (
          // Mode 1: era-only - show single eras dropdown
          <DropdownSelect
            label={texts.timelinedQuiz.era}
            value={country}
            options={countryOptions}
            onSelect={setCountry}
            disabled={false}
          />
        ) : showSubEraDropdown ? (
          // Mode 2 or 4 (sub_era): show fixed era + active sub_era
          <>
            <DropdownSelect
              label={texts.timelinedQuiz.era}
              value={selectedEra} // Uses the correct answer as fixed value
              options={countryOptions}
              onSelect={() => {}} // No-op
              disabled={true}
            />
            <DropdownSelect
              label={texts.timelinedQuiz.subEra}
              value={leader}
              options={leaderOptions}
              onSelect={setLeader}
              disabled={false}
            />
          </>
        ) : showDetEraDropdown ? (
          // Mode 3 or 4 (det_era): show fixed era + active det_era
          <>
            <DropdownSelect
              label={texts.timelinedQuiz.era}
              value={selectedEra} // Uses the correct answer as fixed value
              options={countryOptions}
              onSelect={() => {}} // No-op
              disabled={true}
            />
            <DropdownSelect
              label={
                selectedEra === "대한민국"
                  ? texts.componentContents.typeGoverment
                  : texts.componentContents.typeKing
              }
              value={leader}
              options={leaderOptions}
              onSelect={setLeader}
              disabled={false}
            />
          </>
        ) : null}
      </View>
    </View>
  );

  const backTextColor = (theme.colors as any).level3 || theme.colors.onSurface;

  // --- Back Content ---
  const BackHeader = (
    <View>
      <AppText
        style={[
          styles.resultText,
          {
            color: backTextColor,
            // Show result text/opacity only if the user has answered the relevant field
            opacity: hasAnswered ? 1 : 0,
          },
        ]}
      >
        {isCorrect
          ? texts.componentContents.correct
          : texts.componentContents.notCorrect}
      </AppText>

      <View style={styles.keywordRow}>
        <AppText style={[styles.answerKeyword, { color: theme.colors.secondary }]}>
          {problem.keyword}
          {problem.era_script &&
      problem.era_script.length > 0 &&
      problem.era_script[0]
        ? ` ${problem.era_script[0]}`
        : ""}
        </AppText>
        <IconButton
          icon="information-outline"
          size={20}
          iconColor={backTextColor}
          onPress={() => {
            navigation.navigate("KeywordDetail", {
              keyword: {
                ...problem,
                score: problem.scores,
              } as any,
            });
          }}
          style={{ margin: 0 }}
        />
      </View>
    </View>
  );

  const BackBody = useMemo(() => {
    // Build all era combinations
    const eraCount = problem.era?.length || 0;
    const eraCombinations: string[] = [];

    for (let i = 0; i < eraCount; i++) {
      const era = problem.era[i] || "";
      const subEra = problem.sub_era?.[i] || "";
      const detEra = problem.det_era?.[i] || "";

      const parts = [era, subEra, detEra].filter(Boolean);
      if (parts.length > 0) {
        const text = parts.join(" ");
        // First item: no parentheses, subsequent items: add parentheses
        eraCombinations.push(i === 0 ? text : `(${text})`);
      }
    }

    return (
      <View style={{ width: "100%" }}>
        <View style={styles.eraInfoContainer}>
          <AppText style={[styles.eraText, { color: backTextColor }]}>
            {eraCombinations.join("\n")}
          </AppText>
          {problem.years && (
            <AppText
              style={{
                color: backTextColor,
                fontSize: 24,
                fontWeight: 200,
                marginTop: 8,
              }}
            >
              {problem.years}
            </AppText>
          )}
        </View>
        {/* <DescriptionList descriptions={problem.descriptions} /> */}
      </View>
    );
  }, [problem, backTextColor]);

  const BackFooter = (
    <View style={styles.infoRowBottom}>
      <PriorityMark
        scores={problem.scores}
        textStyle={[styles.importanceText, { color: backTextColor }]}
      />
      <AppText style={[styles.referenceCountText, { color: backTextColor }]}>
        {texts.componentContents.count}: {referenceEntries.length}
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
  ...quizScreenStyles,
  ...eraQuizStyles,
  cardHeader: {
    // paddingTop: spacing.sm,
  },
  cardScore: {
    marginBottom: spacing.sm,
  },
  answerKeyword: {
    fontFamily: "NanumMyeongjo-800",
    fontSize: 30,
  },
  keywordRow: {
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: spacing.md,
  },
  infoRowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
  },
  importanceText: {
    // fontSize: typography.sizes.sm,
  },
  referenceCountText: {
    fontSize: typography.sizes.sm,
  },
  resultText: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs,
  },
  eraInfoContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  eraText: {
    fontSize: typography.sizes.xxl,
    fontWeight: 600,
  },
});

export default KeywordEraQuizCard;
