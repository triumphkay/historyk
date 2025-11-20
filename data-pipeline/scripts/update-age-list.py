#!/usr/bin/env python3
"""Generate database/age-list.json from database/timetable.json."""

from __future__ import annotations

import json
from collections import OrderedDict
from pathlib import Path
from typing import Iterable, List


def load_timetable(timetable_path: Path) -> list:
    data = json.loads(timetable_path.read_text(encoding="utf-8"))
    if not isinstance(data, list):  # defensive check for unexpected formats
        raise ValueError("timetable.json must contain a list at the top level")
    return data


def ensure_directories(script_dir: Path, database_dir: Path) -> None:
    script_dir.mkdir(parents=True, exist_ok=True)
    database_dir.mkdir(parents=True, exist_ok=True)


def append_item_list(lines: List[str], item_name: str, group: dict) -> None:
    entries = group.get("list") or []
    if not entries:
        return

    item_aliases = group.get("aka") or []
    for entry in entries:
        entry_name = entry.get("name")
        if not entry_name:
            continue
        lines.append(f"{item_name} {entry_name}")
        for alias in item_aliases:
            lines.append(f"{alias} {entry_name}")


def append_period_list(lines: List[str], item_name: str, periods: Iterable[dict]) -> None:
    for period in periods:
        lists = period.get("list") or []
        if not lists:
            continue
        age = period.get("age")
        period_aliases = period.get("aka") or []
        for entry in lists:
            entry_name = entry.get("name")
            if not entry_name:
                continue
            lines.append(f"{item_name} {entry_name}")
            if age:
                lines.append(f"{item_name} {age} {entry_name}")
            for alias in period_aliases:
                lines.append(f"{alias} {entry_name}")


def handle_japanese_occupation(lines: List[str], group: dict) -> None:
    lines.append("일제강점기")
    periods = group.get("period") or []
    for period in periods:
        age = period.get("age")
        if age:
            lines.append(f"일제강점기 {age}")


def handle_republic_of_korea(lines: List[str], group: dict) -> None:
    lines.append("대한민국")
    periods = group.get("period") or []
    deduped: OrderedDict[str, None] = OrderedDict()
    for period in periods:
        for entry in period.get("list") or []:
            name = entry.get("name")
            if not name:
                continue
            if name in deduped:
                continue
            deduped[name] = None
            lines.append(name)
            lines.append(f"대한민국 {name}")


def generate_lines(timetable: list) -> List[str]:
    lines: List[str] = []
    for entry in timetable:
        for group in entry.get("group", []):
            item_name = group.get("item")
            if not item_name:
                continue

            if item_name == "일제강점기":
                handle_japanese_occupation(lines, group)
                continue

            if item_name == "대한민국":
                handle_republic_of_korea(lines, group)
                continue

            lines.append(item_name)
            append_item_list(lines, item_name, group)
            periods = group.get("period") or []
            append_period_list(lines, item_name, periods)
    return lines


def write_output(output_path: Path, lines: List[str]) -> None:
    output_path.write_text(
        json.dumps(lines, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    script_path = Path(__file__).resolve()
    script_dir = script_path.parent
    project_root = script_dir.parent
    database_dir = project_root / "database"
    timetable_path = database_dir / "timetable.json"
    output_path = database_dir / "age-list.json"

    ensure_directories(script_dir, database_dir)

    timetable = load_timetable(timetable_path)
    lines = generate_lines(timetable)
    write_output(output_path, lines)


if __name__ == "__main__":
    main()
