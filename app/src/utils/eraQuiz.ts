import { EventItem } from '../types/EventItem';

export const getFrequencyLabel = (scores: number[] = []): string => {
  const total = (scores || []).reduce((sum, value) => sum + (Number.isFinite(value) ? Number(value) : 0), 0);
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

export const getCountryMap = (events: EventItem[]) => {
  const map: Record<string, Set<string>> = {};
  events.forEach((event) => {
    if (Array.isArray(event.times) && event.times.length === 2) {
      const [country, leader] = event.times;
      if (!map[country]) {
        map[country] = new Set();
      }
      map[country].add(leader);
    }
  });
  return map;
};

export { mergeReferenceIds, formatReferenceEntry } from './references';
