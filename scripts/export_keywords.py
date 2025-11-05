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


def fetch_keywords(conn: sqlite3.Connection) -> Iterable[Tuple[str, str, str, str]]:
    cur = conn.cursor()
    cur.execute("SELECT keyword, descriptions, ref_id, types FROM keywords")
    return cur.fetchall()


def sort_keywords(rows: Iterable[Tuple[str, str, str, str]]) -> list[Tuple[str, str, str, str]]:
    try:
        locale.setlocale(locale.LC_COLLATE, "ko_KR.UTF-8")
        key = locale.strxfrm
    except locale.Error:
        key = lambda value: value  # type: ignore[assignment]
    return sorted(rows, key=lambda row: key(row[0]))


def normalize_list(value: str) -> list[str]:
    if not value:
        return []
    data = json.loads(value)
    if isinstance(data, list):
        return [str(item) for item in data if str(item)]
    if data in (None, ""):
        return []
    return [str(data)]


def format_line(keyword: str, descriptions_json: str, ref_ids_json: str, types_json: str) -> str:
    descriptions = ", ".join(normalize_list(descriptions_json))
    types = ", ".join(normalize_list(types_json))
    suffix = f" ({types})" if types else ""
    return f"{keyword}{suffix} - {descriptions}"


def write_output(rows: Iterable[Tuple[str, str, str, str]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as fh:
        for keyword, descriptions, ref_ids, types in rows:
            fh.write(format_line(keyword, descriptions, ref_ids, types) + "\n")


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
