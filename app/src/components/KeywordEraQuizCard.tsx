import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { IconButton, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TypeLabel from './TypeLabel';
import ScoreFrequencyLabel from './ScoreFrequencyLabel';
import DropdownSelect from './DropdownSelect';
import { ExtendedNewWordEraItem, useNewWordEraQuiz } from '../context/NewWordEraQuizContext';
import { RootStackParamList } from '../types/navigation';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { mergeReferenceIds } from '../utils/references';
import { parseYearParts } from '../utils/eraQuiz';
import keywordTypes from '../../assets/keyword-types.json';
import { TypeDetail } from '../types/TypeDetail';
import { quizScreenStyles, eraQuizStyles } from '../theme/quizStyles';
import { POINT_COLOR_1 } from '../theme';

interface Props {
  problem: ExtendedNewWordEraItem;
  index: number;
}

const YEAR_INPUTS_ENABLED = false;
const { width } = Dimensions.get('window');

const KeywordEraQuizCard: React.FC<Props> = ({ problem, index }) => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { cardStates, updateCardState } = useNewWordEraQuiz();
  const cardState = cardStates[index] || { country: '', leader: '', year: '', month: '', isFlipped: false };
  const { country, leader, year, month, isFlipped } = cardState;
  
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const metadata = keywordTypes as {
    'key-age': Array<{ nation: string; list: string[] }>;
    'types-details': TypeDetail[];
  };
  const keyAgeData = metadata['key-age'] || [];

  const selectedEraIndex = problem.selectedEraIndex;

  const selectedEra = useMemo(() => {
    if (!problem || !problem.era[selectedEraIndex]) return '';
    return problem.era[selectedEraIndex];
  }, [problem, selectedEraIndex]);

  const selectedDetEra = useMemo(() => {
    if (!problem || !problem.det_era[selectedEraIndex]) return '';
    return problem.det_era[selectedEraIndex];
  }, [problem, selectedEraIndex]);

  const selectedSubEra = useMemo(() => {
    if (!problem || !problem.sub_era || !problem.sub_era[selectedEraIndex]) return '';
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

  const yearParts = useMemo(() => parseYearParts(problem?.years || ''), [problem]);
  const referenceEntries = useMemo(() => mergeReferenceIds(problem?.ref_id || [], problem?.q_ref_id || []), [problem]);

  const isCorrect = useMemo(() => {
    if (!problem) return false;

    if (country !== selectedEra) return false;

    const hasLeaderAnswer = Boolean(selectedDetEra.trim());
    if (hasLeaderAnswer && leader !== selectedDetEra) return false;

    const shouldShowYearInputs = YEAR_INPUTS_ENABLED && problem.years_check === 'true';
    if (shouldShowYearInputs) {
      if (year !== yearParts.year) return false;
      if (yearParts.month && month !== yearParts.month) return false;
    }

    return true;
  }, [problem, country, leader, year, month, selectedEra, selectedDetEra, yearParts]);

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
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const handleNumericChange = (value: string, length: number) => value.replace(/[^0-9]/g, '').slice(0, length);
  const shouldShowYearInputs = YEAR_INPUTS_ENABLED && problem.years_check === 'true';

  const setCountry = (val: string) => updateCardState(index, { country: val });
  const setLeader = (val: string) => updateCardState(index, { leader: val });
  const setYear = (val: string) => updateCardState(index, { year: val });
  const setMonth = (val: string) => updateCardState(index, { month: val });

  return (
    <View style={{ width: width, paddingHorizontal: spacing.md }}>
      <View style={{ position: 'relative', height: 360 }}>
        {/* Front Side */}
        <Animated.View
          style={[
            flipStyles.flipCard,
            { transform: [{ rotateY: frontInterpolate }] },
            isFlipped && flipStyles.flipCardFrontHidden
          ]}
          pointerEvents={isFlipped ? 'none' : 'auto'}
        >
          <Surface style={[styles.card, styles.fixedCard, { backgroundColor: theme.colors.primary }]} elevation={3}>
            {/* Header Section */}
            <View style={styles.cardHeader}>
              <ScoreFrequencyLabel
                scores={problem.scores}
                textStyle={[styles.frequencyText, { color: theme.colors.onPrimary, opacity: 0.7 }]}
              />
              <TypeLabel types={problem.types} preferEraType={true} />
            </View>

            {/* Hint Section (Centered) */}
            <View style={styles.cardHint}>
              <Text style={[styles.keyword, { color: theme.colors.onPrimary }]}>
                {problem.keyword}
                {problem.era_script && problem.era_script.length > 0 && problem.era_script[0]
                  ? ` ${problem.era_script[0]}`
                  : ''}
              </Text>
            </View>

            {/* Answer Section (Bottom) */}
            <View style={styles.cardAnswer}>
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

              {shouldShowYearInputs ? (
                <View style={styles.yearContainer}>
                  <Text style={[styles.hintLabel, { color: theme.colors.onPrimary, opacity: 0.7 }]}>연도</Text>
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
                      theme={{ colors: { onSurfaceVariant: 'rgba(255,255,255,0.7)' } }}
                    />
                    <Text style={[styles.yearSuffix, { color: '#FFFFFF' }]}>년</Text>
                    {yearParts.month ? (
                      <>
                        <TextInput
                          mode="outlined"
                          label="MM"
                          keyboardType="numeric"
                          value={month}
                          onChangeText={(text) => setMonth(handleNumericChange(text, 2))}
                          style={styles.yearInput}
                          placeholder="00"
                          textColor="#FFFFFF"
                          theme={{ colors: { onSurfaceVariant: 'rgba(255,255,255,0.7)' } }}
                        />
                        <Text style={[styles.yearSuffix, { color: '#FFFFFF' }]}>월</Text>
                      </>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>
          </Surface>
        </Animated.View>

        {/* Back Side */}
        <Animated.View
          style={[
            flipStyles.flipCard,
            flipStyles.flipCardBack,
            { transform: [{ rotateY: backInterpolate }] }
          ]}
          pointerEvents={isFlipped ? 'auto' : 'none'}
        >
          <Surface style={[styles.card, flipStyles.answerCard, styles.fixedCard]} elevation={3}>
            {/* Top Section: Result & Keyword */}
            <View>
              <Text style={[flipStyles.resultText, { 
                color: theme.colors.secondary,
                opacity: (country && (!hasLeaderAnswer || leader)) ? 1 : 0
              }]}>
                {isCorrect ? '정답입니다' : '오답입니다'}
              </Text>

              <View style={flipStyles.keywordRow}>
                <Text style={[flipStyles.answerKeyword, { color: POINT_COLOR_1 }]}>{problem.keyword}</Text>
                <IconButton
                  icon="information-outline"
                  size={20}
                  onPress={() => {
                    navigation.navigate('KeywordDetail', {
                      keyword: {
                        ...problem,
                        score: problem.scores
                      } as any
                    });
                  }}
                  style={{ margin: 0 }}
                />
              </View>
            </View>

            {/* Center Section: Era Info */}
            <View style={flipStyles.centerSection}>
              <View style={flipStyles.eraInfoContainer}>
                <Text style={[flipStyles.eraText, { color: theme.colors.onSurface, fontSize: 24 }]}>
                  {[selectedEra, selectedSubEra, selectedDetEra].filter(Boolean).join(' ')}
                </Text>
                {problem.years && (
                  <Text style={{ color: theme.colors.onSurface, fontSize: 24, fontWeight: '300', marginTop: 8 }}>
                    {problem.years}
                  </Text>
                )}
              </View>
            </View>

            {/* Bottom Section: Info */}
            <View style={flipStyles.infoRowBottom}>
              <ScoreFrequencyLabel
                scores={problem.scores}
                textStyle={flipStyles.importanceText}
              />
              <Text style={flipStyles.referenceCountText}>
                출제 횟수: {referenceEntries.length}회
              </Text>
            </View>
          </Surface>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ...quizScreenStyles,
  ...eraQuizStyles,
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
  flipCard: {
    width: '100%',
    backfaceVisibility: 'hidden',
  },
  flipCardFrontHidden: {},
  flipCardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  answerCard: {
    padding: spacing.lg,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    minHeight: 300,
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
  infoRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  eraInfoContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  eraText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
    textAlign: 'left',
  },
});

const flipStyles = styles; // Alias for compatibility

export default KeywordEraQuizCard;
