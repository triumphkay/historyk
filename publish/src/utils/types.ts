import { getRandomItem } from './random';

export const normalizeTypeString = (typeString = ''): string => typeString.toString().trim().toLowerCase().replace(/\s+/g, '');

export const isSigi = (typeString = ''): boolean => normalizeTypeString(typeString).includes('시기');

export const pickDisplayType = (types: string[] = []): string | null => {
  if (!Array.isArray(types) || types.length === 0) {
    return null;
  }

  const nonSigiTypes = types.filter((type) => typeof type === 'string' && !isSigi(type));

  if (nonSigiTypes.length > 0) {
    return getRandomItem(nonSigiTypes);
  }

  return '시기';
};
