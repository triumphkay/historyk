import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { EventItem } from '../types/EventItem';
import { loadEventData } from '../utils/dataLoader';
import { shuffle } from '../utils/random';

interface EraQuizContextValue {
  problems: EventItem[];
  currentProblem: EventItem | null;
  currentIndex: number;
  totalProblems: number;
  goToNext: () => void;
  goToPrevious: () => void;
  loading: boolean;
  resetKey: number;
}

const EraQuizContext = createContext<EraQuizContextValue | undefined>(undefined);

const isValidEvent = (event: EventItem): boolean => {
  return Array.isArray(event.times) && event.times.length === 2;
};

export const EraQuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [problems, setProblems] = useState<EventItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const bootstrap = async () => {
      const events = await loadEventData();
      const eligible = events.filter(isValidEvent);
      setProblems(shuffle(eligible));
      setLoading(false);
    };
    bootstrap();
  }, []);

  const currentProblem = useMemo(() => {
    if (!problems.length) {
      return null;
    }
    return problems[currentIndex];
  }, [problems, currentIndex]);

  const goToNext = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setResetKey((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setResetKey((prev) => prev + 1);
    }
  };

  const value: EraQuizContextValue = {
    problems,
    currentProblem,
    currentIndex,
    totalProblems: problems.length,
    goToNext,
    goToPrevious,
    loading,
    resetKey
  };

  return <EraQuizContext.Provider value={value}>{children}</EraQuizContext.Provider>;
};

export const useEraQuiz = (): EraQuizContextValue => {
  const context = useContext(EraQuizContext);
  if (!context) {
    throw new Error('useEraQuiz must be used within EraQuizProvider');
  }
  return context;
};
