export interface Keyword {
  id: string;
  keyword: string;
  descriptions: string[];
  ref_id: string[];
  q_ref_id: string[];
  types: string[];
  score: Array<string | number>;
}
