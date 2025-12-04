export interface EventItem {
  id: number;
  keyword: string;
  ref_id: number[];
  q_ref_id: number[];
  times: [string, string];
  t_group: string[];
  t_item: string[];
  years: string;
  y_check: string;
  score: number[];
  types: string[];
}
