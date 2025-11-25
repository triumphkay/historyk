import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { NewWordEraItem } from '../types/NewWordEraItem';
import { loadNewWordData } from '../utils/dataLoader';
import { shuffle } from '../utils/random';

interface NewWordEraQuizContextValue {
  problems: NewWordEraItem[];
  currentProblem: NewWordEraItem | null;
  selectedEraIndex: number; // Index of selected era from parallel arrays
  currentIndex: number;
  totalProblems: number;
  goToNext: () => void;
  goToPrevious: () => void;
  loading: boolean;
  resetKey: number;
}

const NewWordEraQuizContext = createContext<NewWordEraQuizContextValue | undefined>(undefined);

const hasEraType = (types: string[]): boolean => {
  return types.some(type => type.endsWith('-시기') || type === '시기');
};

const hasValidEra = (item: NewWordEraItem): boolean => {
  return item.era.length > 0 && item.era[0] !== '';
};

const selectRandomEraIndex = (eraArray: string[]): number => {
  if (eraArray.length === 0) return 0;
  return Math.floor(Math.random() * eraArray.length);
};

export const NewWordEraQuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [problems, setProblems] = useState<NewWordEraItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedEraIndex, setSelectedEraIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const bootstrap = async () => {
      const newWords = await loadNewWordData();
      
      // Filter: has era type and valid era data
      const eligible = newWords.filter(item => 
        hasEraType(item.types) && hasValidEra(item)
      );
      
      const shuffled = shuffle(eligible);
      setProblems(shuffled);
      
      // Select random era index for first problem
      if (shuffled.length > 0) {
        setSelectedEraIndex(selectRandomEraIndex(shuffled[0].era));
      }
      
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
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      // Select random era index for next problem
      setSelectedEraIndex(selectRandomEraIndex(problems[nextIndex].era));
      setResetKey((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      // Select random era index for previous problem
      setSelectedEraIndex(selectRandomEraIndex(problems[prevIndex].era));
      setResetKey((prev) => prev + 1);
    }
  };

  const value: NewWordEraQuizContextValue = {
    problems,
    currentProblem,
    selectedEraIndex,
    currentIndex,
    totalProblems: problems.length,
    goToNext,
    goToPrevious,
    loading,
    resetKey
  };

  return <NewWordEraQuizContext.Provider value={value}>{children}</NewWordEraQuizContext.Provider>;
};

export const useNewWordEraQuiz = (): NewWordEraQuizContextValue => {
  const context = useContext(NewWordEraQuizContext);
  if (!context) {
    throw new Error('useNewWordEraQuiz must be used within NewWordEraQuizProvider');
  }
  return context;
};
