import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { NewWordEraItem } from '../types/NewWordEraItem';
import { loadNewWordData } from '../utils/dataLoader';
import { shuffle } from '../utils/random';

export type ExtendedNewWordEraItem = NewWordEraItem & { selectedEraIndex: number };

interface NewWordEraQuizContextValue {
  problems: ExtendedNewWordEraItem[];
  currentProblem: ExtendedNewWordEraItem | null;
  selectedEraIndex: number;
  currentIndex: number;
  totalProblems: number;
  goToNext: () => void;
  goToPrevious: () => void;
  setCurrentIndex: (index: number) => void;
  loading: boolean;
  resetKey: number;
  cardStates: Record<number, { country: string; leader: string; year: string; month: string; isFlipped: boolean }>;
  updateCardState: (index: number, state: Partial<{ country: string; leader: string; year: string; month: string; isFlipped: boolean }>) => void;
  resetAllCards: () => void;
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
  const [problems, setProblems] = useState<ExtendedNewWordEraItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [cardStates, setCardStates] = useState<Record<number, { country: string; leader: string; year: string; month: string; isFlipped: boolean }>>({});

  useEffect(() => {
    const bootstrap = async () => {
      const newWords = await loadNewWordData();
      
      // Filter: has era type and valid era data
      const eligible = newWords.filter(item => 
        hasEraType(item.types) && hasValidEra(item)
      );
      
      const shuffled = shuffle(eligible);
      
      // Pre-calculate selectedEraIndex for all items
      const extendedProblems = shuffled.map(item => ({
        ...item,
        selectedEraIndex: selectRandomEraIndex(item.era)
      }));
      
      setProblems(extendedProblems);
      setLoading(false);
    };
    bootstrap();
  }, []);

  const updateCardState = (index: number, state: Partial<{ country: string; leader: string; year: string; month: string; isFlipped: boolean }>) => {
    setCardStates((prev) => ({
      ...prev,
      [index]: {
        ...(prev[index] || { country: '', leader: '', year: '', month: '', isFlipped: false }),
        ...state,
      },
    }));
  };

  const resetAllCards = () => {
    setCardStates({});
  };

  const currentProblem = useMemo(() => {
    if (!problems.length) {
      return null;
    }
    return problems[currentIndex];
  }, [problems, currentIndex]);

  const goToNext = () => {
    if (currentIndex < problems.length - 1) {
      // Reset current card to front before moving
      updateCardState(currentIndex, { isFlipped: false });
      setCurrentIndex((prev) => prev + 1);
      setResetKey((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      // Reset current card to front before moving
      updateCardState(currentIndex, { isFlipped: false });
      setCurrentIndex((prev) => prev - 1);
      setResetKey((prev) => prev + 1);
    }
  };

  const value: NewWordEraQuizContextValue = {
    problems,
    currentProblem,
    selectedEraIndex: currentProblem ? currentProblem.selectedEraIndex : 0,
    currentIndex,
    totalProblems: problems.length,
    goToNext,
    goToPrevious,
    setCurrentIndex,
    loading,
    resetKey,
    cardStates,
    updateCardState,
    resetAllCards,
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
