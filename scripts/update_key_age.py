import json
import sqlite3
from collections import defaultdict
from pathlib import Path

# Allowed nations that can be attached to parsed entries.
ALLOWED_NATIONS = {
    "고구려",
    "고려",
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

# Words that represent intermediate period markers that should be removed.
PERIOD_SUFFIXES = ("기", "시대", "후기", "전기")
PERIOD_WORDS = {"상대", "중대", "하대", "무신집권기"}

DB_PATH = Path("database/korean-history.db")
KEYWORD_TYPES_PATH = Path("database/keyword-types.json")


def is_period_word(word: str) -> bool:
    """Return True if word should be discarded as a period marker."""
    return word in PERIOD_WORDS or any(word.endswith(suffix) for suffix in PERIOD_SUFFIXES)


def parse_time_entry(entry: str):
    """
    Parse an individual time entry according to the provided rules.

    Returns:
        (nation, ruler_or_period) where ruler_or_period may be None for empty lists.
        None if the entry cannot be interpreted.
    """
    entry = entry.strip()
    if not entry:
        return None

    # Rule 4: Entries that end with "정부" always belong to 대한민국.
    if entry.endswith("정부"):
        return "대한민국", entry

    words = entry.split()
    if not words:
        return None

    nation = words[0]
    if nation not in ALLOWED_NATIONS:
        # Entire entry might be a recognized nation string even if it contains spaces.
        if entry in ALLOWED_NATIONS:
            return entry, None
        return None

    if len(words) == 1:
        # Rule 3/5: Standalone nation entry.
        return nation, None

    middle = words[1:-1]
    if middle and all(is_period_word(word) for word in middle):
        # Rule 2: Drop intermediate period markers, keep the final word only.
        return nation, words[-1]

    # Rule 1: Keep the remaining portion intact.
    remainder = " ".join(words[1:])
    return nation, remainder


def collect_nation_entries():
    """Read the events table and build the nation/list mapping."""
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.execute("SELECT times FROM events")
        nation_lists = defaultdict(list)
        nation_sets = defaultdict(set)
        for (times_text,) in cursor:
            if not times_text:
                continue
            try:
                entries = json.loads(times_text)
            except json.JSONDecodeError:
                continue
            if not isinstance(entries, list):
                continue
            for raw_entry in entries:
                if not isinstance(raw_entry, str):
                    continue
                parsed = parse_time_entry(raw_entry)
                if not parsed:
                    continue
                nation, name = parsed
                # Ensure nation is represented even if it has no list entries.
                nation_lists.setdefault(nation, [])
                if name is None:
                    continue
                if name in nation_sets[nation]:
                    continue
                nation_sets[nation].add(name)
                nation_lists[nation].append(name)
        return nation_lists
    finally:
        conn.close()


def update_keyword_types(nation_lists):
    """Update the key-age entry inside keyword-types.json."""
    with KEYWORD_TYPES_PATH.open(encoding="utf-8") as fh:
        keyword_data = json.load(fh)

    keyword_data.pop("key-age", None)

    key_age = [
        {"nation": nation, "list": entries}
        for nation, entries in sorted(nation_lists.items(), key=lambda item: item[0])
    ]

    keyword_data["key-age"] = key_age

    with KEYWORD_TYPES_PATH.open("w", encoding="utf-8") as fh:
        json.dump(keyword_data, fh, ensure_ascii=False, indent=2)
        fh.write("\n")


def main():
    nation_lists = collect_nation_entries()
    update_keyword_types(nation_lists)


if __name__ == "__main__":
    main()
