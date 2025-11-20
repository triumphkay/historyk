export const shuffle = <T>(input: T[] = []): T[] => {
  const clone = [...input];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
};

export const pickRandomItems = <T>(array: T[] = [], count = 1): T[] => {
  if (!Array.isArray(array) || array.length === 0) {
    return [];
  }
  return shuffle(array).slice(0, Math.min(count, array.length));
};

export const getRandomItem = <T>(array: T[] = []): T | null => {
  if (!Array.isArray(array) || array.length === 0) {
    return null;
  }
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};
