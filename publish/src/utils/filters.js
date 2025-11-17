import { pickRandomItems, shuffle } from './random';

export const isEligibleKeyword = (record = {}) => {
  const { descriptions = [], types = [] } = record;
  const onlyPeriodType =
    Array.isArray(types) &&
    types.length === 1 &&
    typeof types[0] === 'string' &&
    types[0].trim() === '사건-시기';

  return Array.isArray(descriptions) && descriptions.length >= 3 && !onlyPeriodType;
};

export const prepareProblems = (records = []) => {
  const eligible = (records || []).filter(isEligibleKeyword);
  const randomized = shuffle(eligible);
  return randomized.map((record) => ({
    ...record,
    descriptions: pickRandomItems(record.descriptions, 3)
  }));
};
