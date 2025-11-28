import React, { useEffect, useMemo, useState, useRef } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Animated } from 'react-native';
import { ActivityIndicator, Button, IconButton, Menu, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import TypeLabel from '../components/TypeLabel';
import DescriptionList from '../components/DescriptionList';
import ScoreFrequencyLabel from '../components/ScoreFrequencyLabel';
import { useNewWordEraQuiz } from '../context/NewWordEraQuizContext';
import { RootStackParamList } from '../types/navigation';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { mergeReferenceIds } from '../utils/references';
import { getFrequencyLabel, parseYearParts } from '../utils/eraQuiz';
import keywordTypes from '../../assets/keyword-types.json';
import { TypeDetail } from '../types/TypeDetail';
import { pickDisplayType } from '../utils/types';
import { quizScreenStyles, eraQuizStyles } from '../theme/quizStyles';

interface DropdownSelectProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({ label, value, options, onSelect, disabled }) => {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Button mode="outlined" onPress={() => setVisible(true)} disabled={disabled} style={styles.dropdownButton}>
          {value || label}
        </Button>
      }
    >
      {options.map((option) => (
        <Menu.Item
          onPress={() => {
            onSelect(option);
            setVisible(false);
          }}
          title={option}
          key={option}
          titleStyle={{ color: theme.colors.onSurface }}
        />
      ))}
    </Menu>
  );
};

type Props = NativeStackScreenProps<RootStackParamList, 'KeywordEraQuizScreen'>;

const KeywordEraQuizScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { problems, currentProblem, selectedEraIndex, currentIndex, totalProblems, goToNext, goToPrevious, loading, resetKey } = useNewWordEraQuiz();
  const [country, setCountry] = useState('');
  const [leader, setLeader] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const metadata = keywordTypes as {
    'key-age': Array<{ nation: string; list: string[] }>;
    'types-details': TypeDetail[];
  };
  const keyAgeData = metadata['key-age'] || [];
  const typeDetails = metadata['types-details'] || [];

  // Get selected era and det_era based on selectedEraIndex
  const selectedEra = useMemo(() => {
    if (!currentProblem || !currentProblem.era[selectedEraIndex]) return '';
    return currentProblem.era[selectedEraIndex];
  }, [currentProblem, selectedEraIndex]);

  const selectedDetEra = useMemo(() => {
    if (!currentProblem || !currentProblem.det_era[selectedEraIndex]) return '';
    return currentProblem.det_era[selectedEraIndex];
  }, [currentProblem, selectedEraIndex]);

  // Determine if this is nation-only (no det_era) or nation+leader
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
    // Set country based on selected era
    setCountry(hasLeaderAnswer ? selectedEra : '');
    setLeader('');
    setYear('');
    setMonth('');
    // Reset flip when problem changes
    setIsFlipped(false);
    flipAnimation.setValue(0);
  }, [currentProblem, resetKey, selectedEra, hasLeaderAnswer, flipAnimation]);

  const yearParts = useMemo(() => parseYearParts(currentProblem?.years || ''), [currentProblem]);
  const referenceEntries = useMemo(() => mergeReferenceIds(currentProblem?.ref_id || [], currentProblem?.q_ref_id || []), [currentProblem]);


  const isCorrect = useMemo(() => {
    if (!currentProblem) return false;

    // Check Era (Country)
    if (country !== selectedEra) return false;

    // Check Detail Era (Leader)
    const hasLeaderAnswer = Boolean(selectedDetEra.trim());
    if (hasLeaderAnswer && leader !== selectedDetEra) return false;

    // Check Year
    const shouldShowYearInputs = currentProblem.years_check === 'true';
    if (shouldShowYearInputs) {
      if (year !== yearParts.year) return false;
      if (yearParts.month && month !== yearParts.month) return false;
    }

    return true;
  }, [currentProblem, country, leader, year, month, selectedEra, selectedDetEra, yearParts]);

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
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalProblems - 1;
  const totalProblemCount = totalProblems;
  const currentProblemIndex =
    totalProblemCount > 0 ? Math.min(Math.max(currentIndex + 1, 1), totalProblemCount) : 0;
  const headerText = `${currentProblemIndex} / ${totalProblemCount}`;

  if (loading) {
    return (
      <Surface style={styles.center}>
        <ActivityIndicator animating />
      </Surface>
    );
  }

  if (!currentProblem) {
    return (
      <Surface style={styles.center}>
        <Text>출제 가능한 문제가 없습니다.</Text>
      </Surface>
    );
  }

  const handleNumericChange = (value: string, length: number) => value.replace(/[^0-9]/g, '').slice(0, length);
  const shouldShowYearInputs = currentProblem.years_check === 'true';
  const leaderDisabled = !hasLeaderAnswer || (hasLeaderAnswer && !country);

  return (
    <Surface style={styles.container}>
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
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ position: 'relative', height: 360 }}>
          {/* Front Side */}
          <Animated.View
            style={[
              flipStyles.flipCard,
              { transform: [{ rotateY: frontInterpolate }] },
              isFlipped && flipStyles.flipCardFrontHidden
            ]}
          >
            <Surface style={[styles.card, styles.fixedCard, { backgroundColor: '#000000' }]} elevation={3}>
              {/* Header Section */}
              <View style={styles.cardHeader}>
                <ScoreFrequencyLabel
                  scores={currentProblem.scores}
                  textStyle={[styles.frequencyText, { color: 'rgba(255, 255, 255, 0.7)' }]}
                />
                <TypeLabel types={currentProblem.types} preferEraType={true} />
              </View>

              {/* Hint Section (Centered) */}
              <View style={styles.cardHint}>
                <Text style={[styles.keyword, { color: '#FFFFFF' }]}>
                  {currentProblem.keyword}
                  {currentProblem.era_script && currentProblem.era_script.length > 0 && currentProblem.era_script[0]
                    ? ` ${currentProblem.era_script[0]}`
                    : ''}
                </Text>
              </View>

              {/* Answer Section (Bottom) */}
              <View style={styles.cardAnswer}>
                <View style={styles.dropdownRow}>
                  <DropdownSelect
                    label="시기"
                    value={country}
                    options={countryOptions}
                    onSelect={setCountry}
                    disabled={hasLeaderAnswer}
                  />
                  {hasLeaderAnswer ? (
                    <DropdownSelect
                      label="상세"
                      value={leader}
                      options={leaderOptions}
                      onSelect={setLeader}
                      disabled={false}
                    />
                  ) : null}
                </View>

                {shouldShowYearInputs ? (
                  <View style={styles.yearContainer}>
                    <Text style={[styles.hintLabel, { color: 'rgba(255, 255, 255, 0.7)' }]}>연도</Text>
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
          >
            <Surface style={[styles.card, flipStyles.answerCard, styles.fixedCard]} elevation={3}>
              <Text style={[flipStyles.resultText, { color: isCorrect ? theme.colors.secondary : theme.colors.error }]}>
                {isCorrect ? '정답입니다' : '오답입니다'}
              </Text>

              <View style={flipStyles.keywordRow}>
                <Text style={flipStyles.answerKeyword}>{currentProblem.keyword}</Text>
                <Pressable
                  onPress={() => {
                    navigation.navigate('KeywordDetail', {
                      keyword: {
                        ...currentProblem,
                        score: currentProblem.scores
                      } as any
                    });
                  }}
                  style={flipStyles.detailButton}
                >
                  <Text style={[flipStyles.detailButtonText, { color: theme.colors.primary }]}>_더보기</Text>
                </Pressable>
              </View>

              <DescriptionList descriptions={currentProblem.descriptions} />

              <View style={flipStyles.infoRowBottom}>
                <ScoreFrequencyLabel
                  scores={currentProblem.scores}
                  textStyle={flipStyles.importanceText}
                />
                <Text style={flipStyles.referenceCountText}>
                  출제 횟수: {referenceEntries.length}회
                </Text>
              </View>
            </Surface>
          </Animated.View>
        </View>
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <Button
          mode="contained"
          style={styles.submitButton}
          buttonColor={isCorrect ? theme.colors.secondary : theme.colors.primary}
          onPress={handleFlip}
        >
          {isFlipped ? '문제보기' : '확인하기'}
        </Button>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  ...quizScreenStyles,
  ...eraQuizStyles,
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  bottomButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  navButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

const flipStyles = StyleSheet.create({
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
    justifyContent: 'center',
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
  descriptionsText: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
    textAlign: 'center',
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
    textAlign: 'center',
  },
  answerValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
});

export default KeywordEraQuizScreen;
