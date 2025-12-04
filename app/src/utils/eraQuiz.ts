export const getFrequencyLabel = (scores: Array<string | number> = []): string => {
  const total = (scores || []).reduce((sum, value) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return sum + (Number.isFinite(num) ? num : 0);
  }, 0);
  if (total >= 20) {
    return '출제빈도: 매우 높음';
  }
  if (total >= 12) {
    return '출제빈도: 높음';
  }
  if (total >= 4) {
    return '출제빈도: 보통';
  }
  if (total >= 1) {
    return '출제빈도: 낮음';
  }
  return '출제빈도: 정보 없음';
};

export const parseYearParts = (years: string) => {
  if (!years || !years.trim()) {
    return { year: null as string | null, month: null as string | null, day: null as string | null };
  }
  const yearMatch = years.match(/(\d{3,4})년/);
  const monthMatch = years.match(/(\d{1,2})월/);
  const dayMatch = years.match(/(\d{1,2})일/);
  return {
    year: yearMatch ? yearMatch[1] : null,
    month: monthMatch ? monthMatch[1].padStart(2, '0') : null,
    day: dayMatch ? dayMatch[1].padStart(2, '0') : null
  };
};

export { mergeReferenceIds, formatReferenceEntry } from './references';
