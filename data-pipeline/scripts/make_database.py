#!/usr/bin/env python3
"""
Generate korean-history.db with the tables that are still in use.

Pipeline order:
1. sessions (json_to_sessions.py)
2. newwords table creation (create_newwords_table.py)
3. newwords population (populate_newwords.py)
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


def run_command(description: str, command: list[str]) -> None:
    print(f"[build] {description}: {' '.join(command)}")
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode != 0:
        if completed.stdout:
            print(completed.stdout.strip())
        if completed.stderr:
            print(completed.stderr.strip())
        raise SystemExit(
            f"{description} 실패 (종료 코드 {completed.returncode}). 해결 후 다시 시도하세요."
        )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Rebuild the database (sessions → newwords) based on JSON sources."
    )
    parser.add_argument(
        "--input",
        default="sources",
        help="JSON 파일이 위치한 디렉터리 또는 파일 (기본값: sources)",
    )
    parser.add_argument(
        "--db",
        default="database/korean-history.db",
        help="생성할 SQLite DB 경로 (기본값: database/korean-history.db)",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    scripts_dir = repo_root / "scripts"

    timeline_script = scripts_dir / "timeline_setting.py"
    session_script = scripts_dir / "json_to_sessions.py"
    newwords_script = scripts_dir / "create_newwords_table.py"
    populate_script = scripts_dir / "populate_newwords.py"

    run_command(
        "연표 JSON 생성",
        [
            sys.executable,
            str(timeline_script),
        ],
    )

    run_command(
        "sessions 테이블 생성",
        [
            sys.executable,
            str(session_script),
            "--input",
            str(args.input),
            "--db",
            str(args.db),
        ],
    )

    run_command(
        "newwords 테이블 생성",
        [
            sys.executable,
            str(newwords_script),
            "--db",
            str(args.db),
        ],
    )

    run_command(
        "newwords 데이터 채우기",
        [
            sys.executable,
            str(populate_script),
        ],
    )

    key_age_script = scripts_dir / "update_key_age.py"
    run_command(
        "key-age.json 생성",
        [
            sys.executable,
            str(key_age_script),
        ],
    )

    json_gen_script = scripts_dir / "generate-newwords-json.js"
    run_command(
        "앱용 JSON 데이터 생성 (assets/data.json)",
        [
            "node",
            str(json_gen_script),
        ],
    )

    # Copy keyword-types.json to app/assets
    hardcodes_dir = repo_root / "hardcodes"
    app_assets_dir = repo_root.parent / "app" / "assets"
    keyword_types_src = hardcodes_dir / "keyword-types.json"
    keyword_types_dst = app_assets_dir / "keyword-types.json"
    
    print(f"[build] keyword-types.json 복사: {keyword_types_src} → {keyword_types_dst}")
    shutil.copy(keyword_types_src, keyword_types_dst)
    
    print("[build] 완료되었습니다.")


if __name__ == "__main__":
    main()
