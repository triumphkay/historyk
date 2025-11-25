import keywordData from '../keywordsSource';
import keywordTypes from '../../assets/keyword-types.json';
import eventsData from '../../assets/events.json';
import newWordsData from '../../assets/data.json';
import { Keyword } from '../types/Keyword';
import { TypeDetail } from '../types/TypeDetail';
import { EventItem } from '../types/EventItem';
import { NewWord } from '../types/NewWord';

export const loadKeywordData = async (): Promise<Keyword[]> => {
  return keywordData as Keyword[];
};

export const loadNewWordData = async (): Promise<NewWord[]> => {
  return newWordsData as NewWord[];
};

export const loadTypeDetails = (): TypeDetail[] => {
  const details = (keywordTypes as { 'types-details': TypeDetail[] })['types-details'];
  return details || [];
};

export const loadEventData = async (): Promise<EventItem[]> => {
  return eventsData as EventItem[];
};
