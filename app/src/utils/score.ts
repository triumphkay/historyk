import texts from "../../assets/texts.json";

export const getScoreFrequencyLabel = (
  scores: Array<number | string> = []
): string | null => {
  if (!Array.isArray(scores) || scores.length === 0) {
    return null;
  }

  const total = scores.reduce<number>((sum, value) => {
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(numeric)) {
      return sum + numeric;
    }
    return sum;
  }, 0);

  if (total <= 0) {
    return null;
  }

  if (total < 5) {
    return texts.componentContents.prioprityLow;
  }
  if (total < 10) {
    return texts.componentContents.prioprityNormal;
  }
  if (total < 20) {
    return texts.componentContents.prioprityHigh;
  }
  return texts.componentContents.prioprityVeryHigh;
};
