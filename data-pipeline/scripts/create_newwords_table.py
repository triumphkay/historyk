#!/usr/bin/env python3
"""Create the newwords table in the database."""

from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path


def ensure_newwords_schema(cur: sqlite3.Cursor) -> None:
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='newwords'")
    table_exists = cur.fetchone() is not None

    if table_exists:
        cur.execute("PRAGMA table_info(newwords)")
        columns = {row[1] for row in cur.fetchall()}
        required = {
            "id",
            "keyword",
            "descriptions",
            "ref_id",
            "q_ref_id",
            "types",
            "scores",
            "era",
            "sub_era",
            "det_era",
            "years",
            "years_check",
            "era_script",
        }
        if not required.issubset(columns):
            missing = ", ".join(sorted(required - columns))
            print(
                f"Existing 'newwords' table is missing column(s): {missing}. "
                "Dropping and recreating table."
            )
            cur.execute("DROP TABLE newwords")
            table_exists = False

    if not table_exists:
        cur.execute(
            """
            CREATE TABLE newwords (
                id TEXT NOT NULL PRIMARY KEY,
                keyword TEXT,
                descriptions TEXT,
                ref_id TEXT,
                q_ref_id TEXT,
                types TEXT,
                scores TEXT,
                era TEXT,
                sub_era TEXT,
                det_era TEXT,
                years TEXT,
                years_check TEXT,
                era_script TEXT
            )
            """
        )
        print("Created 'newwords' table.")
    else:
        print("'newwords' table already exists and has correct schema.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create newwords table")
    parser.add_argument(
        "--db",
        default="database/korean-history.db",
        help="SQLite database path (default: database/korean-history.db)",
    )
    args = parser.parse_args()

    db_path = Path(args.db)
    # Ensure the directory exists
    db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        ensure_newwords_schema(cur)
        conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":
    main()
