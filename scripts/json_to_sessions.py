#!/usr/bin/env python3
"""Convert problem JSON files into the sessions table."""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
from pathlib import Path
from typing import Iterable, List


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


def ensure_sessions_schema(cur: sqlite3.Cursor) -> None:
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'")
    table_exists = cur.fetchone() is not None

    if table_exists:
        cur.execute("PRAGMA table_info(sessions)")
        columns = {row[1] for row in cur.fetchall()}
        required = {
            "id",
            "session",
            "number",
            "y_check",
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
                y_check TEXT NOT NULL DEFAULT '',
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


_LEADING_MARKERS: tuple[re.Pattern[str], ...] = (
    re.compile(r"^\s*\([가-힣]\)\s*"),
    re.compile(r"^\s*[ㄱ-ㅎ][\).．･:]*\s*"),
    re.compile(r"^\s*[㉠-㉿]\s*"),
)

_SQUARE_BRACKET_PATTERN = re.compile(r"\[(.*?)\]")


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


def split_dash_entries(
    entries,
) -> tuple[list[str], list[str], list[str], list[list[str]]]:
    if not entries:
        return [], [], [], []
    left_parts: list[str] = []
    right_parts: list[str] = []
    detail_parts: list[str] = []
    detail_segments: list[list[str]] = []
    for entry in entries:
        if isinstance(entry, str):
            normalized = strip_leading_marker(entry)
            if "-" in normalized:
                left, right = normalized.split("-", 1)
                left_parts.append(left.strip())
                cleaned_right = right.strip()
                segments = extract_parenthetical_segments(cleaned_right)
                right_parts.append(remove_parenthetical_segments(cleaned_right))
                cleaned_segments = [seg.strip() for seg in segments if seg.strip()]
                detail_parts.append(" ".join(cleaned_segments) if cleaned_segments else "")
                detail_segments.append(cleaned_segments)
            else:
                cleaned_entry = normalized.strip()
                left_parts.append(cleaned_entry)
                right_parts.append("")
                segments = extract_parenthetical_segments(cleaned_entry)
                cleaned_segments = [seg.strip() for seg in segments if seg.strip()]
                detail_parts.append(" ".join(cleaned_segments) if cleaned_segments else "")
                detail_segments.append(cleaned_segments)
        else:
            left_parts.append(json.dumps(entry, ensure_ascii=False))
            right_parts.append("")
            detail_parts.append("")
            detail_segments.append([])
    return left_parts, right_parts, detail_parts, detail_segments


def process_analysis_entries(left_entries: list[str], right_entries: list[str]) -> list:
    result: list = []
    for idx, left in enumerate(left_entries):
        value = left.strip()
        match = _SQUARE_BRACKET_PATTERN.search(value)
        if match:
            content = match.group(1).strip()
            result.append(content if content else "")
            continue
        keyword = right_entries[idx].strip() if idx < len(right_entries) else ""
        if value.replace(" ", "") == keyword.replace(" ", ""):
            result.append("")
        else:
            result.append(value)
    return result


def upsert_problem(cur: sqlite3.Cursor, file_name: str, row: dict, fallback_number: int) -> None:
    number = resolve_number(row.get("number"), fallback_number)
    session = derive_session(file_name)
    problem_id = build_problem_id(session, number)
    form = row.get("form")
    if isinstance(form, (list, dict)):
        form = json.dumps(form, ensure_ascii=False)
    y_check = "true" if row.get("years") is True else ""
    passage_analyze = row.get("passage-analyze")
    analyze = row.get("analyze")
    (
        passage_left,
        passage_right,
        passage_detail,
        passage_detail_segments,
    ) = split_dash_entries(passage_analyze)
    (
        option_left,
        option_right,
        option_detail,
        option_detail_segments,
    ) = split_dash_entries(analyze)
    if len(passage_left) != len(passage_right):
        raise ValueError(
            f"{file_name} 문제 {row.get('number')}의 passage-analyze 좌/우 항목 수가 다릅니다."
        )
    if len(option_left) != len(option_right):
        raise ValueError(
            f"{file_name} 문제 {row.get('number')}의 analyze 좌/우 항목 수가 다릅니다."
        )
    processed_passage_left = process_analysis_entries(passage_left, passage_right)
    processed_option_left = process_analysis_entries(option_left, option_right)
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
            y_check,
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            problem_id,
            session,
            number,
            form,
            row.get("score"),
            row.get("question"),
            row.get("type"),
            y_check,
            json.dumps(row.get("passage"), ensure_ascii=False),
            json.dumps(processed_passage_left, ensure_ascii=False),
            json.dumps(passage_right, ensure_ascii=False),
            json.dumps(passage_detail, ensure_ascii=False),
            json.dumps(row.get("options"), ensure_ascii=False),
            json.dumps(analyze, ensure_ascii=False),
            json.dumps(processed_option_left, ensure_ascii=False),
            json.dumps(option_right, ensure_ascii=False),
            json.dumps(option_detail, ensure_ascii=False),
            row.get("answer"),
        ),
    )


def process_files(cur: sqlite3.Cursor, files: Iterable[Path]) -> tuple[int, int]:
    total_files = 0
    total_rows = 0
    for path in files:
        rows = read_json(path)
        total_files += 1
        for idx, row in enumerate(rows, start=1):
            upsert_problem(cur, path.name, row, fallback_number=idx)
            total_rows += 1
    return total_files, total_rows


def main() -> None:
    parser = argparse.ArgumentParser(description="Load session data into SQLite")
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
        ensure_sessions_schema(cur)
        # Always start with a clean sessions table
        cur.execute("DELETE FROM sessions")
        files = list(detect_files(args.input, "data/composition/*.json"))
        if not files:
            raise SystemExit("No JSON files found to process.")
        processed_files, inserted_rows = process_files(cur, files)
        conn.commit()
        print(
            f"Processed {processed_files} files, inserted {inserted_rows} rows into {db_path}."
        )
    finally:
        conn.close()


if __name__ == "__main__":
    main()
