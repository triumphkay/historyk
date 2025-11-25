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
  answer: string;
  setAnswer: (value: string) => void;
  resetAnswer: () => void;
  resetKey: number;
  loading: boolean;
}

const QuizContext = createContext<QuizContextValue | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [problems, setProblems] = useState<QuizItem[]>([]); // All problems
  const [quizProblems, setQuizProblems] = useState<QuizItem[]>([]); // Filtered for quiz
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [loading, setLoading] = useState(true);

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
      setCurrentIndex((prev) => prev + 1);
      resetAnswer();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      resetAnswer();
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
    answer,
    setAnswer,
    resetAnswer,
    resetKey,
    loading
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
