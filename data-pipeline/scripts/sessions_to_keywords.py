#!/usr/bin/env python3
"""Rebuild keywords table from sessions according to custom rules."""

import json
import sqlite3
import sys
from pathlib import Path
from typing import Dict, List

DB_PATH = Path("database/korean-history.db")
CONFIG_PATH = Path("hardcodes/keyword-types.json")


def die(message: str) -> None:
    print(message, file=sys.stderr)
    sys.exit(1)


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        die(f"[ERROR] 설정 파일을 찾을 수 없습니다: {CONFIG_PATH}")
    try:
        return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        die(f"[ERROR] 설정 파일 파싱 실패: {exc}")


def ensure_schema(cur: sqlite3.Cursor) -> None:
    cur.execute("DROP TABLE IF EXISTS keywords")
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS keywords (
            id TEXT PRIMARY KEY,
            keyword TEXT NOT NULL,
            descriptions TEXT NOT NULL,
            ref_id TEXT NOT NULL,
            q_ref_id TEXT NOT NULL,
            types TEXT NOT NULL,
            score TEXT NOT NULL,
            age TEXT NOT NULL
        )
        """
    )


def parse_array(raw: str, session_id: str, field: str) -> List[str]:
    if raw is None:
        return []
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        die(f"[ERROR] session id={session_id}: {field} JSON 파싱 실패")
    if not isinstance(data, list):
        die(f"[ERROR] session id={session_id}: {field} 배열이 아닙니다")
    return data


def split_values(text: str) -> List[str]:
    if text is None:
        return []
    raw = str(text)
    parts = [segment.strip() for segment in raw.split(",") if segment.strip()]
    if not parts and raw.strip():
        parts.append(raw.strip())
    return parts


def normalize_description(text: str) -> str:
    return text.strip().rstrip(".").strip()


def add_descriptions(entry: dict, candidates: List[str], session_id: str) -> None:
    for candidate in candidates:
        candidate = candidate.strip()
        if not candidate:
            continue
        if candidate in entry["descriptions"]:
            continue
        normalized = normalize_description(candidate)
        for existing in entry["descriptions"]:
            if normalized == normalize_description(existing) and existing != candidate:
                die(
                    f"[ERROR] session id={session_id}: descriptions에 공백/마침표만 다른 중복 문자열이 존재합니다."
                )
        entry["descriptions"].append(candidate)


def add_unique(target: List[str], value: str) -> None:
    if value not in target:
        target.append(value)


def apply_times_suffix(keyword: str, session_type: str, config: dict, session_id: str) -> str:
    except_types = {item.strip() for item in config.get("except-types", []) if item.strip()}
    if session_type not in except_types:
        return keyword.strip()
    suffixes = [item.strip() for item in config.get("times-key", []) if item.strip()]
    trimmed = keyword.strip()
    for suffix in suffixes:
        if not suffix:
            continue
        if trimmed.endswith(" " + suffix):
            trimmed = trimmed[: -len(suffix)].rstrip()
            break
        if trimmed == suffix:
            die(f"[ERROR] session id={session_id}: times-key 제거 후 keyword가 비었습니다.")
    if not trimmed:
        die(f"[ERROR] session id={session_id}: times-key 제거 후 keyword가 비었습니다.")
    return trimmed


def apply_age_rule(keyword: str, config: dict, session_id: str, session_type: str) -> tuple[str, str]:
    if session_type != "시기":
        return keyword.strip(), ""
    age_list_path = Path("database/age-list.json")
    if not age_list_path.exists():
        die(f"[ERROR] 나이 목록 파일을 찾을 수 없습니다: {age_list_path}")
    try:
        ages_list = json.loads(age_list_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        die(f"[ERROR] {age_list_path} JSON 파싱 실패")
    ages = {item.strip() for item in ages_list if item.strip()}
    candidate = keyword.strip()
    if candidate not in ages:
        return candidate, ""
    tokens = candidate.split()
    if len(tokens) >= 3:
        new_keyword = f"{tokens[0]} {tokens[-1]}"
    else:
        new_keyword = candidate
    new_keyword = new_keyword.strip()
    if not new_keyword:
        die(f"[ERROR] session id={session_id}: age 규칙 적용 후 keyword가 비었습니다.")
    if new_keyword == candidate:
        return new_keyword, ""
    return new_keyword, candidate


def process_keyword(
    store: Dict[str, dict],
    keyword: str,
    session_id: str,
    descriptions: List[str],
    is_passage: bool,
    session_type: str,
    score_value: int,
    age_value: str,
) -> None:
    if not keyword:
        return
    entry = store.setdefault(
        keyword,
        {
            "descriptions": [],
            "ref_id": [],
            "q_ref_id": [],
            "types": [],
            "score": [],
            "age": "",
        },
    )
    add_descriptions(entry, descriptions, session_id)
    if is_passage:
        add_unique(entry["q_ref_id"], session_id)
    else:
        add_unique(entry["ref_id"], session_id)
    if session_type:
        add_unique(entry["types"], session_type)
    entry["score"].append(score_value)
    if age_value and len(age_value) > len(entry["age"]):
        entry["age"] = age_value


def clean_keywords(cur: sqlite3.Cursor, config: dict) -> None:
    except_types = {item.strip() for item in config.get("except-types", []) if item.strip()}
    if not except_types:
        return
    cur.execute("SELECT id, types, descriptions FROM keywords")
    for keyword_id, types_json, desc_json in cur.fetchall():
        try:
            types_list = json.loads(types_json) if types_json else []
            desc_list = json.loads(desc_json) if desc_json else []
        except json.JSONDecodeError:
            continue
        if desc_list:
            continue
        if not types_list:
            continue
        if all(type_name in except_types for type_name in types_list):
            cur.execute("DELETE FROM keywords WHERE id = ?", (keyword_id,))


def rebuild_keywords(db_path: Path) -> None:
    config = load_config()
    try:
        conn = sqlite3.connect(db_path)
    except sqlite3.Error as exc:
        die(f"[ERROR] DB 연결 실패: {exc}")
    try:
        cur = conn.cursor()
        ensure_schema(cur)
        cur.execute(
            "SELECT id, passage_result, option_result, passage_analyze, option_analyze, answer, type FROM sessions ORDER BY id"
        )
        sessions = cur.fetchall()
        keywords: Dict[str, dict] = {}
        next_id_counter = 1

        for row in sessions:
            session_id = row[0]
            passage_result = parse_array(row[1], session_id, "passage_result")
            option_result = parse_array(row[2], session_id, "option_result")
            passage_analyze = parse_array(row[3], session_id, "passage_analyze")
            option_analyze = parse_array(row[4], session_id, "option_analyze")
            answer = row[5]
            session_type = row[6].strip() if isinstance(row[6], str) else str(row[6]).strip() if row[6] is not None else ""

            if len(passage_result) != len(passage_analyze):
                die(f"[ERROR] session id={session_id}: passage_result length mismatch")
            if len(option_result) != len(option_analyze):
                die(f"[ERROR] session id={session_id}: option_result length mismatch")

            for idx, raw_keyword in enumerate(passage_result):
                descriptions = split_values(passage_analyze[idx] if idx < len(passage_analyze) else "")
                for keyword_raw in split_values(str(raw_keyword)):
                    keyword = apply_times_suffix(keyword_raw, session_type, config, session_id)
                    keyword, age_value = apply_age_rule(keyword, config, session_id, session_type)
                    process_keyword(
                        keywords,
                        keyword,
                        session_id,
                        descriptions,
                        True,
                        session_type,
                        3,
                        age_value,
                    )

            opt_len = len(option_result)
            for idx, raw_keyword in enumerate(option_result):
                descriptions = split_values(option_analyze[idx] if idx < len(option_analyze) else "")
                for keyword_raw in split_values(str(raw_keyword)):
                    keyword = apply_times_suffix(keyword_raw, session_type, config, session_id)
                    keyword, age_value = apply_age_rule(keyword, config, session_id, session_type)
                    score_val = 1
                    if opt_len == 5:
                        try:
                            if answer is not None and (idx + 1) == int(answer):
                                score_val = 2
                        except (ValueError, TypeError):
                            score_val = 1
                    process_keyword(
                        keywords,
                        keyword,
                        session_id,
                        descriptions,
                        False,
                        session_type,
                        score_val,
                        age_value,
                    )

        entries = sorted(keywords.items(), key=lambda item: item[0])
        for keyword, entry in entries:
            entry_id = f"k{next_id_counter:04d}"
            next_id_counter += 1
            cur.execute(
                """
                INSERT INTO keywords (id, keyword, descriptions, ref_id, q_ref_id, types, score, age)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    entry_id,
                    keyword,
                    json.dumps(entry["descriptions"], ensure_ascii=False),
                    json.dumps(entry["ref_id"], ensure_ascii=False),
                    json.dumps(entry["q_ref_id"], ensure_ascii=False),
                    json.dumps(entry["types"], ensure_ascii=False),
                    json.dumps(entry["score"], ensure_ascii=False),
                    entry["age"],
                ),
            )

        clean_keywords(cur, config)
        conn.commit()
    except sqlite3.Error as exc:
        conn.rollback()
        die(f"[ERROR] DB 작업 오류: {exc}")
    finally:
        conn.close()


def main() -> None:
    rebuild_keywords(DB_PATH)


if __name__ == "__main__":
    main()
