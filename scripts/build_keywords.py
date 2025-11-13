#!/usr/bin/env python3
"""
Rebuild korean-history database and export keywords in one step.

Usage:
    python3 scripts/build_keywords.py \
        --input sources \
        --db database/korean-history.db \
        --output database/keywords.txt
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
        description="Rebuild database and export keywords in sequence."
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

    json_script = scripts_dir / "json_to_sqlite.py"
    export_script = scripts_dir / "export_keywords.py"

    run_command(
        "DB 생성",
        [
            sys.executable,
            str(json_script),
            "--input",
            str(args.input),
            "--db",
            str(args.db),
        ],
    )
    export_command = [
        sys.executable,
        str(export_script),
        "--db",
        str(args.db),
        "--output",
        str(args.output),
    ]
    if args.all_output:
        export_command.extend(["--all-output", str(args.all_output)])
    if args.all_wo_period_output:
        export_command.extend(["--all-without-period-output", str(args.all_wo_period_output)])
    if args.period_output:
        export_command.extend(["--period-output", str(args.period_output)])
    if args.non_period_output:
        export_command.extend(["--non-period-output", str(args.non_period_output)])
    run_command(
        "키워드 텍스트 내보내기",
        export_command,
    )
    print("[build] 완료되었습니다.")


if __name__ == "__main__":
    main()
