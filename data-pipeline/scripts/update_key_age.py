import json
import sqlite3
from collections import defaultdict
from pathlib import Path

# Allowed nations that can be attached to parsed entries.
ALLOWED_NATIONS = {
    "고구려",
    "고려",
    "조선",
    "신라",
    "후백제",
    "고조선",
    "대한민국",
    "대한제국",
    "미군정기",
    "발해",
    "백제",
    "일제강점기",
    "후고구려",
}

DB_PATH = Path("database/korean-history.db")
KEY_AGE_PATH = Path("../app/assets/key-timeline.json")
TIMELINE_HISTORY_PATH = Path("database/ref-timeline.json")


def _build_age_index():
    if not TIMELINE_HISTORY_PATH.exists():
        raise FileNotFoundError(f"타임라인 파일을 찾을 수 없습니다: {TIMELINE_HISTORY_PATH}")
    try:
        ages = json.loads(TIMELINE_HISTORY_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"{TIMELINE_HISTORY_PATH} 파싱 실패: {exc}")
    if not isinstance(ages, list):
        raise ValueError(f"{TIMELINE_HISTORY_PATH} 내 배열이 필요합니다.")
    
    order = []
    index = {}
    for idx, value in enumerate(ages):
        normalized = str(value).strip()
        order.append(normalized)
        if normalized and normalized not in index:
            index[normalized] = idx
    return order, index


def _find_nation_position(nation: str, ages: list[str]) -> int:
    # Find the first occurrence of the nation in the timeline
    for idx, value in enumerate(ages):
        if value == nation or value.startswith(f"{nation} "):
            return idx
    # If not found, return a large number to put it at the end
    return len(ages)


def _find_matching_age_index(nation: str, entry: str, age_index: dict[str, int], ages: list[str]) -> int:
    # Try exact match first
    label = f"{nation} {entry}"
    if label in age_index:
        return age_index[label]
    
    # Try finding an entry that starts with nation and ends with entry
    # e.g. nation="고려", entry="광종" -> matches "고려 전기 광종"
    # e.g. nation="대한민국", entry="이승만 정부" -> matches "대한민국 1공화국 이승만 정부"
    
    # Special case for 대한민국 rulers which might have "정부" suffix
    search_entry = entry
    
    for age_label, idx in age_index.items():
        if age_label.startswith(nation) and age_label.endswith(search_entry):
            return idx
            
    # If still not found, try without "정부" suffix if present
    if search_entry.endswith(" 정부"):
        search_entry_no_gov = search_entry[:-3]
        for age_label, idx in age_index.items():
            if age_label.startswith(nation) and age_label.endswith(search_entry_no_gov):
                return idx

    raise ValueError(f"ref-timeline.json에서 '{nation}'의 '{entry}'에 해당하는 항목을 찾을 수 없습니다.")


# ... (previous constants)
KEY_AGE_JSON_PATH = Path("../app/assets/key-age.json")

# ...

def load_key_age_json():
    """Load key-age.json to get sub_era order."""
    if not KEY_AGE_JSON_PATH.exists():
        return {}
    try:
        data = json.loads(KEY_AGE_JSON_PATH.read_text(encoding="utf-8"))
        # Transform into a dict: {nation: [sub_eras]}
        result = {}
        for item in data:
            result[item["nation"]] = item.get("periods", [])
        return result
    except Exception as e:
        print(f"[Warning] Failed to load key-age.json: {e}")
        return {}

def _find_matching_sub_era_index(nation: str, entry: str, sub_era_map: dict) -> int | None:
    """Find index of entry in sub_era list for a nation."""
    if nation not in sub_era_map:
        return None
    
    sub_eras = sub_era_map[nation]
    try:
        return sub_eras.index(entry)
    except ValueError:
        return None

def _sort_entries_by_age(
    nation: str, entries: list[str], age_index: dict[str, int], ages: list[str], sub_era_map: dict
) -> list[str]:
    indexed_entries = []
    seen = set()
    
    # Calculate offset for sub_era indices to keep them valid but distinct from timeline indices (if needed)
    # But actually, simpler is: if sub_era match found, use it (0-100). 
    # Global timeline has 1500+ items. 
    # We should rely on hierarchy. But for simple sorting list within a nation, 
    # we just need a key.
    
    for entry in entries:
        normalized_entry = entry.strip()
        if not normalized_entry:
            continue
        if normalized_entry in seen:
            continue
            
        # Try finding in sub_era map first (Prioritize sub_era ordering)
        sub_era_idx = _find_matching_sub_era_index(nation, normalized_entry, sub_era_map)
        
        if sub_era_idx is not None:
            # Found in sub_era list. 
            # Use a tuple key: (0, sub_era_idx) to prioritize over timeline matches if any mixture
            indexed_entries.append(((0, sub_era_idx), normalized_entry))
            seen.add(normalized_entry)
            continue

        try:
            idx = _find_matching_age_index(nation, normalized_entry, age_index, ages)
            # Use tuple key: (1, idx) for timeline matches
            indexed_entries.append(((1, idx), normalized_entry))
            seen.add(normalized_entry)
        except ValueError:
            # If not found in timeline, we might want to skip or append at the end.
            # For now, let's print a warning and skip to avoid breaking execution
            print(f"[Warning] '{nation} {normalized_entry}' not found in timeline. Skipping.")
            continue

    indexed_entries.sort(key=lambda item: item[0])
    return [entry for _, entry in indexed_entries]


def collect_nation_entries():
    """Read the newwords table and build the nation/list mapping."""
    conn = sqlite3.connect(DB_PATH)
    try:
        # Fetch era, sub_era, and det_era columns
        cursor = conn.execute("SELECT era, sub_era, det_era FROM newwords")
        nation_lists = defaultdict(list)
        nations_seen = set()  # Track all nations we've encountered
        
        for era_json, sub_era_json, det_era_json in cursor:
            if not era_json:
                continue
            
            try:
                eras = json.loads(era_json)
                sub_eras = json.loads(sub_era_json) if sub_era_json else []
                det_eras = json.loads(det_era_json) if det_era_json else []
            except json.JSONDecodeError:
                continue
                
            if not isinstance(eras, list):
                continue
            
            # Pad sub_eras and det_eras to match eras length if needed
            while len(sub_eras) < len(eras): sub_eras.append("")
            while len(det_eras) < len(eras): det_eras.append("")
                
            # Zip them to process pairs
            for nation, sub, detail in zip(eras, sub_eras, det_eras):
                if not nation:
                    continue
                
                nation = nation.strip()
                
                if nation not in ALLOWED_NATIONS:
                    continue
                
                # Track that we've seen this nation
                nations_seen.add(nation)
                
                # Determine what to use as the list item
                # Priority: det_era -> sub_era
                final_detail = detail.strip() if detail else ""
                
                # If det_era is empty but sub_era exists, use sub_era
                # This ensures nations like "일제강점기" get populated with "무단통치기", etc.
                if not final_detail and sub:
                    final_detail = sub.strip()
                
                if final_detail:
                    nation_lists[nation].append(final_detail)
        
        # Ensure all seen nations are in the dict, even if they have no details
        for nation in nations_seen:
            if nation not in nation_lists:
                nation_lists[nation] = []
                
        return nation_lists
    finally:
        conn.close()


def update_key_age_file(nation_lists):
    """Create key-timeline.json with sorted entries."""
    ages, age_index = _build_age_index()
    sub_era_map = load_key_age_json()

    ordered_entries = []
    for nation, entries in nation_lists.items():
        nation_position = _find_nation_position(nation, ages)
        
        if entries:
            sorted_entries = _sort_entries_by_age(nation, entries, age_index, ages, sub_era_map)
        else:
            sorted_entries = []
        
        # Include nation even if it has no entries
        ordered_entries.append((nation_position, {"nation": nation, "list": sorted_entries}))

    ordered_entries.sort(key=lambda item: item[0])
    key_age = [entry for _, entry in ordered_entries]

    with KEY_AGE_PATH.open("w", encoding="utf-8") as fh:
        json.dump(key_age, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    
    print(f"Generated {KEY_AGE_PATH} with {len(key_age)} nations.")


def main():
    nation_lists = collect_nation_entries()
    update_key_age_file(nation_lists)


if __name__ == "__main__":
    main()
