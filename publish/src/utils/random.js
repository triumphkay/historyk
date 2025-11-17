export const shuffle = (input = []) => {
  const clone = [...input];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
};

export const pickRandomItems = (array = [], count = 1) => {
  if (!Array.isArray(array) || !array.length) {
    return [];
  }
  return shuffle(array).slice(0, Math.min(count, array.length));
};

export const getRandomItem = (array = []) => {
  if (!Array.isArray(array) || !array.length) {
    return null;
  }
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};
