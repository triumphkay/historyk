export const normalizeTypeString = (typeString = ''): string => typeString.toString().trim().toLowerCase().replace(/\s+/g, '');

// Only match exact "시기" type, not compound types like "사건-시기"
export const isSigi = (typeString = ''): boolean => {
  const normalized = normalizeTypeString(typeString);
  return normalized === '시기';
};

export const pickDisplayType = (types: string[] = []): string | null => {
  if (!Array.isArray(types) || types.length === 0) {
    return null;
  }

  // Load type metadata to check age property
  const typeMetadata = require('../../assets/keyword-types.json');
  const typeDetails = (typeMetadata as { 'type-set': Array<{ title: string; age?: boolean }> })['type-set'] || [];
  
  // Create a map of type titles to their age property
  const ageTypeMap = new Map<string, boolean>();
  typeDetails.forEach((detail) => {
    if (detail.title) {
      ageTypeMap.set(detail.title, detail.age === true);
    }
  });

  // Filter out "시기" type
  const nonSigiTypes = types.filter((type) => typeof type === 'string' && !isSigi(type));

  if (nonSigiTypes.length === 0) {
    return '시기';
  }

  // First, try to find a non-age type
  const firstNonAgeType = nonSigiTypes.find((type) => !ageTypeMap.get(type));
  
  if (firstNonAgeType) {
    return firstNonAgeType;
  }

  // If all are age types, return the first one
  return nonSigiTypes[0];
};
