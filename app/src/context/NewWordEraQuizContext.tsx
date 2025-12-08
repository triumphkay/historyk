import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { NewWordEraItem } from '../types/NewWordEraItem';
import { loadNewWordData } from '../utils/dataLoader';
import { shuffle } from '../utils/random';
import keywordTypes from '../../assets/keyword-types.json';
import { TypeDetail } from '../types/TypeDetail';

export type QuizMode = 'era-only' | 'sub-era' | 'det-era' | 'random-sub-or-det';

export type ExtendedNewWordEraItem = NewWordEraItem & { 
  selectedEraIndex: number;
  quizMode: QuizMode;
  selectedField: 'sub_era' | 'det_era' | null; // For random mode
};

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

const ageSensitiveSet: Set<string> = (() => {
  const entries = (keywordTypes as { "type-set": TypeDetail[] })["type-set"] || [];
  const titles = entries
    .filter((entry) => entry?.age)
    .map((entry) => (entry?.title || "").trim())
    .filter(Boolean);
  return new Set(titles);
})();

const hasEraType = (types: string[]): boolean => {
  return types.some((type) => ageSensitiveSet.has(type.trim()));
};

const hasValidEra = (item: NewWordEraItem): boolean => {
  return item.era.length > 0 && item.era[0] !== '';
};

const selectRandomEraIndex = (eraArray: string[]): number => {
  if (eraArray.length === 0) return 0;
  return Math.floor(Math.random() * eraArray.length);
};

const determineQuizMode = (item: NewWordEraItem, eraIndex: number): { mode: QuizMode; selectedField: 'sub_era' | 'det_era' | null } => {
  const hasSubEra = item.sub_era && item.sub_era[eraIndex] && item.sub_era[eraIndex].trim() !== '';
  const hasDetEra = item.det_era && item.det_era[eraIndex] && item.det_era[eraIndex].trim() !== '';
  
  if (hasSubEra && hasDetEra) {
    // Both exist: randomly choose one
    const selectedField = Math.random() < 0.5 ? 'sub_era' : 'det_era';
    return { mode: 'random-sub-or-det', selectedField };
  } else if (hasSubEra) {
    // Only sub_era
    return { mode: 'sub-era', selectedField: null };
  } else if (hasDetEra) {
    // Only det_era
    return { mode: 'det-era', selectedField: null };
  } else {
    // Only era
    return { mode: 'era-only', selectedField: null };
  }
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
      
      // Pre-calculate selectedEraIndex and quiz mode for all items
      const extendedProblems = shuffled.map(item => {
        const selectedEraIndex = selectRandomEraIndex(item.era);
        const { mode, selectedField } = determineQuizMode(item, selectedEraIndex);
        
        return {
          ...item,
          selectedEraIndex,
          quizMode: mode,
          selectedField
        };
      });
      
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
      const prevIndex = currentIndex;
      setCurrentIndex((prev) => prev + 1);
      setResetKey((prev) => prev + 1);
      // Reset previous card to front after moving
      setTimeout(() => {
        updateCardState(prevIndex, { isFlipped: false });
      }, 0);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex;
      setCurrentIndex((prev) => prev - 1);
      setResetKey((prev) => prev + 1);
      // Reset previous card to front after moving
      setTimeout(() => {
        updateCardState(prevIndex, { isFlipped: false });
      }, 0);
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
