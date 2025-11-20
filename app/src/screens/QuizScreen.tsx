import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { ActivityIndicator, Button, Surface, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AnswerBoxes from '../components/AnswerBoxes';
import AnswerModal from '../components/AnswerModal';
import DescriptionList from '../components/DescriptionList';
import ReferenceModal from '../components/ReferenceModal';
import ScoreFrequencyLabel from '../components/ScoreFrequencyLabel';
import TypeLabel from '../components/TypeLabel';
import { useQuiz } from '../context/QuizContext';
import { RootStackParamList } from '../types/navigation';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { mergeReferenceIds } from '../utils/references';

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

const QuizScreen: React.FC<Props> = () => {
  const { currentProblem, currentIndex, totalProblems, goToNext, goToPrevious, answer, setAnswer, resetKey, loading } =
    useQuiz();
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [referenceModalVisible, setReferenceModalVisible] = useState(false);

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

  if (loading) {
    return (
      <Surface style={styles.center}>
        <ActivityIndicator animating color={theme.colors.primary} />
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

        <Surface style={styles.card} elevation={3}>
          <View style={styles.infoRow}>
            <ScoreFrequencyLabel scores={currentProblem.score} textStyle={styles.frequencyText} />
            <Pressable
              onPress={() => setReferenceModalVisible(true)}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text style={[styles.referenceText, { color: theme.colors.primary }]}>
                {`${referenceCount}회 출제`}
              </Text>
            </Pressable>
          </View>

          <TypeLabel types={currentProblem.types} />
          <DescriptionList descriptions={displayDescriptions} />
          <AnswerBoxes keyword={currentProblem.keyword} onAnswerChange={setAnswer} resetKey={resetKey} />
        </Surface>

        <Button
          mode="contained"
          style={styles.submitButton}
          buttonColor={isCorrect ? theme.colors.secondary : theme.colors.primary}
          onPress={() => setModalVisible(true)}
        >
          확인하기
        </Button>
      </ScrollView>

      <AnswerModal
        visible={modalVisible}
        answer={currentProblem.keyword}
        onClose={() => setModalVisible(false)}
        onNext={() => {
          setModalVisible(false);
          if (canGoNext) {
            goToNext();
          }
        }}
      />
      <ReferenceModal
        visible={referenceModalVisible}
        entries={referenceEntries}
        onClose={() => setReferenceModalVisible(false)}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: spacing.lg
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  counter: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold
  },
  submitButton: {
    marginTop: spacing.md
  },
  frequencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md
  },
  frequencyText: {
    fontSize: typography.sizes.md
  },
  referenceText: {
    fontSize: typography.sizes.md,
    textDecorationLine: 'underline'
  },
  card: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: spacing.md
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  }
});

export default QuizScreen;
