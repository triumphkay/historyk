import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Animated } from 'react-native';
import { ActivityIndicator, Button, Surface, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AnswerBoxes from '../components/AnswerBoxes';
import DescriptionList from '../components/DescriptionList';
import ReferenceModal from '../components/ReferenceModal';
import ScoreFrequencyLabel from '../components/ScoreFrequencyLabel';
import TypeLabel from '../components/TypeLabel';
import { useQuiz } from '../context/QuizContext';
import { RootStackParamList } from '../types/navigation';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { mergeReferenceIds } from '../utils/references';
import { quizScreenStyles } from '../theme/quizStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

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

const QuizScreen: React.FC<Props> = ({ navigation }) => {
  const { currentProblem, currentIndex, totalProblems, goToNext, goToPrevious, answer, setAnswer, resetKey, loading } =
    useQuiz();
  const theme = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const [referenceModalVisible, setReferenceModalVisible] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalProblems - 1;
  const isCorrect = useMemo(() => (currentProblem ? answer === currentProblem.keyword : false), [answer, currentProblem]);
  const headerText = useMemo(() => `${currentIndex + 1} / ${totalProblems}`, [currentIndex, totalProblems]);
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
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
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
      <ScrollView contentContainerStyle={quizScreenStyles.scrollContent}>
        <Surface style={styles.countContainer} elevation={1}>
          <Text style={styles.countText}>{headerText}</Text>
        </Surface>

        <View style={{ position: 'relative', minHeight: 400 }}>
          {/* Front Side */}
          <Animated.View
            style={[
              styles.flipCard,
              { transform: [{ rotateY: frontInterpolate }] },
              isFlipped && styles.flipCardFrontHidden // Hide front when flipped
            ]}
          >
            <Surface style={quizScreenStyles.card} elevation={3}>
              <View style={quizScreenStyles.infoRow}>
                <ScoreFrequencyLabel scores={currentProblem.score} textStyle={quizScreenStyles.frequencyText} />
                <Pressable
                  onPress={() => setReferenceModalVisible(true)}
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <Text style={[quizScreenStyles.referenceText, { color: theme.colors.primary }]}>
                    {`${referenceCount}회 출제`}
                  </Text>
                </Pressable>
              </View>

              <TypeLabel types={currentProblem.types} />
              <DescriptionList descriptions={displayDescriptions} />
              <AnswerBoxes keyword={currentProblem.keyword} onAnswerChange={setAnswer} resetKey={resetKey} />
            </Surface>
          </Animated.View>

          {/* Back Side */}
          <Animated.View
            style={[
              styles.flipCard,
              styles.flipCardBack,
              { transform: [{ rotateY: backInterpolate }] }
            ]}
          >
            <Surface style={[quizScreenStyles.card, styles.answerCard]} elevation={3}>
              <Text style={[styles.resultText, { color: isCorrect ? theme.colors.secondary : theme.colors.error }]}>
                {isCorrect ? '정답입니다' : '오답입니다'}
              </Text>
              
              <View style={styles.keywordRow}>
                <Text style={styles.answerKeyword}>{currentProblem.keyword}</Text>
                <Pressable 
                  onPress={() => {
                    navigation.navigate('KeywordDetail', { keyword: currentProblem });
                  }}
                  style={styles.detailButton}
                >
                  <Text style={[styles.detailButtonText, { color: theme.colors.primary }]}>_더보기</Text>
                </Pressable>
              </View>

              <View style={styles.descriptionsContainer}>
                <Text 
                  style={styles.descriptionsText}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {currentProblem.descriptions.join(', ')}
                </Text>
              </View>

              <View style={styles.infoRowBottom}>
                <ScoreFrequencyLabel scores={currentProblem.score} textStyle={styles.importanceText} />
                <Text style={styles.referenceCountText}>
                  출제 횟수: {referenceCount}회
                </Text>
              </View>
            </Surface>
          </Animated.View>
        </View>

        <View style={styles.bottomButtonRow}>
          <Button 
            mode="outlined" 
            onPress={goToPrevious} 
            disabled={!canGoPrevious}
            style={styles.navButton}
          >
            ← 이전
          </Button>
          <Button
            mode="contained"
            style={styles.submitButton}
            buttonColor={isCorrect ? theme.colors.secondary : theme.colors.primary}
            onPress={handleFlip}
          >
            {isFlipped ? '문제로 돌아가기' : '확인하기'}
          </Button>
          <Button 
            mode="outlined" 
            onPress={goToNext} 
            disabled={!canGoNext}
            style={styles.navButton}
          >
            다음 →
          </Button>
        </View>
      </ScrollView>

      <ReferenceModal
        visible={referenceModalVisible}
        entries={referenceEntries}
        onClose={() => setReferenceModalVisible(false)}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  countContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  flipCard: {
    width: '100%',
    backfaceVisibility: 'hidden',
  },
  flipCardFrontHidden: {
    // This style is applied to the front card when it's flipped to ensure it's visually hidden
    // without affecting its position during the animation.
    // The backfaceVisibility handles the actual "flipping" visual.
    // We might not strictly need this if backfaceVisibility is enough,
    // but it can help with z-index issues or ensuring content isn't clickable.
  },
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
  resultContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  resultText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  userAnswerText: {
    fontSize: typography.sizes.md,
    opacity: 0.7,
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

export default QuizScreen;
