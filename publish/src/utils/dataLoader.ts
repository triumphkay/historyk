import keywordData from '../../assets/db.json';
import keywordTypes from '../../assets/keyword-types.json';
import { Keyword } from '../types/Keyword';
import { TypeDetail } from '../types/TypeDetail';

export const loadKeywordData = async (): Promise<Keyword[]> => {
  return keywordData as Keyword[];
};

export const loadTypeDetails = (): TypeDetail[] => {
  const details = (keywordTypes as { 'types-details': TypeDetail[] })['types-details'];
  return details || [];
};
