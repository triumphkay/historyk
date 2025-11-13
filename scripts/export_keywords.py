#!/usr/bin/env python3
"""
Export keywords table from korean-history database into a text file.

Usage:
    python scripts/export_keywords.py [--db database/korean-history.db] [--output database/keywords.txt]
"""

from __future__ import annotations

import argparse
import json
import locale
import sqlite3
from pathlib import Path
from typing import Iterable, Tuple


def fetch_table(
    conn: sqlite3.Connection,
    table: str,
) -> Iterable[Tuple[str, str, str, str, str, str, str, str]]:
    cur = conn.cursor()
    cur.execute(
        """
        SELECT keyword,
               descriptions,
               ref_id,
               question_ref_id,
               types,
               times,
               years,
               scores
        FROM %s
        """
        % table
    )
    return cur.fetchall()


def sort_keywords(
    rows: Iterable[Tuple[str, str, str, str, str, str, str, str]]
) -> list[Tuple[int, Tuple[str, str, str, str, str, str, str, str]]]:
    try:
        locale.setlocale(locale.LC_COLLATE, "ko_KR.UTF-8")
        key = locale.strxfrm
    except locale.Error:
        key = lambda value: value  # type: ignore[assignment]
    scored_rows = []
    for row in rows:
        score_total = calculate_score_sum(row[7])
        scored_rows.append((score_total, row))
    return sorted(scored_rows, key=lambda item: key(item[1][0]))


def normalize_list(value: str) -> list[str]:
    if not value:
        return []
    data = json.loads(value)
    if isinstance(data, list):
        return [str(item) for item in data if str(item)]
    if data in (None, ""):
        return []
    return [str(data)]


def extend_unique(target: list[str], items: Iterable[str]) -> None:
    existing = set(target)
    for item in items:
        if not item or item in existing:
            continue
        target.append(item)
        existing.add(item)


def build_all_keyword_entries(
    rows: Iterable[Tuple[int, Tuple[str, str, str, str, str, str, str, str]]]
) -> dict[str, dict[str, list[str]]]:
    entries: dict[str, dict[str, list[str]]] = {}

    def ensure_entry(keyword: str) -> dict[str, list[str]]:
        return entries.setdefault(
            keyword,
            {
                "descriptions": [],
                "types": [],
                "ref_ids": [],
            },
        )

    for _, (keyword, descriptions, ref_ids, question_ref_ids, types, *_rest) in rows:
        entry = ensure_entry(keyword)
        extend_unique(entry["descriptions"], normalize_list(descriptions))
        extend_unique(entry["types"], normalize_list(types))
        extend_unique(entry["ref_ids"], normalize_list(ref_ids))
        extend_unique(entry["ref_ids"], normalize_list(question_ref_ids))

    for _, (keyword, descriptions, ref_ids, question_ref_ids, types, *_rest) in rows:
        desc_list = normalize_list(descriptions)
        if not desc_list:
            continue
        ref_combined = normalize_list(ref_ids) + normalize_list(question_ref_ids)
        types_list = normalize_list(types)
        for desc in desc_list:
            entry = ensure_entry(desc)
            extend_unique(entry["descriptions"], [keyword])
            extend_unique(entry["types"], types_list)
            extend_unique(entry["ref_ids"], ref_combined)

    return entries


def calculate_score_sum(scores_json: str) -> int:
    total = 0
    if not scores_json:
        return total
    try:
        data = json.loads(scores_json)
    except json.JSONDecodeError:
        return total
    if isinstance(data, list):
        for item in data:
            try:
                total += int(item)
            except (ValueError, TypeError):
                continue
    return total


def format_line(keyword: str) -> str:
    return keyword


def write_output(
    rows: Iterable[Tuple[int, Tuple[str, str, str, str, str, str, str, str]]],
    output_path: Path,
) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as fh:
        for _score_total, (keyword, *_rest) in rows:
            fh.write(format_line(keyword) + "\n")


def write_all_keywords_output(
    rows: Iterable[Tuple[int, Tuple[str, str, str, str, str, str, str, str]]],
    output_path: Path,
    include_metadata: bool = False,
) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        locale.setlocale(locale.LC_COLLATE, "ko_KR.UTF-8")
        key = locale.strxfrm
    except locale.Error:
        key = lambda value: value  # type: ignore[assignment]

    entries = build_all_keyword_entries(rows)

    with output_path.open("w", encoding="utf-8") as fh:
        for keyword in sorted(entries.keys(), key=key):
            entry = entries[keyword]
            if include_metadata:
                types = ", ".join(entry["types"])
                suffix = f" ({types})" if types else ""
                refs = ", ".join(entry["ref_ids"])
                fh.write(f"{keyword}{suffix} - [{refs}]\n")
            else:
                fh.write(keyword + "\n")



def main() -> None:
    parser = argparse.ArgumentParser(description="Export keywords table to a text file.")
    parser.add_argument(
        "--db",
        default="database/korean-history.db",
        help="Path to SQLite database (default: database/korean-history.db)",
    )
    parser.add_argument(
        "--output",
        default="database/keywords.txt",
        help="Output text file path (default: database/keywords.txt)",
    )
    parser.add_argument(
        "--all-output",
        help="Optional all-keywords output path (includes description-derived keywords)",
    )
    parser.add_argument(
        "--all-without-period-output",
        help="Optional output path excluding '사건-시기' keywords",
    )
    parser.add_argument(
        "--period-output",
        help="Optional output path including only '사건-시기' keywords",
    )
    parser.add_argument(
        "--non-period-output",
        help="Optional output path excluding '사건-시기' keywords (keywords format)",
    )
    args = parser.parse_args()

    db_path = Path(args.db)
    if not db_path.exists():
        raise SystemExit(f"Database not found: {db_path}")

    conn = sqlite3.connect(db_path)
    try:
        rows = fetch_table(conn, "keywords")
        sorted_rows = sort_keywords(rows)
    finally:
        conn.close()

    output_path = Path(args.output)
    write_output(sorted_rows, output_path)
    if args.all_output:
        write_all_keywords_output(sorted_rows, Path(args.all_output))
    if args.all_without_period_output:
        filtered_rows = [
            row
            for row in sorted_rows
            if "사건-시기" not in normalize_list(row[1][4])
        ]
        write_all_keywords_output(
            filtered_rows, Path(args.all_without_period_output), include_metadata=True
        )
    if args.period_output:
        conn = sqlite3.connect(db_path)
        try:
            period_rows = sort_keywords(fetch_table(conn, "event"))
        finally:
            conn.close()
        write_output(period_rows, Path(args.period_output))


if __name__ == "__main__":
    main()
