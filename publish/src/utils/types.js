import { getRandomItem } from './random';

export const normalizeTypeString = (typeString = '') => typeString.toString().trim().toLowerCase().replace(/\s+/g, '');

export const isSigi = (typeString = '') => normalizeTypeString(typeString).includes('시기');

export const pickDisplayType = (types = []) => {
  if (!Array.isArray(types) || !types.length) {
    return null;
  }

  const nonSigiTypes = types.filter((type) => typeof type === 'string' && !isSigi(type));

  if (nonSigiTypes.length > 0) {
    return getRandomItem(nonSigiTypes);
  }

  return '시기';
};
