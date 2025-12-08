import texts from "../../assets/texts.json";

export const parseYearParts = (years: string) => {
  if (!years || !years.trim()) {
    return {
      year: null as string | null,
      month: null as string | null,
      day: null as string | null,
    };
  }
  // const yearMatch = years.match(/(\d{3,4})년/);
  // const monthMatch = years.match(/(\d{1,2})월/);
  // const dayMatch = years.match(/(\d{1,2})일/);

  const yearMatch = years.match(
    new RegExp(`(\\d{3,4})${texts.timelinedQuiz.year}}`)
  );
  const monthMatch = years.match(
    new RegExp(`(\\d{1,2})${texts.timelinedQuiz.month}}`)
  );
  const dayMatch = years.match(
    new RegExp(`(\\d{1,2})${texts.timelinedQuiz.day}}`)
  );
  return {
    year: yearMatch ? yearMatch[1] : null,
    month: monthMatch ? monthMatch[1].padStart(2, "0") : null,
    day: dayMatch ? dayMatch[1].padStart(2, "0") : null,
  };
};

export { mergeReferenceIds, formatReferenceEntry } from "./references";
