import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadKeywordData } from '../utils/dataLoader';
import { prepareProblems } from '../utils/filters';

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const [problems, setProblems] = useState([]);
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
      resetAnswer();
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      resetAnswer();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const value = {
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

export const useQuiz = () => useContext(QuizContext);
