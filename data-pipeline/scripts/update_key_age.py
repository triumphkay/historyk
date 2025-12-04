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


def _sort_entries_by_age(
    nation: str, entries: list[str], age_index: dict[str, int], ages: list[str]
) -> list[str]:
    indexed_entries = []
    seen = set()
    
    for entry in entries:
        normalized_entry = entry.strip()
        if not normalized_entry:
            continue
        if normalized_entry in seen:
            continue
            
        try:
            idx = _find_matching_age_index(nation, normalized_entry, age_index, ages)
            indexed_entries.append((idx, normalized_entry))
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
        # Fetch era and det_era columns
        cursor = conn.execute("SELECT era, det_era FROM newwords")
        nation_lists = defaultdict(list)
        
        for era_json, det_era_json in cursor:
            if not era_json or not det_era_json:
                continue
            
            try:
                eras = json.loads(era_json)
                det_eras = json.loads(det_era_json)
            except json.JSONDecodeError:
                continue
                
            if not isinstance(eras, list) or not isinstance(det_eras, list):
                continue
                
            # Zip them to process pairs
            for nation, detail in zip(eras, det_eras):
                if not nation or not detail:
                    continue
                
                nation = nation.strip()
                detail = detail.strip()
                
                if nation not in ALLOWED_NATIONS:
                    continue
                
                # Add to list
                nation_lists[nation].append(detail)
                
        return nation_lists
    finally:
        conn.close()


def update_key_age_file(nation_lists):
    """Create key-timeline.json with sorted entries."""
    ages, age_index = _build_age_index()

    ordered_entries = []
    for nation, entries in nation_lists.items():
        if not entries:
            continue
            
        nation_position = _find_nation_position(nation, ages)
        sorted_entries = _sort_entries_by_age(nation, entries, age_index, ages)
        
        if sorted_entries:
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
