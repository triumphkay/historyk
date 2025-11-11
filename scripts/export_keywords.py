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


def fetch_keywords(
    conn: sqlite3.Connection,
) -> Iterable[Tuple[str, str, str, str, str, str, str]]:
    cur = conn.cursor()
    cur.execute(
        "SELECT keyword, descriptions, ref_id, types, times, years, scores FROM keywords"
    )
    return cur.fetchall()


def sort_keywords(
    rows: Iterable[Tuple[str, str, str, str, str, str, str]]
) -> list[Tuple[int, Tuple[str, str, str, str, str, str, str]]]:
    try:
        locale.setlocale(locale.LC_COLLATE, "ko_KR.UTF-8")
        key = locale.strxfrm
    except locale.Error:
        key = lambda value: value  # type: ignore[assignment]
    scored_rows = []
    for row in rows:
        score_total = calculate_score_sum(row[6])
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


def build_event_period_segments(times: list[str], years: list[str]) -> list[str]:
    segments: list[str] = []
    if times and years:
        for time in times:
            for year in years:
                text = " ".join(part for part in (time, year) if part).strip()
                if text:
                    segments.append(text)
    elif times:
        segments.extend(time.strip() for time in times if time.strip())
    elif years:
        segments.extend(year.strip() for year in years if year.strip())

    seen: set[str] = set()
    unique: list[str] = []
    for item in segments:
        if item not in seen:
            seen.add(item)
            unique.append(item)
    return unique


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


def format_line(
    keyword: str,
    descriptions_json: str,
    ref_ids_json: str,
    types_json: str,
    times_json: str,
    years_json: str,
    scores_json: str,
) -> str:
    types_list = normalize_list(types_json)
    descriptions_list = normalize_list(descriptions_json)
    times_list = normalize_list(times_json)
    years_list = normalize_list(years_json)

    descriptions_text = ", ".join(descriptions_list)
    period_segments = build_event_period_segments(times_list, years_list)
    period_text = ", ".join(period_segments)
    if period_text:
        descriptions_text = (
            f"{descriptions_text}, {period_text}" if descriptions_text else period_text
        )

    types = ", ".join(types_list)
    suffix = f" ({types})" if types else ""
    return f"{keyword}{suffix} - {descriptions_text}"


def write_output(
    rows: Iterable[Tuple[int, Tuple[str, str, str, str, str, str, str]]],
    output_path: Path,
) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as fh:
        for _score_total, (keyword, descriptions, ref_ids, types, times, years, scores) in rows:
            fh.write(
                format_line(
                    keyword, descriptions, ref_ids, types, times, years, scores
                )
                + "\n"
            )


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
    args = parser.parse_args()

    db_path = Path(args.db)
    if not db_path.exists():
        raise SystemExit(f"Database not found: {db_path}")

    conn = sqlite3.connect(db_path)
    try:
        rows = fetch_keywords(conn)
        sorted_rows = sort_keywords(rows)
    finally:
        conn.close()

    output_path = Path(args.output)
    write_output(sorted_rows, output_path)


if __name__ == "__main__":
    main()
