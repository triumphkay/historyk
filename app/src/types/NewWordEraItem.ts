export interface NewWordEraItem {
  id: string;
  keyword: string;
  ref_id: string[];
  q_ref_id: string[];
  types: string[];
  scores: Array<string | number>;
  era: string[];
  sub_era: string[];
  det_era: string[];
  years: string;
  years_check: string;
  era_script: string[];
}
