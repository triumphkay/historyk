#!/usr/bin/env python3
"""
Generate korean-history.db tables and export keyword text files.

Pipeline order:
1. sessions (json_to_sessions.py)
2. event (sessions_to_event.py)
3. keywords (sessions_to_keywords.py)
4. Keyword text exports (export_keywords.py)
"""

from __future__ import annotations

import argparse
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
        description="Rebuild database tables (sessions → event → keywords) and export keyword lists."
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
    parser.add_argument(
        "--output",
        default="database/keywords.txt",
        help="키워드 텍스트 출력 경로 (기본값: database/keywords.txt)",
    )
    parser.add_argument(
        "--all-output",
        default="database/all-keywords.txt",
        help="추가 키워드 목록 출력 경로 (기본값: database/all-keywords.txt)",
    )
    parser.add_argument(
        "--all-wo-period-output",
        default="database/all-keywords-wo.txt",
        help="사건-시기 제외 키워드 목록 경로 (기본값: database/all-keywords-wo.txt)",
    )
    parser.add_argument(
        "--period-output",
        default="database/keywords-wo.txt",
        help="사건-시기 키워드 목록 경로 (기본값: database/keywords-wo.txt)",
    )
    parser.add_argument(
        "--non-period-output",
        default=None,
        help="사건-시기 제외 키워드 목록 경로",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    scripts_dir = repo_root / "scripts"

    session_script = scripts_dir / "json_to_sessions.py"
    event_script = scripts_dir / "sessions_to_events.py"
    keyword_script = scripts_dir / "sessions_to_keywords.py"

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
        "event 테이블 생성",
        [
            sys.executable,
            str(event_script),
            "--db",
            str(args.db),
        ],
    )
    run_command(
        "keywords 테이블 생성",
        [
            sys.executable,
            str(keyword_script),
            "--db",
            str(args.db),
        ],
    )
    print("[build] 완료되었습니다.")


if __name__ == "__main__":
    main()
