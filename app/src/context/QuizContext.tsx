import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { QuizItem } from '../types/QuizItem';
import { loadNewWordData } from '../utils/dataLoader';
import { prepareNewWordProblems, prepareNewWordQuizProblems } from '../utils/filters';

interface QuizContextValue {
  problems: QuizItem[]; // All problems for keyword list
  quizProblems: QuizItem[]; // Filtered problems for quiz (descriptions >= 3)
  currentProblem: QuizItem | null;
  currentIndex: number;
  totalProblems: number;
  goToNext: () => void;
  goToPrevious: () => void;
  setCurrentIndex: (index: number) => void;
  answer: string;
  setAnswer: (value: string) => void;
  resetAnswer: () => void;
  resetKey: number;
  loading: boolean;
  cardStates: Record<number, { answer: string; isFlipped: boolean }>;
  updateCardState: (index: number, state: Partial<{ answer: string; isFlipped: boolean }>) => void;
  resetAllCards: () => void;
}

const QuizContext = createContext<QuizContextValue | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [problems, setProblems] = useState<QuizItem[]>([]); // All problems
  const [quizProblems, setQuizProblems] = useState<QuizItem[]>([]); // Filtered for quiz
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState(''); // Deprecated, keep for compatibility if needed or remove
  const [resetKey, setResetKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cardStates, setCardStates] = useState<Record<number, { answer: string; isFlipped: boolean }>>({});

  useEffect(() => {
    const bootstrap = async () => {
      const newWords = await loadNewWordData();
      const allPrepared = prepareNewWordProblems(newWords); // All without filtering
      const quizPrepared = prepareNewWordQuizProblems(newWords); // Filtered for quiz
      setProblems(allPrepared);
      setQuizProblems(quizPrepared);
      setLoading(false);
    };

    bootstrap();
  }, []);

  const updateCardState = (index: number, state: Partial<{ answer: string; isFlipped: boolean }>) => {
    setCardStates((prev) => ({
      ...prev,
      [index]: {
        ...(prev[index] || { answer: '', isFlipped: false }),
        ...state,
      },
    }));
  };

  const resetAllCards = () => {
    setCardStates({});
  };

  const currentProblem = useMemo(() => {
    if (!quizProblems.length) {
      return null;
    }
    return quizProblems[currentIndex];
  }, [currentIndex, quizProblems]);

  const resetAnswer = () => {
    setAnswer('');
    setResetKey((prev) => prev + 1);
  };

  const goToNext = () => {
    if (currentIndex < quizProblems.length - 1) {
      // Reset current card to front before moving
      updateCardState(currentIndex, { isFlipped: false });
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      // Reset current card to front before moving
      updateCardState(currentIndex, { isFlipped: false });
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const value: QuizContextValue = {
    problems, // All problems for keyword list
    quizProblems, // Filtered problems for quiz
    currentProblem,
    currentIndex,
    totalProblems: quizProblems.length,
    goToNext,
    goToPrevious,
    setCurrentIndex,
    answer,
    setAnswer,
    resetAnswer,
    resetKey,
    loading,
    cardStates,
    updateCardState,
    resetAllCards,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export const useQuiz = (): QuizContextValue => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return context;
};
