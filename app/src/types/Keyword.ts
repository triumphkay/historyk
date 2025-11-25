export interface Keyword {
  id: string;
  keyword: string;
  descriptions: string[];
  ref_id: string[];
  q_ref_id: string[];
  types: string[];
  score: Array<string | number>;
  era?: string[];
  sub_era?: string[];
  det_era?: string[];
  years?: string;
  era_script?: string[];
}
