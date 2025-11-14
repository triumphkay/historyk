#!/usr/bin/env python3
"""Rebuild the events table from sessions data using custom rules."""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
from pathlib import Path

from session_keyword_utils import ensure_table


ALLOWED_TYPES = {
    "군사조직-시기",
    "문화재-시기",
    "사건-시기",
    "제도-시기",
}

DIGIT_PATTERN = re.compile(r"\d")
YEAR_PREFIX_PATTERN = re.compile(r"^(\d{1,4})년")
BCE_PATTERN = re.compile(r"^(기원전\s*\d+년|기원전\s*\d+세기)")
CONFIG_PATH = Path(__file__).resolve().parent.parent / "database" / "keyword-types.json"
_AGE_KEYWORDS: set[str] | None = None


def _load_age_keywords() -> set[str]:
    global _AGE_KEYWORDS
    if _AGE_KEYWORDS is not None:
        return _AGE_KEYWORDS
    if not CONFIG_PATH.exists():
        raise FileNotFoundError(f"키워드 설정 파일을 찾을 수 없습니다: {CONFIG_PATH}")
    try:
        payload = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"{CONFIG_PATH} 파싱 실패: {exc}") from exc
    ages = payload.get("ages")
    if not isinstance(ages, list):
        raise ValueError(f"{CONFIG_PATH} 내 'ages' 배열이 필요합니다.")
    entries = {str(item).strip() for item in ages if str(item).strip()}
    _AGE_KEYWORDS = entries
    return entries


def _parse_json_array(payload: str | None, *, context: str) -> list:
    if not payload:
        return []
    try:
        data = json.loads(payload)
    except json.JSONDecodeError as exc:  # pragma: no cover - defensive
        raise ValueError(f"{context} 필드를 JSON으로 파싱할 수 없습니다.") from exc
    if not isinstance(data, list):
        raise ValueError(f"{context} 필드는 배열이어야 합니다.")
    return data


def _split_time_year(detail: str | None) -> tuple[str, str]:
    if not detail:
        return "", ""
    detail = str(detail).strip()
    match = DIGIT_PATTERN.search(detail)
    if not match:
        return detail, ""
    times = detail[: match.start()].strip()
    years = detail[match.start():].strip()
    return times, years


def _normalize_years(years: str | None) -> tuple[str, str, str]:
    if not years:
        return "", "", ""
    years = years.strip()
    bce_match = BCE_PATTERN.match(years)
    if bce_match:
        return "BCE", years, years
    prefix_match = YEAR_PREFIX_PATTERN.match(years)
    if prefix_match:
        prefix = prefix_match.group(1)
        return "AD", prefix, years
    return "", "", years


def rebuild_event_table(db_path: Path) -> None:
    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        ensure_table(cur, "events")
        valid_times = _load_age_keywords()
        cur.execute(
            """
            SELECT id, type, passage_result, passage_result_detail,
                   option_result, option_result_detail, answer
            FROM sessions
            ORDER BY id
            """
        )
        entries: dict[str, dict[str, object]] = {}
        for (
            session_id,
            question_type,
            passage_result,
            passage_detail,
            option_result,
            option_detail,
            answer,
        ) in cur.fetchall():
            session_id = str(session_id)
            session_type = str(question_type).strip() if question_type else ""
            if session_type not in ALLOWED_TYPES:
                continue

            passage_items = _parse_json_array(
                passage_result, context=f"{session_id} passage_result"
            )
            passage_detail_items = _parse_json_array(
                passage_detail, context=f"{session_id} passage_result_detail"
            )
            if len(passage_items) != len(passage_detail_items):
                raise ValueError(
                    f"{session_id}: passage_result 길이({len(passage_items)})와 detail 길이({len(passage_detail_items)})가 다릅니다."
                )
            option_items = _parse_json_array(
                option_result, context=f"{session_id} option_result"
            )
            option_detail_items = _parse_json_array(
                option_detail, context=f"{session_id} option_result_detail"
            )
            if len(option_items) != len(option_detail_items):
                raise ValueError(
                    f"{session_id}: option_result 길이({len(option_items)})와 detail 길이({len(option_detail_items)})가 다릅니다."
                )

            for keyword_raw, detail_text in zip(passage_items, passage_detail_items):
                if not keyword_raw:
                    continue
                times, years = _split_time_year(detail_text)
                for keyword in _split_keywords(keyword_raw):
                    _upsert_event_entry(
                        entries,
                        keyword,
                        times,
                        years,
                        q_ref_id=session_id,
                        ref_id=None,
                        score_value=3,
                        valid_times=valid_times,
                        session_type=session_type,
                    )

            correct_idx: int | None = None
            try:
                if answer is not None:
                    correct_idx = int(answer)
            except (ValueError, TypeError):
                correct_idx = None
            fixed_length = len(option_items)
            for idx, (keyword_raw, detail_text) in enumerate(
                zip(option_items, option_detail_items), start=1
            ):
                if not keyword_raw:
                    continue
                times, years = _split_time_year(detail_text)
                if fixed_length == 5 and correct_idx is not None and idx == correct_idx:
                    score_value = 2
                else:
                    score_value = 1
                for keyword in _split_keywords(keyword_raw):
                    _upsert_event_entry(
                        entries,
                        keyword,
                        times,
                        years,
                        q_ref_id=None,
                        ref_id=session_id,
                        score_value=score_value,
                        valid_times=valid_times,
                        session_type=session_type,
                    )

        cur.execute("DELETE FROM events")
        for index, keyword in enumerate(sorted(entries.keys()), start=1):
            data = entries[keyword]
            cur.execute(
                """
                INSERT INTO events (
                    id,
                    keyword,
                    ref_id,
                    q_ref_id,
                    times,
                    years,
                    score,
                    type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    f"e{index:04d}",
                    keyword,
                    json.dumps(sorted(data["ref_ids"]), ensure_ascii=False),
                    json.dumps(sorted(data["q_ref_ids"]), ensure_ascii=False),
                    json.dumps(data["times"], ensure_ascii=False),
                    data["years"],
                    json.dumps(data["scores"], ensure_ascii=False),
                    json.dumps(sorted(data["types"]), ensure_ascii=False),
                ),
            )
        conn.commit()
        print(f"Rebuilt events table with {len(entries)} entries in {db_path}.")
    finally:
        conn.close()


def _upsert_event_entry(
    store: dict[str, dict[str, object]],
    keyword: str,
    times: str,
    years: str,
    *,
    q_ref_id: str | None,
    ref_id: str | None,
    score_value: int,
    valid_times: set[str],
    session_type: str,
) -> None:
    keyword = str(keyword).strip()
    if not keyword:
        return
    year_type, year_prefix, normalized_year = _normalize_years(years)
    entry = store.get(keyword)
    if entry is None:
        entry = {
            "times": [],
            "year_type": year_type,
            "year_prefix": year_prefix,
            "years": normalized_year,
            "ref_ids": set(),
            "q_ref_ids": set(),
            "scores": [],
            "types": set(),
        }
        store[keyword] = entry
    else:
        existing_type = entry.get("year_type", "")
        if year_type and existing_type and year_type != existing_type:
            raise ValueError(
                f"{keyword}: years 불일치 ({existing_type}:{entry['years']} vs {year_type}:{normalized_year})"
            )
        if not existing_type and year_type:
            entry["year_type"] = year_type
        if year_type == "BCE":
            existing_years = entry["years"]
            if existing_years and existing_years != normalized_year:
                raise ValueError(
                    f"{keyword}: years 불일치 ({existing_years} vs {normalized_year})"
                )
            if not existing_years:
                entry["years"] = normalized_year
        elif year_type == "AD":
            existing_prefix = entry.get("year_prefix", "")
            if existing_prefix and year_prefix and existing_prefix != year_prefix:
                raise ValueError(
                    f"{keyword}: years 불일치 ({entry['years']} vs {normalized_year})"
                )
            if not existing_prefix and year_prefix:
                entry["year_prefix"] = year_prefix
            existing_full = entry["years"]
            if not existing_full or len(normalized_year) > len(existing_full):
                entry["years"] = normalized_year
        else:
            # year_type empty; treat literal
            existing_years = entry["years"]
            if normalized_year:
                if existing_years and existing_years != normalized_year:
                    raise ValueError(
                        f"{keyword}: years 불일치 ({existing_years} vs {normalized_year})"
                    )
                if not existing_years:
                    entry["years"] = normalized_year
    if times:
        normalized_time = _canonicalize_time_label(times, valid_times)
        _merge_time_value(entry["times"], normalized_time)
    if q_ref_id:
        entry["q_ref_ids"].add(q_ref_id)
    if ref_id:
        entry["ref_ids"].add(ref_id)
    entry["scores"].append(int(score_value))
    if session_type:
        entry["types"].add(session_type)


def _merge_time_value(existing: list[str], new_value: str) -> None:
    for current in existing:
        if new_value == current:
            return
        if new_value in current and len(new_value) < len(current):
            return
    to_remove = [current for current in existing if current in new_value and len(current) < len(new_value)]
    for item in to_remove:
        existing.remove(item)
    existing.append(new_value)


def _canonicalize_time_label(raw: str, valid_times: set[str]) -> str:
    candidate = raw.strip()
    candidates = [candidate]
    cleaned = candidate.replace("기원전", " ").strip()
    if cleaned and cleaned != candidate:
        candidates.append(cleaned)
    for base in candidates:
        if base in valid_times:
            return base
        tokens = base.split()
        for length in range(len(tokens) - 1, 0, -1):
            prefix = " ".join(tokens[:length])
            if prefix in valid_times:
                return prefix
    raise ValueError(f"times '{raw}' 가 age-keywords.txt에 없습니다.")


def _split_keywords(raw: str) -> list[str]:
    return [segment.strip() for segment in str(raw).split(",") if segment.strip()]


def main() -> None:
    parser = argparse.ArgumentParser(description="Rebuild event table from sessions")
    parser.add_argument(
        "--db",
        default="composition.db",
        help="SQLite database path (default: composition.db)",
    )
    args = parser.parse_args()
    rebuild_event_table(Path(args.db))


if __name__ == "__main__":
    main()
