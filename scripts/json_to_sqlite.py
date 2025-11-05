#!/usr/bin/env python3
"""
Convert composition JSON files into a SQLite database.

Usage:
    python scripts/json_to_sqlite.py [--input data/composition/57.json] [--db composition.db]

If --input is omitted, all *.json files under data/composition are processed.
"""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
from pathlib import Path
from typing import Iterable, List, Tuple


def read_json(path: Path) -> List[dict]:
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def detect_files(input_arg: str | None, default_glob: str) -> Iterable[Path]:
    if input_arg:
        target = Path(input_arg)
        if target.is_dir():
            yield from sorted(target.glob("*.json"))
        else:
            yield target
    else:
        for file_path in sorted(Path().glob(default_glob)):
            yield file_path


def ensure_schema(cur: sqlite3.Cursor) -> None:
    cur.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'"
    )
    table_exists = cur.fetchone() is not None

    if table_exists:
        cur.execute("PRAGMA table_info(sessions)")
        columns = {row[1] for row in cur.fetchall()}
        required = {
            "id",
            "session",
            "number",
            "passage_analyze",
            "passage_result",
            "passage_result_detail",
            "option_analyze",
            "option_result",
            "option_result_detail",
        }
        if not required.issubset(columns):
            missing = ", ".join(sorted(required - columns))
            raise SystemExit(
                "Existing 'sessions' table is missing column(s): "
                f"{missing}. Please migrate or remove the current database before re-running."
            )
    else:
        cur.execute(
            """
            CREATE TABLE sessions (
                id TEXT NOT NULL PRIMARY KEY,
                session TEXT NOT NULL,
                number INTEGER,
                form TEXT,
                score INTEGER,
                question TEXT,
                type TEXT,
                passage TEXT,
                passage_analyze TEXT,
                passage_result TEXT,
                passage_result_detail TEXT,
                options TEXT,
                analyze TEXT,
                option_analyze TEXT,
                option_result TEXT,
                option_result_detail TEXT,
                answer INTEGER
            )
            """
        )
        cur.execute(
            """
            CREATE UNIQUE INDEX idx_sessions_session_number
            ON sessions(session, number)
            """
        )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS keywords (
            id TEXT NOT NULL PRIMARY KEY,
            keyword TEXT NOT NULL UNIQUE,
            descriptions TEXT NOT NULL,
            ref_id TEXT NOT NULL,
            types TEXT NOT NULL
        )
        """
    )
    cur.execute("PRAGMA table_info(keywords)")
    keyword_columns = {row[1] for row in cur.fetchall()}
    if "types" not in keyword_columns:
        cur.execute("ALTER TABLE keywords ADD COLUMN types TEXT NOT NULL DEFAULT '[]'")


def resolve_number(raw_number, fallback: int) -> int:
    if isinstance(raw_number, int):
        return raw_number
    if isinstance(raw_number, str):
        stripped = raw_number.strip()
        if stripped.isdigit():
            return int(stripped)
        try:
            return int(float(stripped))
        except ValueError:
            pass
    return int(fallback)


def derive_session(file_name: str) -> str:
    stem = Path(file_name).stem
    digits = "".join(ch for ch in stem if ch.isdigit())
    if not digits:
        raise ValueError(f"Unable to derive numeric value from file name '{file_name}'.")
    return digits[-2:].zfill(2)


def build_problem_id(session: str, number: int) -> str:
    prefix = session[-2:].zfill(2)
    suffix = f"{number:02d}"
    return f"{prefix}{suffix}"


def extract_parenthetical_segments(text: str) -> list[str]:
    if not text:
        return []
    segments: list[str] = []
    depth = 0
    current: list[str] = []
    for ch in text:
        if ch == "(":
            if depth == 0:
                current = []
            else:
                current.append(ch)
            depth += 1
        elif ch == ")":
            if depth == 0:
                continue
            depth -= 1
            if depth == 0:
                segments.append("".join(current).strip())
            else:
                current.append(ch)
        else:
            if depth > 0:
                current.append(ch)
    return segments


def remove_parenthetical_segments(text: str) -> str:
    if not text:
        return ""
    depth = 0
    result_chars: list[str] = []
    for ch in text:
        if ch == "(":
            depth += 1
        elif ch == ")":
            if depth > 0:
                depth -= 1
        else:
            if depth == 0:
                result_chars.append(ch)
    return "".join(result_chars).strip()


def split_dash_entries(entries) -> tuple[list[str], list[str], list[str]]:
    if not entries:
        return [], [], []
    left_parts: list[str] = []
    right_parts: list[str] = []
    detail_parts: list[str] = []
    for entry in entries:
        if isinstance(entry, str):
            normalized = strip_leading_marker(entry)
            if "-" in normalized:
                left, right = normalized.split("-", 1)
                left_parts.append(left.strip())
                cleaned_right = right.strip()
                segments = extract_parenthetical_segments(cleaned_right)
                right_parts.append(remove_parenthetical_segments(cleaned_right))
                detail_parts.append(" ".join(seg.strip() for seg in segments if seg) if segments else "")
            else:
                cleaned_entry = normalized.strip()
                left_parts.append(cleaned_entry)
                right_parts.append("")
                segments = extract_parenthetical_segments(cleaned_entry)
                detail_parts.append(" ".join(seg.strip() for seg in segments if seg) if segments else "")
        else:
            left_parts.append(json.dumps(entry, ensure_ascii=False))
            right_parts.append("")
            detail_parts.append("")
    return left_parts, right_parts, detail_parts


_LEADING_MARKERS: tuple[re.Pattern[str], ...] = (
    re.compile(r"^\s*\([가-힣]\)\s*"),
    re.compile(r"^\s*[ㄱ-ㅎ][\).．･:]*\s*"),
    re.compile(r"^\s*[㉠-㉿]\s*"),
)


def strip_leading_marker(text: str) -> str:
    cleaned = text
    changed = True
    while changed:
        changed = False
        for pattern in _LEADING_MARKERS:
            match = pattern.match(cleaned)
            if match:
                cleaned = cleaned[match.end() :]
                changed = True
                break
    return cleaned


_BRACKET_PATTERN = re.compile(r"\[([^\]]*)\]")


def derive_descriptions(text: str) -> list[str]:
    if not text:
        return []
    stripped = text.strip()
    matches = list(_BRACKET_PATTERN.finditer(stripped))
    has_bracket = bool(matches)
    segments: list[str] = []
    for match in matches:
        content = match.group(1).strip()
        if content:
            parts = [part.strip() for part in content.split(",")]
            segments.extend(part for part in parts if part)
    if segments:
        return segments
    if has_bracket:
        return []
    base = _BRACKET_PATTERN.sub("", stripped)
    return [part.strip() for part in base.split(",") if part.strip()]


def split_keywords(text: str) -> list[str]:
    if not text:
        return []
    return [segment.strip() for segment in text.split(",") if segment.strip()]


def collect_keywords(
    keyword_map: dict[str, dict[str, set[str]]],
    session: str,
    number: int,
    passage_left: list[str],
    passage_right: list[str],
    option_left: list[str],
    option_right: list[str],
    question_type: str | None,
) -> None:
    ref_id = f"{session}{number:02d}"

    def process_pair(left_entries: list[str], right_entries: list[str]) -> None:
        for left, right in zip(left_entries, right_entries):
            if not right:
                continue
            for keyword in split_keywords(right):
                left_clean = strip_leading_marker(left)
                descriptions = derive_descriptions(left_clean)
                bucket = keyword_map.setdefault(
                    keyword, {"ref_ids": set(), "descriptions": set(), "types": set()}
                )
                bucket["ref_ids"].add(ref_id)
                if descriptions:
                    normalized_keyword = keyword.replace(" ", "")
                    filtered = {
                        desc
                        for desc in descriptions
                        if desc.replace(" ", "") != normalized_keyword
                    }
                    if filtered:
                        bucket["descriptions"].update(filtered)
                if question_type:
                    bucket["types"].add(str(question_type))

    process_pair(passage_left, passage_right)
    process_pair(option_left, option_right)


def generate_keyword_id(used_ids: set[str]) -> str:
    for candidate in range(1, 10000):
        formatted = f"{candidate:04d}"
        if formatted not in used_ids:
            used_ids.add(formatted)
            return formatted
    raise RuntimeError("Unable to allocate new keyword id; exhausted 4-digit space.")


def upsert_keywords(cur: sqlite3.Cursor, keyword_map: dict[str, dict[str, set[str]]]) -> None:
    if not keyword_map:
        return

    cur.execute("SELECT id, keyword, descriptions, ref_id, types FROM keywords")
    existing_rows = {
        keyword: {
            "id": row_id,
            "descriptions": set(json.loads(descriptions) if descriptions else []),
            "ref_ids": set(json.loads(ref_ids) if ref_ids else []),
            "types": set(json.loads(types) if types else []),
        }
        for row_id, keyword, descriptions, ref_ids, types in cur.fetchall()
    }
    used_ids = {row["id"] for row in existing_rows.values()}

    for keyword, data in keyword_map.items():
        new_descriptions_set = data["descriptions"]
        new_ref_ids_set = data["ref_ids"]
        new_types_set = data["types"]
        normalized_keyword = keyword.replace(" ", "")

        if keyword in existing_rows:
            row = existing_rows[keyword]
            cleaned_existing_descriptions = {
                desc
                for desc in row["descriptions"]
                if desc.replace(" ", "") != normalized_keyword
            }
            merged_descriptions_set = cleaned_existing_descriptions.union(new_descriptions_set)
            merged_ref_ids_set = row["ref_ids"].union(new_ref_ids_set)
            merged_types_set = row["types"].union(new_types_set)
            if (
                merged_descriptions_set != row["descriptions"]
                or merged_ref_ids_set != row["ref_ids"]
                or merged_types_set != row["types"]
            ):
                cur.execute(
                    """
                    UPDATE keywords
                    SET descriptions = ?, ref_id = ?, types = ?
                    WHERE keyword = ?
                    """,
                    (
                        json.dumps(sorted(merged_descriptions_set), ensure_ascii=False),
                        json.dumps(sorted(merged_ref_ids_set), ensure_ascii=False),
                        json.dumps(sorted(merged_types_set), ensure_ascii=False),
                        keyword,
                    ),
                )
                row["descriptions"] = merged_descriptions_set
                row["ref_ids"] = merged_ref_ids_set
                row["types"] = merged_types_set
        else:
            keyword_id = generate_keyword_id(used_ids)
            cur.execute(
                """
                INSERT INTO keywords (id, keyword, descriptions, ref_id, types)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    keyword_id,
                    keyword,
                    json.dumps(sorted(new_descriptions_set), ensure_ascii=False),
                    json.dumps(sorted(new_ref_ids_set), ensure_ascii=False),
                    json.dumps(sorted(new_types_set), ensure_ascii=False),
                ),
            )
            existing_rows[keyword] = {
                "id": keyword_id,
                "descriptions": new_descriptions_set,
                "ref_ids": new_ref_ids_set,
                "types": new_types_set,
            }

    obsolete_keywords = set(existing_rows.keys()) - set(keyword_map.keys())
    if obsolete_keywords:
        cur.executemany(
            "DELETE FROM keywords WHERE keyword = ?",
            ((keyword,) for keyword in obsolete_keywords),
        )


def upsert_problem(
    cur: sqlite3.Cursor, file_name: str, row: dict, fallback_number: int
) -> dict:
    number = resolve_number(row.get("number"), fallback_number)
    session = derive_session(file_name)
    problem_id = build_problem_id(session, number)
    form = row.get("form")
    if isinstance(form, (list, dict)):
        form = json.dumps(form, ensure_ascii=False)
    passage_analyze = row.get("passage-analyze")
    analyze = row.get("analyze")
    passage_left, passage_right, passage_detail = split_dash_entries(passage_analyze)
    option_left, option_right, option_detail = split_dash_entries(analyze)
    try:
        cur.execute(
            """
            INSERT OR REPLACE INTO sessions (
                id,
                session,
                number,
                form,
                score,
                question,
                type,
                passage,
                passage_analyze,
                passage_result,
                passage_result_detail,
                options,
                analyze,
                option_analyze,
                option_result,
                option_result_detail,
                answer
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                problem_id,
                session,
                number,
                form,
                row.get("score"),
                row.get("question"),
                row.get("type"),
                json.dumps(row.get("passage"), ensure_ascii=False),
                json.dumps(passage_left, ensure_ascii=False),
                json.dumps(passage_right, ensure_ascii=False),
                json.dumps(passage_detail, ensure_ascii=False),
                json.dumps(row.get("options"), ensure_ascii=False),
                json.dumps(analyze, ensure_ascii=False),
                json.dumps(option_left, ensure_ascii=False),
                json.dumps(option_right, ensure_ascii=False),
                json.dumps(option_detail, ensure_ascii=False),
                row.get("answer"),
            ),
        )
    except sqlite3.InterfaceError as exc:  # pragma: no cover - diagnostic
        raise sqlite3.InterfaceError(
            f"Failed to insert {file_name} number={row.get('number')} "
            f"(resolved {number!r} type={type(number).__name__})"
        ) from exc
    return {
        "session": session,
        "number": number,
        "passage_left": passage_left,
        "passage_right": passage_right,
        "option_left": option_left,
        "option_right": option_right,
        "question_type": row.get("type"),
    }


def process_files(cur: sqlite3.Cursor, files: Iterable[Path]) -> Tuple[int, int, dict]:
    total_files = 0
    total_rows = 0
    keyword_map: dict[str, dict[str, set[str]]] = {}
    for path in files:
        rows = read_json(path)
        total_files += 1
        for idx, row in enumerate(rows, start=1):
            problem_context = upsert_problem(cur, path.name, row, fallback_number=idx)
            collect_keywords(
                keyword_map,
                problem_context["session"],
                problem_context["number"],
                problem_context["passage_left"],
                problem_context["passage_right"],
                problem_context["option_left"],
                problem_context["option_right"],
                problem_context["question_type"],
            )
            total_rows += 1
    return total_files, total_rows, keyword_map


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", help="JSON file or directory to convert")
    parser.add_argument(
        "--db",
        default="composition.db",
        help="SQLite database path (default: composition.db)",
    )
    args = parser.parse_args()

    db_path = Path(args.db)
    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        ensure_schema(cur)
        files = list(detect_files(args.input, "data/composition/*.json"))
        if not files:
            raise SystemExit("No JSON files found to process.")
        processed_files, inserted_rows, keyword_map = process_files(cur, files)
        upsert_keywords(cur, keyword_map)
        conn.commit()
        print(f"Processed {processed_files} files, inserted {inserted_rows} rows into {db_path}.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
