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
TIMETABLE_PATH = Path(__file__).resolve().parent.parent / "database" / "timetable.json"
_AGE_KEYWORDS: set[str] | None = None
_TIMETABLE_LOOKUP: dict[str, object] | None = None
ROYAL_TITLE_SUFFIXES = {"마립간", "이사금", "차차웅", "거서간"}
_BCE_TOKEN = "기원전"


def _load_timetable_lookup() -> dict[str, object]:
    global _TIMETABLE_LOOKUP
    if _TIMETABLE_LOOKUP is not None:
        return _TIMETABLE_LOOKUP
    if not TIMETABLE_PATH.exists():
        raise FileNotFoundError(f"연표 설정 파일을 찾을 수 없습니다: {TIMETABLE_PATH}")
    try:
        payload = json.loads(TIMETABLE_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:  # pragma: no cover - defensive
        raise ValueError(f"{TIMETABLE_PATH} 파싱 실패: {exc}") from exc
    lookup = _build_timetable_lookup(payload)
    _TIMETABLE_LOOKUP = lookup
    return lookup


def _load_age_keywords() -> set[str]:
    global _AGE_KEYWORDS
    if _AGE_KEYWORDS is not None:
        return _AGE_KEYWORDS
    age_list_path = Path(__file__).resolve().parent.parent / "database" / "age-list.json"
    if not age_list_path.exists():
        raise FileNotFoundError(f"나이 목록 파일을 찾을 수 없습니다: {age_list_path}")
    try:
        ages = json.loads(age_list_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"{age_list_path} 파싱 실패: {exc}") from exc
    if not isinstance(ages, list):
        raise ValueError(f"{age_list_path} 내 배열이 필요합니다.")
    entries = {str(item).strip() for item in ages if str(item).strip()}
    _AGE_KEYWORDS = entries
    return entries


def _build_timetable_lookup(payload: object) -> dict[str, object]:
    if not isinstance(payload, list):
        raise ValueError("timetable.json 최상위는 배열이어야 합니다.")
    group_aliases: dict[str, str] = {}
    group_list_map: dict[tuple[str, str], tuple[str, str]] = {}
    government_only_map: dict[str, tuple[str, str]] = {}
    group_age_map: dict[tuple[str, str], tuple[str, str]] = {}
    age_tokens: set[str] = set()
    prehistoric_map: dict[str, tuple[str, str]] = {}
    for epic_entry in payload:
        if not isinstance(epic_entry, dict):
            continue
        epic_name = str(epic_entry.get("epic", "")).strip()
        groups = epic_entry.get("group")
        if not isinstance(groups, list):
            continue
        for group in groups:
            if not isinstance(group, dict):
                continue
            item = str(group.get("item", "")).strip()
            if not item:
                continue
            alias_candidates = [item]
            aka_values = group.get("aka")
            if isinstance(aka_values, list):
                alias_candidates.extend(
                    str(alias).strip() for alias in aka_values if str(alias).strip()
                )
            for alias in alias_candidates:
                existing = group_aliases.get(alias)
                if existing and existing != item:
                    raise ValueError(
                        f"group '{alias}' 가 두 개의 항목({existing}, {item})에 중복 정의되어 있습니다."
                    )
                group_aliases[alias] = item
            if epic_name == "선사시대" and item in {"구석기", "신석기", "청동기", "철기"}:
                prehistoric_map[item] = ("선사시대", item)

            _register_group_lists(
                item,
                group.get("list"),
                group_list_map,
                special_map=government_only_map if item == "대한민국" else None,
            )
            periods = group.get("period")
            if not isinstance(periods, list):
                continue
            for period in periods:
                if not isinstance(period, dict):
                    continue
                age_value = str(period.get("age", "")).strip()
                if age_value:
                    _add_age_token(age_tokens, age_value)
                    period_list = period.get("list")
                    if not period_list:
                        group_age_map[(item, age_value)] = (item, age_value)
                else:
                    period_list = period.get("list")
                aka_entries = period.get("aka")
                if isinstance(aka_entries, list):
                    for alias in aka_entries:
                        alias_text = str(alias).strip()
                        if alias_text:
                            _add_age_token(age_tokens, alias_text)
                _register_group_lists(
                    item,
                    period_list,
                    group_list_map,
                    special_map=government_only_map if item == "대한민국" else None,
                )
    # add commonly used age tokens that may not be explicitly declared
    age_tokens.update({"상대", "중대", "하대", "전기", "후기", "중기", "말기"})
    return {
        "group_aliases": group_aliases,
        "group_list_map": group_list_map,
        "government_only_map": government_only_map,
        "group_age_map": group_age_map,
        "age_tokens": age_tokens,
        "prehistoric_map": prehistoric_map,
    }


def _register_group_lists(
    group_name: str,
    entries: object,
    dest: dict[tuple[str, str], tuple[str, str]],
    *,
    special_map: dict[str, tuple[str, str]] | None = None,
) -> None:
    if not isinstance(entries, list):
        return
    for item in entries:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name", "")).strip()
        if not name:
            continue
        dest[(group_name, name)] = (group_name, name)
        if special_map is not None:
            special_map[name] = (group_name, name)


def _add_age_token(container: set[str], value: str) -> None:
    container.add(value)
    for segment in value.split():
        segment_value = segment.strip()
        if segment_value:
            container.add(segment_value)


def _resolve_timetable_label(time_value: str) -> tuple[str, str]:
    lookup = _load_timetable_lookup()
    payload = str(time_value).strip()
    if not payload:
        raise ValueError("빈 time_value 는 timetable 매핑이 필요 없습니다.")
    prehistoric = lookup["prehistoric_map"]
    if payload in prehistoric:
        return prehistoric[payload]
    governments = lookup["government_only_map"]
    if payload in governments:
        return governments[payload]
    tokens = payload.split()
    if not tokens:
        raise ValueError(f"times '{time_value}' 는 유효한 형식이 아닙니다.")
    group_alias = tokens[0]
    group_aliases = lookup["group_aliases"]
    canonical_group = group_aliases.get(group_alias)
    if not canonical_group:
        raise ValueError(
            f"times '{time_value}' 에 해당하는 group('{group_alias}') 을 timetable.json에서 찾을 수 없습니다."
        )
    if len(tokens) == 1:
        return canonical_group, ""
    age_specific = lookup["group_age_map"].get((canonical_group, tokens[1]))
    if len(tokens) == 2 and age_specific:
        return age_specific
    age_tokens = lookup["age_tokens"]
    name_tokens = [token for token in tokens[1:] if token not in age_tokens]
    if not name_tokens:
        return canonical_group, ""
    group_list_map = lookup["group_list_map"]
    full_name = " ".join(name_tokens)
    match = group_list_map.get((canonical_group, full_name))
    if match:
        return match
    suffix = name_tokens[-1]
    if suffix in ROYAL_TITLE_SUFFIXES:
        raise ValueError(
            f"times '{time_value}' 는 왕호('{suffix}')와 함께 표기되었으나 timetable.json 에 '{full_name}' 항목이 없습니다."
        )
    if (canonical_group, suffix) in group_list_map:
        return group_list_map[(canonical_group, suffix)]
    raise ValueError(
        f"times '{time_value}' 는 timetable.json 항목과 매칭되지 않습니다."
    )


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
    special_time, start_offset = _extract_goryeo_jeongjong(detail)
    if special_time:
        years = _validate_year_segment(_extract_year_segment(detail, start_offset=start_offset))
        return special_time, years
    bce_index = detail.find(_BCE_TOKEN)
    if bce_index != -1:
        times = detail[:bce_index].strip()
        years = _validate_year_segment(detail[bce_index:].strip())
        return times, years
    match = DIGIT_PATTERN.search(detail)
    if not match:
        return detail, ""
    times = detail[: match.start()].strip()
    years = _validate_year_segment(detail[match.start():].strip())
    return times, years


def _extract_year_segment(detail: str, *, start_offset: int = 0) -> str:
    match = DIGIT_PATTERN.search(detail, start_offset)
    if not match:
        return ""
    prefix_start = detail.rfind(_BCE_TOKEN, 0, match.start())
    if prefix_start != -1:
        candidate = detail[prefix_start:].strip()
        trimmed = re.sub(r"[)\]\.,]+$", "", candidate).strip()
        return trimmed
    return detail[match.start():].strip()


def _extract_goryeo_jeongjong(detail: str) -> tuple[str, int]:
    """Handle the Goryeo Jeongjong special-case rules."""
    if "고려" not in detail or "정종" not in detail:
        return "", 0
    if "10대_정종" in detail:
        idx = detail.index("10대_정종") + len("10대_정종")
        return "고려 10대_정종", idx
    return "고려 정종", 0


def _validate_year_segment(years: str) -> str:
    disallowed_tokens = {"정종", "10대_정종"}
    for token in disallowed_tokens:
        if token and token in years:
            raise ValueError(f"years '{years}' 에 허용되지 않은 문자열({token})이 포함되어 있습니다.")
    return years


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


def _strip_bce_token(value: str) -> str:
    if not value:
        return ""
    cleaned = value.strip()
    return " ".join(cleaned.split())


def rebuild_event_table(db_path: Path) -> None:
    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        ensure_table(cur, "events")
        valid_times = _load_age_keywords()
        cur.execute(
            """
            SELECT id,
                   type,
                   passage_result,
                   passage_result_detail,
                   option_result,
                   option_result_detail,
                   answer,
                   y_check
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
            session_y_check,
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
                        session_y_check=session_y_check,
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
                        session_y_check=session_y_check,
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
                    t_group,
                    t_item,
                    years,
                    y_check,
                    score,
                    type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    f"e{index:04d}",
                    keyword,
                    json.dumps(sorted(data["ref_ids"]), ensure_ascii=False),
                    json.dumps(sorted(data["q_ref_ids"]), ensure_ascii=False),
                    json.dumps(data["times"], ensure_ascii=False),
                    json.dumps(data["t_groups"], ensure_ascii=False),
                    json.dumps(data["t_items"], ensure_ascii=False),
                    data["years"],
                    data["y_check"],
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
    session_y_check: str | None,
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
    session_flag = "true" if str(session_y_check).strip().lower() == "true" else ""
    entry = store.get(keyword)
    if entry is None:
        entry = {
            "times": [],
            "t_groups": [],
            "t_items": [],
            "year_type": year_type,
            "year_prefix": year_prefix,
            "years": normalized_year,
            "y_check": session_flag,
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
    if session_flag == "true":
        entry["y_check"] = "true"
    if times:
        cleaned_times = _strip_bce_token(times)
        normalized_time = _canonicalize_time_label(cleaned_times, valid_times)
        t_group, t_item = _resolve_timetable_label(cleaned_times)
        _merge_time_value(entry, normalized_time, t_group, t_item)
    if q_ref_id:
        entry["q_ref_ids"].add(q_ref_id)
    if ref_id:
        entry["ref_ids"].add(ref_id)
    entry["scores"].append(int(score_value))
    if session_type:
        entry["types"].add(session_type)


def _merge_time_value(
    entry: dict[str, object], new_value: str, group_label: str, item_label: str
) -> None:
    times: list[str] = entry["times"]
    groups: list[str] = entry["t_groups"]
    items: list[str] = entry["t_items"]
    for idx, (existing_group, existing_item) in enumerate(zip(groups, items)):
        if existing_group == group_label and existing_item == item_label:
            return
    for idx, current in enumerate(times):
        if new_value == current:
            if groups[idx] != group_label or items[idx] != item_label:
                raise ValueError(
                    f"times '{new_value}' 의 t_group/t_item 정보가 일관되지 않습니다."
                )
            return
        if new_value in current and len(new_value) < len(current):
            return
    removal_indexes = [
        index
        for index, current in enumerate(times)
        if current in new_value and len(current) < len(new_value)
    ]
    for removal_index in reversed(removal_indexes):
        times.pop(removal_index)
        groups.pop(removal_index)
        items.pop(removal_index)
    times.append(new_value)
    groups.append(group_label)
    items.append(item_label)


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
