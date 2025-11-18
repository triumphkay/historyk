import { Keyword } from '../types/Keyword';
import { QuizItem } from '../types/QuizItem';
import { pickRandomItems, shuffle } from './random';

export const isEligibleKeyword = (record: Keyword): boolean => {
  const { descriptions, types } = record;
  const onlyPeriodType =
    types.length === 1 && typeof types[0] === 'string' && types[0].trim() === '사건-시기';
  return descriptions.length >= 3 && !onlyPeriodType;
};

export const prepareProblems = (records: Keyword[] = []): QuizItem[] => {
  const eligible = records.filter(isEligibleKeyword);
  const randomized = shuffle(eligible);
  return randomized.map((record) => ({
    ...record,
    descriptions: pickRandomItems(record.descriptions, 3)
  }));
};
