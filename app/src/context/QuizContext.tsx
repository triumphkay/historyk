import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { QuizItem } from '../types/QuizItem';
import { loadKeywordData } from '../utils/dataLoader';
import { prepareProblems } from '../utils/filters';

interface QuizContextValue {
  problems: QuizItem[];
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
  const [problems, setProblems] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const rawKeywords = await loadKeywordData();
      const prepared = prepareProblems(rawKeywords);
      setProblems(prepared);
      setLoading(false);
    };

    bootstrap();
  }, []);

  const currentProblem = useMemo(() => {
    if (!problems.length) {
      return null;
    }
    return problems[currentIndex];
  }, [currentIndex, problems]);

  const resetAnswer = () => {
    setAnswer('');
    setResetKey((prev) => prev + 1);
  };

  const goToNext = () => {
    if (currentIndex < problems.length - 1) {
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
    problems,
    currentProblem,
    currentIndex,
    totalProblems: problems.length,
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
