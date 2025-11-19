"""Utility helpers for session-based table rebuilders."""

from __future__ import annotations

import sqlite3


def ensure_table(cur: sqlite3.Cursor, name: str) -> None:
    if name == "keywords":
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS keywords (
                id TEXT PRIMARY KEY,
                keyword TEXT NOT NULL,
                descriptions TEXT NOT NULL,
                ref_id TEXT NOT NULL,
                q_ref_id TEXT NOT NULL,
                types TEXT NOT NULL,
                score TEXT NOT NULL
            )
            """
        )
    elif name in {"event", "events"}:
        cur.execute("DROP TABLE IF EXISTS event")
        cur.execute("DROP TABLE IF EXISTS events")
        cur.execute(
            """
            CREATE TABLE events (
                id TEXT PRIMARY KEY,
                keyword TEXT NOT NULL,
                ref_id TEXT NOT NULL,
                q_ref_id TEXT NOT NULL,
                times TEXT NOT NULL,
                t_group TEXT NOT NULL,
                t_item TEXT NOT NULL,
                years TEXT NOT NULL,
                score TEXT NOT NULL,
                type TEXT NOT NULL
            )
            """
        )
    else:
        raise ValueError(f"Unsupported table name: {name}")
