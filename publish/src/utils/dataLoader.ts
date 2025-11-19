import keywordData from '../keywordsSource';
import keywordTypes from '../keywordTypesSource';
import eventsData from '../eventsSource';
import { Keyword } from '../types/Keyword';
import { TypeDetail } from '../types/TypeDetail';
import { EventItem } from '../types/EventItem';

export const loadKeywordData = async (): Promise<Keyword[]> => {
  return keywordData as Keyword[];
};

export const loadTypeDetails = (): TypeDetail[] => {
  const details = (keywordTypes as { 'types-details': TypeDetail[] })['types-details'];
  return details || [];
};

export const loadEventData = async (): Promise<EventItem[]> => {
  return eventsData as EventItem[];
};
