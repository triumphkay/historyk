export const getScoreFrequencyLabel = (scores: Array<number | string> = []): string | null => {
  if (!Array.isArray(scores) || scores.length === 0) {
    return null;
  }

  const total = scores.reduce<number>((sum, value) => {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(numeric)) {
      return sum + numeric;
    }
    return sum;
  }, 0);

  if (total <= 0) {
    return null;
  }

  if (total < 10) {
    return '낮음';
  }
  if (total < 20) {
    return '보통';
  }
  return '높음';
};
