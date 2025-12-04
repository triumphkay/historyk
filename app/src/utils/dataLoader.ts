import keywordTypes from "../../assets/keyword-types.json";
import newWordsData from "../../assets/data.json";
import { TypeDetail } from "../types/TypeDetail";
import { NewWord } from "../types/NewWord";

export const loadNewWordData = async (): Promise<NewWord[]> => {
  return newWordsData as NewWord[];
};

export const loadTypeDetails = (): TypeDetail[] => {
  const details = (keywordTypes as { "type-set": TypeDetail[] })["type-set"];
  return details || [];
};
