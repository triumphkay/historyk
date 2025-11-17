import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AnswerBoxes from '../components/AnswerBoxes';
import AnswerModal from '../components/AnswerModal';
import DescriptionList from '../components/DescriptionList';
import TypeLabel from '../components/TypeLabel';
import { useQuiz } from '../context/QuizContext';

const QuizScreen = () => {
  const {
    currentProblem,
    currentIndex,
    totalProblems,
    goToNext,
    goToPrevious,
    answer,
    setAnswer,
    resetKey,
    loading
  } = useQuiz();

  const [modalVisible, setModalVisible] = useState(false);

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalProblems - 1;
  const isCorrect = useMemo(
    () => (currentProblem ? answer === currentProblem.keyword : false),
    [answer, currentProblem]
  );

  const headerText = useMemo(() => `${currentIndex + 1} / ${totalProblems}`, [currentIndex, totalProblems]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!currentProblem) {
    return (
      <View style={styles.center}>
        <Text>출제 가능한 문제가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable onPress={goToPrevious} disabled={!canGoPrevious} style={[styles.navButton, !canGoPrevious && styles.disabledButton]}>
            <Text style={styles.navLabel}>← 이전</Text>
          </Pressable>
          <Text style={styles.counter}>{headerText}</Text>
          <Pressable onPress={goToNext} disabled={!canGoNext} style={[styles.navButton, !canGoNext && styles.disabledButton]}>
            <Text style={styles.navLabel}>다음 →</Text>
          </Pressable>
        </View>

        <TypeLabel types={currentProblem.types} />
        <DescriptionList descriptions={currentProblem.descriptions} />

        <AnswerBoxes
          keyword={currentProblem.keyword}
          onAnswerChange={setAnswer}
          resetKey={resetKey}
        />

        <Pressable
          style={[styles.submitButton, isCorrect && styles.correctButton]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.submitText}>확인하기</Text>
        </Pressable>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    padding: 24
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
    marginBottom: 16
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#111'
  },
  disabledButton: {
    opacity: 0.4
  },
  navLabel: {
    fontSize: 14
  },
  counter: {
    fontSize: 18,
    fontWeight: '600'
  },
  submitButton: {
    marginTop: 32,
    backgroundColor: '#111',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  correctButton: {
    backgroundColor: '#2f855a'
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  }
});

export default QuizScreen;
