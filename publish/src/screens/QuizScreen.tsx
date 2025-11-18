import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
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

        <TypeLabel types={currentProblem.types} />
        <DescriptionList descriptions={currentProblem.descriptions} />

        <AnswerBoxes keyword={currentProblem.keyword} onAnswerChange={setAnswer} resetKey={resetKey} />
        <ScoreFrequencyLabel scores={currentProblem.score} />

        <Button mode="outlined" style={styles.referenceButton} onPress={() => setReferenceModalVisible(true)}>
          {`${referenceCount}회 출제`}
        </Button>

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
  referenceButton: {
    marginTop: spacing.md
  },
  submitButton: {
    marginTop: spacing.md
  }
});

export default QuizScreen;
