import keywordTypes from "../../assets/keyword-types.json";
import newWordsData from "../../assets/data.json";
import { TypeDetail } from "../types/TypeDetail";
import { NewWord } from "../types/NewWord";

export const loadNewWordData = async (): Promise<NewWord[]> => {
  const data = newWordsData as any;
  if (data.items && Array.isArray(data.items)) {
    return data.items as NewWord[];
  }
  return data as NewWord[];
};

export const loadTypeDetails = (): TypeDetail[] => {
  const details = (keywordTypes as { "type-set": TypeDetail[] })["type-set"];
  return details || [];
};
