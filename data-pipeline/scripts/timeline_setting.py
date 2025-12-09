#!/usr/bin/env python3
"""Generate key-prehistoric.json, ref-timeline.json, and key-age.json from timetable.json."""

from __future__ import annotations

import json
from pathlib import Path


def load_timetable(source_path: Path) -> list:
    # 주어진 경로에서 연표 JSON을 읽어 리스트로 반환한다.
    if not source_path.exists():
        raise FileNotFoundError(f"파일을 찾을 수 없습니다: {source_path}")
    try:
        data = json.loads(source_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"{source_path} 파싱 실패: {exc}") from exc
    if not isinstance(data, list):
        raise ValueError(f"{source_path}의 최상단에는 배열이 필요합니다.")
    return data


def collect_prehistory_entries(timetable: list) -> list[str]:
    # 선사시대 블록에 포함된 item 이름만 중복 없이 추출한다.
    entries: list[str] = []
    seen: set[str] = set()
    for block in timetable:
        if block.get("epic") != "선사시대":
            continue
        for group in block.get("group", []):
            item = (group.get("item") or "").strip()
            if item and item not in seen:
                seen.add(item)
                entries.append(item)
    return entries


def collect_history_entries(timetable: list) -> list[str]:
    # 선사시대를 제외한 나머지 item/시대 조합을 문자열 목록으로 만든다.
    entries: list[str] = []
    seen: set[str] = set()
    for block in timetable:
        if block.get("epic") == "선사시대":
            continue
        for group in block.get("group", []):
            item = (group.get("item") or "").strip()
            if not item:
                continue
            if item not in seen:
                seen.add(item)
                entries.append(item)
            for period in group.get("period", []):
                age_label = (period.get("age") or "").strip()
                people_list = period.get("list", [])
                
                # If list is empty but age_label exists, add the age entry itself
                # e.g. "일제강점기 무단통치기"
                if not people_list and age_label:
                    age_entry = f"{item} {age_label}"
                    if age_entry not in seen:
                        seen.add(age_entry)
                        entries.append(age_entry)

                for person in people_list:
                    name = (person.get("name") or "").strip()
                    if not name:
                        continue
                    base_label = f"{item} {name}"
                    if base_label not in seen:
                        seen.add(base_label)
                        entries.append(base_label)
                    if age_label:
                        age_entry = f"{item} {age_label} {name}"
                        if age_entry not in seen:
                            seen.add(age_entry)
                            entries.append(age_entry)
    return entries


def collect_age_entries(timetable: list) -> list[dict]:
    # age가 비어 있지 않은 item을 찾아 {item, ages[]} 구조로 정리한다.
    results: list[dict] = []
    seen_items: set[str] = set()
    for block in timetable:
        for group in block.get("group", []):
            item = (group.get("item") or "").strip()
            if not item:
                continue
            ages: list[str] = []
            seen_ages: set[str] = set()
            for period in group.get("period", []):
                age_label = (period.get("age") or "").strip()
                if age_label and age_label not in seen_ages:
                    seen_ages.add(age_label)
                    ages.append(age_label)
            if ages:
                key = item
                if key not in seen_items:
                    seen_items.add(key)
                    results.append({"nation": item, "periods": ages})
    return results


def write_json(path: Path, data) -> None:
    # 출력 디렉터리를 만들고 JSON 파일을 저장한다.
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    # 프로젝트 기준 경로들을 계산한다.
    project_root = Path(__file__).resolve().parent.parent
    timetable_path = project_root / "hardcodes" / "timetable.json"
    output_dir = project_root / "database"
    app_assets_dir = project_root.parent / "app" / "assets"
    
    prehistory_path = app_assets_dir / "key-prehistoric.json"
    history_path = output_dir / "ref-timeline.json"
    age_path = app_assets_dir / "key-age.json"

    timetable = load_timetable(timetable_path)
    prehistory_entries = collect_prehistory_entries(timetable)
    history_entries = collect_history_entries(timetable)
    age_entries = collect_age_entries(timetable)

    write_json(prehistory_path, prehistory_entries)
    write_json(history_path, history_entries)
    write_json(age_path, age_entries)
    # 생성 결과를 간단히 로그로 남긴다.
    print(f"[timeline] {prehistory_path} ({len(prehistory_entries)}개) 생성")
    print(f"[timeline] {history_path} ({len(history_entries)}개) 생성")
    print(f"[timeline] {age_path} ({len(age_entries)}개) 생성")


if __name__ == "__main__":
    main()
