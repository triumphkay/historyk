import { Keyword } from '../types/Keyword';
import { NewWord } from '../types/NewWord';
import { QuizItem } from '../types/QuizItem';
import { pickRandomItems, shuffle } from './random';

export const isEligibleKeyword = (record: Keyword): boolean => {
  const { descriptions, types } = record;
  const onlyPeriodType =
    types.length === 1 && typeof types[0] === 'string' && types[0].trim() === '사건-시기';
  return descriptions.length >= 3 && !onlyPeriodType;
};

export const isEligibleNewWord = (record: NewWord): boolean => {
  const { descriptions, types } = record;
  const onlyPeriodType =
    types.length === 1 && typeof types[0] === 'string' && types[0].trim() === '시기';
  return descriptions.length >= 3 && !onlyPeriodType;
};

export const convertNewWordToQuizItem = (newWord: NewWord): QuizItem => {
  return {
    id: newWord.id,
    keyword: newWord.keyword,
    descriptions: newWord.descriptions,
    ref_id: newWord.ref_id,
    q_ref_id: newWord.q_ref_id,
    types: newWord.types,
    score: newWord.scores,
    era: newWord.era,
    sub_era: newWord.sub_era,
    det_era: newWord.det_era,
    years: newWord.years,
    era_script: newWord.era_script
  };
};

export const prepareProblems = (records: Keyword[] = []): QuizItem[] => {
  const eligible = records.filter(isEligibleKeyword);
  const randomized = shuffle(eligible);
  return randomized.map((record) => ({
    ...record,
    descriptions: record.descriptions
  }));
};

export const prepareNewWordProblems = (records: NewWord[] = []): QuizItem[] => {
  // No filtering - return all records
  const randomized = shuffle(records);
  return randomized.map(convertNewWordToQuizItem);
};

export const prepareNewWordQuizProblems = (records: NewWord[] = []): QuizItem[] => {
  // Filter for quiz: only records with 3 or more descriptions
  const eligible = records.filter(record => record.descriptions.length >= 3);
  const randomized = shuffle(eligible);
  return randomized.map(convertNewWordToQuizItem);
};

