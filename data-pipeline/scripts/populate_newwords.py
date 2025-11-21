#!/usr/bin/env python3
"""Populate the newwords table from sessions data."""

from __future__ import annotations

import json
import sqlite3
import re
from pathlib import Path
from collections import defaultdict

# Configuration
DB_PATH = "database/korean-history.db"
KEYWORD_TYPES_PATH = "database/keyword-types.json"
AGE_LIST_PATH = "database/age-list.json"

# Sub-eras heuristic list
SUB_ERAS = {
    "전기", "중기", "후기", "말기",
    "상대", "중대", "하대",
    "무신집권기", "원간섭기", "세도정치기", "개항기",
    "무단통치기", "문화통치기", "민족말살기"
}

def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def parse_era(text: str, age_list: list[str], key_age_map: dict, sub_eras: set[str]):
    # Find longest match
    best_match = ""
    for age in age_list:
        if text.startswith(age):
            if len(age) > len(best_match):
                best_match = age
    
    if not best_match:
        # Check special case: Republic of Korea rulers without '대한민국' prefix
        # key_age_map["대한민국"] contains list of rulers/govts
        kr_rulers = key_age_map.get("대한민국", [])
        for ruler in kr_rulers:
            if text.startswith(ruler):
                # Found a KR ruler
                if len(ruler) > len(best_match):
                    best_match = ruler
        
        if best_match:
            # It matched a KR ruler directly
            # Per instruction: det_era should be "OOO 정부" (full name), era "대한민국"
            return ("대한민국", "", best_match), text[len(best_match):].strip()
        
        # Check if text starts with a standalone sub_era (e.g., "하대", "전기")
        for sub_era_item in sub_eras:
            if text.startswith(sub_era_item):
                # Found standalone sub_era
                remaining = text[len(sub_era_item):].strip()
                return ("", sub_era_item, ""), remaining
            
        # Check for missing nation prefix (Point 2)
        for nation, rulers in key_age_map.items():
            if nation == "대한민국": continue
            for ruler in rulers:
                if text.startswith(ruler):
                    return None, f"MISSING_NATION_PREFIX: {ruler} (found in {nation})"
        
        # Point 1: Unknown Era
        return None, f"UNKNOWN_ERA: {text}"
    
    # Check if best_match itself is a KR ruler (e.g. "박정희 정부")
    kr_rulers = key_age_map.get("대한민국", [])
    if best_match in kr_rulers:
         return ("대한민국", "", best_match), text[len(best_match):].strip()

    remaining = text[len(best_match):].strip()
    parts = best_match.split()
    
    era = ""
    sub_era = ""
    det_era = ""
    
    # Identify Era (Nation)
    # key_age_map keys are Nations.
    # Check if the match starts with a known nation.
    # Some matches are just "Nation" (e.g. "고려")
    # Some are "Nation SubEra ..."
    
    found_nation = None
    for nation in key_age_map.keys():
        if best_match.startswith(nation):
            # Pick the longest nation name match (though usually they are distinct)
            if found_nation is None or len(nation) > len(found_nation):
                found_nation = nation
    
    if found_nation:
        era = found_nation
        # Remove nation from parts to process remainder
        # Be careful with split(). "고려 전기" -> ["고려", "전기"]
        # "대한민국 이승만 정부" -> ["대한민국", "이승만", "정부"]
        
        # Re-split the part AFTER the nation
        suffix = best_match[len(found_nation):].strip()
        others = suffix.split() if suffix else []
    else:
        # Fallback: First token is Era?
        # But we matched against age_list, so it should be valid.
        # If age_list has "가야", and "가야" is not in key_age_map keys?
        # We should probably trust the first token.
        era = parts[0]
        others = parts[1:]

    if others:
        if others[0] in sub_eras:
            sub_era = others[0]
            if len(others) > 1:
                det_era = " ".join(others[1:])
        else:
            det_era = " ".join(others)
            
    # Special handling for "정부" suffix (e.g. "이승만 정부")
    # If det_era ends with "정부", it implies Era is "대한민국"
    # And per instruction: det_era should contain the full government name
    if det_era.endswith("정부"):
        if not era or era == "대한민국":
            era = "대한민국"
        era = "대한민국"
        # We keep det_era as is (e.g. "이승만 정부")
            
    return (era, sub_era, det_era), remaining

class NewWordEntry:
    def __init__(self, id_val):
        self.id = id_val
        self.keyword = ""
        self.descriptions = set()
        self.ref_id = set()
        self.q_ref_id = set()
        self.types = set()
        self.scores = []
        self.era_tuples = []  # List of (era, sub_era, det_era) tuples
        self.years = ""
        self.years_check = ""
        self.era_script = set()

def main():
    repo_root = Path(__file__).resolve().parent.parent
    
    # Load Data
    keyword_types = load_json(repo_root / KEYWORD_TYPES_PATH)
    age_list = load_json(repo_root / AGE_LIST_PATH)
    
    times_keys = set(keyword_types.get("times-key", []))
    
    # Build key_age map for nation lookup
    key_age_data = keyword_types.get("key-age", [])
    key_age_map = {} # Nation -> List of Rulers
    for item in key_age_data:
        nation = item["nation"]
        rulers = item["list"]
        key_age_map[nation] = rulers

    # Connect DB
    conn = sqlite3.connect(repo_root / DB_PATH)
    cur = conn.cursor()
    
    # Fetch Sessions
    cur.execute("SELECT id, type, y_check, passage_result, passage_analyze, passage_result_detail, option_result, option_analyze, option_result_detail, answer FROM sessions")
    rows = cur.fetchall()
    
    # Cache: keyword -> NewWordEntry
    newwords_cache = {}
    id_counter = 1
    
    # Error collection
    errors = defaultdict(list)

    def update_years(entry, new_year, row_id, keyword):
        if not new_year:
            return
        
        if "UNKNOWN_ERA" in new_year:
            print(f"[CRITICAL DEBUG] UNKNOWN_ERA passed to update_years! ID: {row_id}, Keyword: {keyword}, Value: {new_year}")
            import traceback
            traceback.print_stack()

        current = entry.years
        if not current:
            entry.years = new_year
            return

        if current == new_year:
            return
            
        # Check containment (refinement)
        # If current is "1972년 10월" and new is "1972년" -> current contains new (roughly)
        # But strictly, "1972년" is a substring of "1972년 10월".
        # If new_year in current: keep current (it's more detailed or same)
        if new_year in current:
            return
            
        # If current in new_year: update to new (it's more detailed)
        if current in new_year:
            entry.years = new_year
            return
            
        # Conflict
        errors["YEAR_CONFLICT"].append(f"ID: {row_id}, Keyword: {keyword}, Current: {current}, New: {new_year}")

    def get_or_create_entry(kw):
        nonlocal id_counter
        if kw not in newwords_cache:
            new_id = f"n{id_counter:04d}"
            id_counter += 1
            entry = NewWordEntry(new_id)
            entry.keyword = kw
            newwords_cache[kw] = entry
        return newwords_cache[kw]

    def process_result_set(row_id, row_type, row_y_check, result_json, analyze_json, detail_json, answer_val=None, is_option=False):
        if not result_json:
            return
            
        try:
            results = json.loads(result_json)
            analyzes = json.loads(analyze_json)
            details = json.loads(detail_json)
        except (json.JSONDecodeError, TypeError):
            return

        # Ensure lists are same length or handle safely
        count = len(results)
        
        # Parse answer if needed
        parsed_answer = None
        if is_option and answer_val is not None:
            try:
                parsed_answer = int(answer_val)
            except (ValueError, TypeError):
                pass
        
        for i in range(count):
            raw_keyword_str = results[i]
            if not raw_keyword_str:
                continue
            
            # Split by comma if present
            raw_keywords = [k.strip() for k in raw_keyword_str.split(",") if k.strip()]
            
            for raw_keyword in raw_keywords:
                # 1. Keyword Processing
                final_keyword = raw_keyword
                script_to_add = None
                
                is_event_type = row_type in ("사건", "사건-시기")
                if is_event_type:
                    for tk in times_keys:
                        if raw_keyword.endswith(tk):
                            # Remove tk from end
                            final_keyword = raw_keyword[:-len(tk)].strip()
                            script_to_add = tk
                            break
                
                if not final_keyword:
                    continue

                # New Logic: Check for "Nation SubEra Ruler" pattern in keyword
                # parse_era returns ((era, sub, det), remaining) or (None, error_msg)
                parsed_kw, kw_info = parse_era(final_keyword, age_list, key_age_map, SUB_ERAS)
                extra_sub_era = None
                
                if parsed_kw:
                    p_era, p_sub, p_det = parsed_kw
                    # Check if exact match (no remaining text) and has all three components
                    if not kw_info and p_era and p_sub and p_det:
                        final_keyword = f"{p_era} {p_det}"
                        extra_sub_era = p_sub

                entry = get_or_create_entry(final_keyword)
                
                if script_to_add:
                    entry.era_script.add(script_to_add)
                
                if extra_sub_era:
                    # Add as tuple with the extracted sub_era
                    entry.era_tuples.append((p_era, extra_sub_era, p_det))
                
                # 2. Descriptions
                if i < len(analyzes) and analyzes[i]:
                    desc_parts = [p.strip() for p in analyzes[i].split(",") if p.strip()]
                    entry.descriptions.update(desc_parts)
                
                # 3. ref_id / q_ref_id
                if is_option:
                    entry.ref_id.add(row_id)
                else:
                    entry.q_ref_id.add(row_id)
                
                # 4. Scores
                if not is_option:
                    entry.scores.append("3")
                else:
                    # Option logic
                    # If count is not 5, always 1
                    if count != 5:
                        entry.scores.append("1")
                    else:
                        # If count is 5
                        # Check if answer is valid (1-5) and matches current index (0-based)
                        if parsed_answer is not None and 1 <= parsed_answer <= 5 and i == (parsed_answer - 1):
                            entry.scores.append("2")
                        else:
                            entry.scores.append("1")
                
                # 5. Types
                if row_type:
                    entry.types.add(row_type)
                
                # 6. Era/Time Logic
                if row_type and row_type.endswith("-시기"):
                    if i < len(details) and details[i]:
                        time_text = details[i]
                        parsed, info = parse_era(time_text, age_list, key_age_map, SUB_ERAS)
                        
                        if parsed:
                            p_era, p_sub, p_det = parsed
                            if final_keyword == "국민교육헌장":
                                print(f"[DEBUG] Keyword: {final_keyword}, Input: {time_text}, Parsed: {parsed}")
                            # Add as tuple to maintain relationship
                            era_tuple = (p_era or "", p_sub or "", p_det or "")
                            if era_tuple not in entry.era_tuples:
                                entry.era_tuples.append(era_tuple)
                            
                            # Recursively parse remaining text to extract pure year info
                            remaining_text = info
                            if final_keyword == "김지정의 난":
                                print(f"[DEBUG RECURSIVE] Initial remaining: '{remaining_text}'")
                            while remaining_text:
                                parsed_remaining, info_remaining = parse_era(remaining_text, age_list, key_age_map, SUB_ERAS)
                                if final_keyword == "김지정의 난":
                                    print(f"[DEBUG RECURSIVE] Parsed: {parsed_remaining}, Remaining: '{info_remaining}'")
                                if parsed_remaining:
                                    # Found more era info in remaining text
                                    r_era, r_sub, r_det = parsed_remaining
                                    era_tuple_r = (r_era or "", r_sub or "", r_det or "")
                                    if era_tuple_r not in entry.era_tuples:
                                        entry.era_tuples.append(era_tuple_r)
                                    remaining_text = info_remaining
                                else:
                                    # No more era info, this is the pure year
                                    break
                            
                            if final_keyword == "김지정의 난":
                                print(f"[DEBUG RECURSIVE] Final remaining for years: '{remaining_text}'")
                            
                            # Store only pure year info
                            if remaining_text:
                                update_years(entry, remaining_text, row_id, final_keyword)
                        else:
                            # info is error message
                            errors[info].append(f"ID: {row_id}, Keyword: {final_keyword}, Text: {time_text}")
                
                # 7. Years Check
                if row_y_check == "true":
                    entry.years_check = "true"

    for row in rows:
        (r_id, r_type, r_y_check, 
         p_res, p_an, p_det, 
         o_res, o_an, o_det, r_answer) = row
         
        # Process Passage (is_option=False)
        process_result_set(r_id, r_type, r_y_check, p_res, p_an, p_det, answer_val=r_answer, is_option=False)
        
        # Process Options (is_option=True)
        process_result_set(r_id, r_type, r_y_check, o_res, o_an, o_det, answer_val=r_answer, is_option=True)

    # Write to DB
    # Clear table first? The user said "korean-history.db의 테이블을 추가하고 싶다", 
    # and we created it. It should be empty. But safe to clear or replace.
    cur.execute("DELETE FROM newwords")
    
    insert_sql = """
    INSERT INTO newwords (
        id, keyword, descriptions, ref_id, q_ref_id, types, scores,
        era, sub_era, det_era, years, years_check, era_script
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    data_to_insert = []
    # Sort by ID to maintain order? ID is n0001...
    # The cache insertion order is preserved in Python 3.7+.
    # But we assigned IDs based on encounter order.
    
    for kw, entry in newwords_cache.items():
        # Convert era_tuples to parallel arrays
        era_list = [t[0] for t in entry.era_tuples]
        sub_era_list = [t[1] for t in entry.era_tuples]
        det_era_list = [t[2] for t in entry.era_tuples]
        
        data_to_insert.append((
            entry.id,
            entry.keyword,
            json.dumps(list(entry.descriptions), ensure_ascii=False),
            json.dumps(list(entry.ref_id), ensure_ascii=False),
            json.dumps(list(entry.q_ref_id), ensure_ascii=False),
            json.dumps(list(entry.types), ensure_ascii=False),
            json.dumps(entry.scores, ensure_ascii=False),
            json.dumps(era_list, ensure_ascii=False),
            json.dumps(sub_era_list, ensure_ascii=False),
            json.dumps(det_era_list, ensure_ascii=False),
            entry.years, # Store as string directly
            entry.years_check,
            json.dumps(list(entry.era_script), ensure_ascii=False)
        ))
        
    cur.executemany(insert_sql, data_to_insert)
    conn.commit()
    print(f"Inserted {len(data_to_insert)} rows into newwords.")
    conn.close()

    if errors:
        print("\n[WARNING] Found potential issues with Era parsing:")
        for err_type, items in errors.items():
            print(f"\n  {err_type}:")
            for item in items[:10]: # Show first 10
                print(f"    - {item}")
            if len(items) > 10:
                print(f"    ... and {len(items) - 10} more.")

if __name__ == "__main__":
    main()
