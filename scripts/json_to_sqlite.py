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
from typing import Callable, Iterable, List, Tuple


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
            question_ref_id TEXT NOT NULL,
            types TEXT NOT NULL,
            times TEXT NOT NULL,
            years TEXT NOT NULL,
            scores TEXT NOT NULL
        )
        """
    )
    cur.execute("PRAGMA table_info(keywords)")
    keyword_columns = {row[1] for row in cur.fetchall()}
    if "types" not in keyword_columns:
        cur.execute("ALTER TABLE keywords ADD COLUMN types TEXT NOT NULL DEFAULT '[]'")
    if "question_ref_id" not in keyword_columns:
        cur.execute("ALTER TABLE keywords ADD COLUMN question_ref_id TEXT NOT NULL DEFAULT '[]'")
    if "times" not in keyword_columns:
        cur.execute("ALTER TABLE keywords ADD COLUMN times TEXT NOT NULL DEFAULT '[]'")
    if "years" not in keyword_columns:
        cur.execute("ALTER TABLE keywords ADD COLUMN years TEXT NOT NULL DEFAULT '[]'")
    if "scores" not in keyword_columns:
        cur.execute("ALTER TABLE keywords ADD COLUMN scores TEXT NOT NULL DEFAULT '[]'")


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
_YEAR_KR_PATTERN = re.compile(
    r"(?P<bc>기원전\s*)?(?P<year>\d{1,4})\s*년(?:\s*(?P<month>\d{1,2})\s*월(?:\s*(?P<day>\d{1,2})\s*일)?)?"
)
_YEAR_DOT_PATTERN = re.compile(
    r"(?P<bc>기원전\s*)?(?P<year>\d{1,4})\.(?P<month>\d{1,2})(?:\.(?P<day>\d{1,2}))?"
)
_CENTURY_PATTERN = re.compile(
    r"(?P<century>(?:(?:기원전|BC)\s*)?\d+\s*세기)"
)
_TIME_KEYWORDS = (
    "조선",
    "고려",
    "신라",
    "통일신라",
    "고구려",
    "백제",
    "가야",
    "부여",
    "발해",
    "삼국",
    "대한제국",
    "대한민국",
    "일제강점기",
    "광복 이후",
    "광복이후",
    "미군정기",
    "정부",
    "왕",
    "황제",
    "황후",
    "대왕",
    "후기",
    "전기",
    "중기",
    "초기",
    "말기",
    "시대",
    "세기",
    "시기",
    "연간",
    "정권",
    "통치기",
    "왕조",
    "송",
    "원",
    "명",
    "청",
)


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


def _extract_years(text: str) -> tuple[list[str], str]:
    years: list[str] = []

    def handle_match(match: re.Match[str]) -> str:
        segment = match.group(0).strip()
        if segment:
            years.append(segment)
        return " "

    cleaned = _YEAR_KR_PATTERN.sub(handle_match, text)

    def handle_dot_match(match: re.Match[str]) -> str:
        segment = match.group(0).strip()
        if segment:
            years.append(segment)
        return " "

    cleaned = _YEAR_DOT_PATTERN.sub(handle_dot_match, cleaned)

    def handle_century(match: re.Match[str]) -> str:
        century = match.group("century")
        if century:
            years.append(century.strip())
        return " "

    cleaned = _CENTURY_PATTERN.sub(handle_century, cleaned)
    return years, cleaned


def _looks_like_time_descriptor(text: str) -> bool:
    if not text:
        return False
    if any("가" <= ch <= "힣" for ch in text):
        return True
    return any(keyword in text for keyword in _TIME_KEYWORDS)


def parse_time_metadata(detail_segments: list[str]) -> tuple[set[str], set[str]]:
    times: set[str] = set()
    years: set[str] = set()
    for segment in detail_segments:
        segment = segment.strip()
        if not segment:
            continue
        extracted_years, remainder = _extract_years(segment)
        years.update(extracted_years)
        remainder = " ".join(remainder.replace("(", " ").replace(")", " ").split())
        remainder = remainder.strip(",.; ")
        if remainder and _looks_like_time_descriptor(remainder):
            times.add(remainder)
    return times, years


def is_period_type(question_type: str | None) -> bool:
    if not question_type:
        return False
    question_type = question_type.strip()
    return question_type == "시기" or question_type.endswith("-시기")


def _normalize_descriptor(text: str) -> str:
    return "".join(text.split())


def _tokenize_descriptor(text: str) -> list[str]:
    return [token.strip() for token in text.split() if token.strip()]


def _tokens_subset(tokens_a: list[str], tokens_b: list[str]) -> bool:
    if not tokens_a:
        return False
    if not tokens_b:
        return False
    return all(token in tokens_b for token in tokens_a)


def merge_time_descriptors(existing: set[str], candidates: set[str]) -> set[str]:
    result = set(existing)
    for candidate in sorted(candidates, key=len):
        cand_norm = _normalize_descriptor(candidate)
        cand_tokens = _tokenize_descriptor(candidate)
        if not cand_norm:
            continue
        skip = False
        to_remove: set[str] = set()
        for current in result:
            current_norm = _normalize_descriptor(current)
            current_tokens = _tokenize_descriptor(current)
            if not current_norm:
                to_remove.add(current)
                continue
            same_or_subset = False
            if cand_norm == current_norm or cand_norm in current_norm:
                same_or_subset = True
            elif _tokens_subset(cand_tokens, current_tokens):
                same_or_subset = True
            if same_or_subset:
                skip = True
                break
            if current_norm in cand_norm or _tokens_subset(current_tokens, cand_tokens):
                to_remove.add(current)
        if skip:
            continue
        if to_remove:
            result.difference_update(to_remove)
        result.add(candidate)
    return result


def merge_year_descriptors(existing: set[str], candidates: set[str]) -> set[str]:
    result = set(existing)
    for candidate in sorted(candidates, key=len):
        cand_clean = candidate.strip()
        cand_norm = _normalize_descriptor(cand_clean)
        if not cand_norm:
            continue
        skip = False
        to_remove: set[str] = set()
        for current in result:
            current_norm = _normalize_descriptor(current)
            if not current_norm:
                to_remove.add(current)
                continue
            if cand_norm == current_norm or cand_norm in current_norm:
                skip = True
                break
            if current_norm in cand_norm:
                to_remove.add(current)
        if skip:
            continue
        if to_remove:
            result.difference_update(to_remove)
        result.add(cand_clean)
    return result


def collect_keywords(
    keyword_map: dict[str, dict[str, set[str]]],
    session: str,
    number: int,
    passage_left: list[str],
    passage_right: list[str],
    option_left: list[str],
    option_right: list[str],
    passage_detail_segments: list[list[str]],
    option_detail_segments: list[list[str]],
    question_type: str | None,
    answer_value_raw,
) -> None:
    ref_id = f"{session}{number:02d}"

    def process_pair(
        left_entries: list[str],
        right_entries: list[str],
        detail_segments: list[list[str]],
        *,
        is_passage: bool,
        score_provider: Callable[[int], int],
    ) -> None:
        for idx, (left, right, detail_segment) in enumerate(
            zip(left_entries, right_entries, detail_segments)
        ):
            if not right:
                continue
            for keyword in split_keywords(right):
                keyword_segments = extract_parenthetical_segments(keyword)
                keyword = remove_parenthetical_segments(keyword)
                keyword = normalize_age_keyword(keyword)
                if not keyword:
                    continue
                left_clean = strip_leading_marker(left)
                descriptions = derive_descriptions(left_clean)
                bucket = keyword_map.setdefault(
                    keyword,
                    {
                        "ref_ids": set(),
                        "question_ref_ids": set(),
                        "descriptions": set(),
                        "types": set(),
                        "times": set(),
                        "years": set(),
                        "scores": [],
                    },
                )
                if is_passage:
                    bucket["question_ref_ids"].add(ref_id)
                else:
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
                if is_period_type(question_type):
                    segment_source = keyword_segments if keyword_segments else detail_segment
                    times, years = parse_time_metadata(segment_source)
                    if times:
                        bucket["times"] = merge_time_descriptors(bucket["times"], times)
                    if years:
                        bucket["years"] = merge_year_descriptors(bucket["years"], years)
                bucket["scores"].append(score_provider(idx))

    answer_value: int | None = None
    try:
        if answer_value_raw is not None:
            answer_value = int(answer_value_raw)
    except (ValueError, TypeError):
        answer_value = None

    process_pair(
        passage_left,
        passage_right,
        passage_detail_segments,
        is_passage=True,
        score_provider=lambda _idx: 3,
    )
    process_pair(
        option_left,
        option_right,
        option_detail_segments,
        is_passage=False,
        score_provider=lambda idx: 2
        if answer_value is not None and (idx + 1) == answer_value
        else 1,
    )


def generate_keyword_id(used_ids: set[str]) -> str:
    for candidate in range(1, 10000):
        formatted = f"{candidate:04d}"
        if formatted not in used_ids:
            used_ids.add(formatted)
            return formatted
    raise RuntimeError("Unable to allocate new keyword id; exhausted 4-digit space.")


def upsert_keywords(cur: sqlite3.Cursor, keyword_map: dict[str, dict[str, set[str]]]) -> None:
    if not keyword_map:
        cur.execute("DELETE FROM keywords")
        return

    cur.execute("DELETE FROM keywords")
    used_ids: set[str] = set()

    for keyword in sorted(keyword_map.keys()):
        data = keyword_map[keyword]
        descriptions = json.dumps(sorted(data["descriptions"]), ensure_ascii=False)
        ref_ids = json.dumps(sorted(data["ref_ids"]), ensure_ascii=False)
        question_ref_ids = json.dumps(
            sorted(data.get("question_ref_ids", set())), ensure_ascii=False
        )
        types = json.dumps(sorted(data["types"]), ensure_ascii=False)
        times = json.dumps(sorted(data.get("times", set())), ensure_ascii=False)
        years = json.dumps(sorted(data.get("years", set())), ensure_ascii=False)
        scores = json.dumps(data.get("scores", []), ensure_ascii=False)
        keyword_id = generate_keyword_id(used_ids)
        cur.execute(
            """
            INSERT INTO keywords (
                id,
                keyword,
                descriptions,
                ref_id,
                question_ref_id,
                types,
                times,
                years,
                scores
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                keyword_id,
                keyword,
                descriptions,
                ref_ids,
                question_ref_ids,
                types,
                times,
                years,
                scores,
            ),
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
        "passage_detail_segments": passage_detail_segments,
        "option_left": option_left,
        "option_right": option_right,
        "option_detail_segments": option_detail_segments,
        "question_type": row.get("type"),
        "answer": row.get("answer"),
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
                problem_context["passage_detail_segments"],
                problem_context["option_detail_segments"],
                problem_context["question_type"],
                problem_context["answer"],
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


_AGE_KEYWORD_MAP: dict[str, str] | None = None


def normalize_age_keyword(keyword: str) -> str:
    global _AGE_KEYWORD_MAP
    if _AGE_KEYWORD_MAP is None:
        _AGE_KEYWORD_MAP = {}
        age_file = Path(__file__).resolve().parent.parent / "database" / "age-keywords.txt"
        if age_file.exists():
            lines = [
                line.strip()
                for line in age_file.read_text(encoding="utf-8").splitlines()
                if line.strip()
            ]
            existing = set(lines)
            for line in lines:
                parts = line.split()
                if len(parts) >= 3:
                    canonical = " ".join([parts[0]] + parts[2:])
                    if canonical in existing:
                        _AGE_KEYWORD_MAP[line] = canonical
    if not keyword:
        return keyword
    return _AGE_KEYWORD_MAP.get(keyword, keyword) if _AGE_KEYWORD_MAP else keyword


if __name__ == "__main__":
    main()
