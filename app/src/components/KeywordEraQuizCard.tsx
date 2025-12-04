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
import keyAgeData from "../../assets/key-age.json";
import { TypeDetail } from "../types/TypeDetail";
import { quizScreenStyles, eraQuizStyles } from "../theme/quizStyles";
import { POINT_COLOR_1 } from "../theme";
import FlipCard from "./common/FlipCard";
import QuizCardLayout from "./common/QuizCardLayout";
import AppText from "./common/AppText";

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

  // const metadata = keywordTypes as {
  //   "key-age": Array<{ nation: string; list: string[] }>;
  //   "types-details": TypeDetail[];
  // };
  // const keyAgeData = metadata["key-age"] || [];

  const selectedEraIndex = problem.selectedEraIndex;

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

  const hasLeaderAnswer = Boolean(selectedDetEra.trim());

  const countryOptions = useMemo(
    () => Array.from(new Set(keyAgeData.map((item) => item.nation))),
    [keyAgeData]
  );

  const leaderOptions = useMemo(() => {
    const entry = keyAgeData.find((item) => item.nation === selectedEra);
    return entry ? entry.list : [];
  }, [selectedEra, keyAgeData]);

  useEffect(() => {
    // Initialize country if needed (e.g. pre-filled for leader questions)
    // Only set if currently empty to avoid overwriting user input or infinite loops
    if (hasLeaderAnswer && !country) {
      updateCardState(index, { country: selectedEra });
    }
  }, [hasLeaderAnswer, selectedEra, country, index]);

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

    if (country !== selectedEra) return false;

    const hasLeaderAnswer = Boolean(selectedDetEra.trim());
    if (hasLeaderAnswer && leader !== selectedDetEra) return false;

    const shouldShowYearInputs = problem.years_check === "true"; // YEAR_INPUTS_ENABLED is now internal
    if (shouldShowYearInputs) {
      if (year !== yearParts.year) return false;
      if (yearParts.month && month !== yearParts.month) return false;
    }

    return true;
  }, [
    problem,
    country,
    leader,
    year,
    month,
    selectedEra,
    selectedDetEra,
    yearParts,
  ]);

  const handleNumericChange = (value: string, length: number) =>
    value.replace(/[^0-9]/g, "").slice(0, length);
  const shouldShowYearInputs = problem.years_check === "true"; // YEAR_INPUTS_ENABLED is now internal

  const setCountry = (val: string) => updateCardState(index, { country: val });
  const setLeader = (val: string) => updateCardState(index, { leader: val });
  const setYear = (val: string) => updateCardState(index, { year: val });
  const setMonth = (val: string) => updateCardState(index, { month: val });

  // --- Front Content ---
  const FrontHeader = (
    <View style={styles.cardHeader}>
      <PriorityMark
        scores={problem.scores}
        style={styles.cardScore}
        // textStyle={[
        //   styles.frequencyText,
        //   { color: theme.colors.onPrimary, opacity: 0.7 },
        // ]}
      />
      <TypeLabel types={problem.types} preferEraType={true} />
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
        <DropdownSelect
          label="시대"
          value={country}
          options={countryOptions}
          onSelect={setCountry}
          disabled={hasLeaderAnswer}
        />
        {hasLeaderAnswer ? (
          <DropdownSelect
            label="상세 시기"
            value={leader}
            options={leaderOptions}
            onSelect={setLeader}
            disabled={false}
          />
        ) : null}
      </View>

      {/* {shouldShowYearInputs ? (
        <View style={styles.yearContainer}>
          <Text
            style={[
              styles.hintLabel,
              { color: theme.colors.onPrimary, opacity: 0.7 },
            ]}
          >
            연도
          </Text>
          <View style={styles.yearRow}>
            <TextInput
              mode="outlined"
              label="YYYY"
              keyboardType="numeric"
              value={year}
              onChangeText={(text) => setYear(handleNumericChange(text, 4))}
              style={styles.yearInput}
              placeholder="0000"
              textColor="#FFFFFF"
              theme={{ colors: { onSurfaceVariant: "rgba(255,255,255,0.7)" } }}
            />
            <Text style={[styles.yearSuffix, { color: "#FFFFFF" }]}>년</Text>
            {yearParts.month ? (
              <>
                <TextInput
                  mode="outlined"
                  label="MM"
                  keyboardType="numeric"
                  value={month}
                  onChangeText={(text) =>
                    setMonth(handleNumericChange(text, 2))
                  }
                  style={styles.yearInput}
                  placeholder="00"
                  textColor="#FFFFFF"
                  theme={{
                    colors: { onSurfaceVariant: "rgba(255,255,255,0.7)" },
                  }}
                />
                <Text style={[styles.yearSuffix, { color: "#FFFFFF" }]}>
                  월
                </Text>
              </>
            ) : null}
          </View>
        </View>
      ) : null} */}
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
            opacity: country && (!hasLeaderAnswer || leader) ? 1 : 0,
          },
        ]}
      >
        {isCorrect ? "정답입니다" : "오답입니다"}
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

  const BackBody = (
    <View style={{ width: "100%" }}>
      <View style={styles.eraInfoContainer}>
        <AppText style={[styles.eraText, { color: backTextColor }]}>
          {[selectedEra, selectedSubEra, selectedDetEra]
            .filter(Boolean)
            .join(" ")}
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

  const BackFooter = (
    <View style={styles.infoRowBottom}>
      <PriorityMark
        scores={problem.scores}
        textStyle={[styles.importanceText, { color: backTextColor }]}
      />
      <AppText style={[styles.referenceCountText, { color: backTextColor }]}>
        출제 횟수: {referenceEntries.length}회
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
    fontSize: typography.sizes.xxl,
    // fontWeight: typography.weights.bold,
    fontWeight: 800,
  },
  keywordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
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
