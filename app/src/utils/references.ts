export const mergeReferenceIds = (
  refIds: string[] = [],
  qRefIds: string[] = []
): string[] => {
  const merged = [...(refIds || []), ...(qRefIds || [])];
  return Array.from(new Set(merged.filter(Boolean)));
};

export const formatReferenceEntry = (entry: string): string => {
  if (!entry) {
    return "";
  }
  const padded = entry.padStart(4, "0");
  const first = padded.slice(0, 2);
  const last = padded.slice(2);
  return `${first} - ${last}`;
};
