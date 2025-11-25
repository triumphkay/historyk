import React, { useEffect, useMemo, useState, useRef } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Animated } from 'react-native';
import { ActivityIndicator, Button, Menu, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReferenceModal from '../components/ReferenceModal';
import TypeLabel from '../components/TypeLabel';
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

const KeywordEraQuizScreen: React.FC<Props> = () => {
  const theme = useTheme();
  const { problems, currentProblem, selectedEraIndex, currentIndex, totalProblems, goToNext, goToPrevious, loading, resetKey } = useNewWordEraQuiz();
  const [country, setCountry] = useState('');
  const [leader, setLeader] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [referenceVisible, setReferenceVisible] = useState(false);
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
  const frequencyLabel = useMemo(() => getFrequencyLabel(currentProblem?.scores || []), [currentProblem]);

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.headerRow} elevation={0}>
          <Button mode="outlined" onPress={goToPrevious} disabled={!canGoPrevious}>
            ← 이전
          </Button>
          <Text style={styles.counter}>{headerText}</Text>
          <Button mode="outlined" onPress={goToNext} disabled={!canGoNext}>
            다음 →
          </Button>
        </Surface>

        <View style={{ position: 'relative', minHeight: 400 }}>
          {/* Front Side */}
          <Animated.View
            style={[
              flipStyles.flipCard,
              { transform: [{ rotateY: frontInterpolate }] },
              isFlipped && flipStyles.flipCardFrontHidden
            ]}
          >
            <Surface style={styles.card} elevation={3}>
              <View style={styles.infoRow}>
                <Text style={[styles.frequencyText, { color: theme.colors.onSurfaceVariant }]}>
                  {frequencyLabel}
                </Text>
                <Pressable
                  onPress={() => setReferenceVisible(true)}
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <Text style={[styles.referenceText, { color: theme.colors.primary }]}>
                    {`${referenceEntries.length}회 출제`}
                  </Text>
                </Pressable>
              </View>

              <TypeLabel types={currentProblem.types} preferEraType={true} />

              <Text style={[styles.keyword, { color: theme.colors.onSurface }]}>
                {currentProblem.keyword}
                {currentProblem.era_script && currentProblem.era_script.length > 0 && currentProblem.era_script[0] 
                  ? ` ${currentProblem.era_script[0]}` 
                  : ''}
              </Text>

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
                  <Text style={[styles.hintLabel, { color: theme.colors.onSurfaceVariant }]}>연도</Text>
                  <View style={styles.yearRow}>
                    <TextInput
                      mode="outlined"
                      label="YYYY"
                      keyboardType="numeric"
                      value={year}
                      onChangeText={(text) => setYear(handleNumericChange(text, 4))}
                      style={styles.yearInput}
                      placeholder="0000"
                    />
                    <Text style={styles.yearSuffix}>년</Text>
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
                        />
                        <Text style={styles.yearSuffix}>월</Text>
                      </>
                    ) : null}
                  </View>
                </View>
              ) : null}
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
            <Surface style={[styles.card, flipStyles.answerCard]} elevation={3}>
              <Text style={flipStyles.answerTitle}>정답</Text>
              <Text style={flipStyles.answerKeyword}>{currentProblem.keyword}</Text>
              <View style={flipStyles.answerDetails}>
                <Text style={flipStyles.answerLabel}>시대</Text>
                <Text style={flipStyles.answerValue}>{selectedEra}</Text>
                {selectedDetEra && (
                  <>
                    <Text style={flipStyles.answerLabel}>상세</Text>
                    <Text style={flipStyles.answerValue}>{selectedDetEra}</Text>
                  </>
                )}
                {currentProblem.years && (
                  <>
                    <Text style={flipStyles.answerLabel}>연도</Text>
                    <Text style={flipStyles.answerValue}>{currentProblem.years}</Text>
                  </>
                )}
              </View>
            </Surface>
          </Animated.View>
        </View>

        <Button 
          mode="contained" 
          style={styles.submitButton}
          onPress={handleFlip}
        >
          {isFlipped ? '문제로 돌아가기' : '확인하기'}
        </Button>
      </ScrollView>

      <ReferenceModal
        visible={referenceVisible}
        entries={referenceEntries}
        onClose={() => setReferenceVisible(false)}
      />
    </Surface>
  );
};

const styles = { ...quizScreenStyles, ...eraQuizStyles };

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
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: spacing.lg,
  },
  answerDetails: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  answerLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginTop: spacing.sm,
    opacity: 0.7,
  },
  answerValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
});

export default KeywordEraQuizScreen;
