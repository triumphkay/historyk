import sqlite3
import json
import os
from collections import Counter

# 경로 설정 (data-pipeline 폴더 기준)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "database/korean-history.db")
# temp 폴더는 프로젝트 루트(data-pipeline의 상위)에 생성
PROJECT_ROOT = os.path.dirname(BASE_DIR)
OUTPUT_FILE = os.path.join(PROJECT_ROOT, "temp/test-desc.txt")

def main():
    print(f"Connecting to database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 데이터 조회
    print("Fetching data from newwords table...")
    cur.execute("SELECT keyword, descriptions FROM newwords")
    rows = cur.fetchall()

    # 키워드 집합 생성 및 설명 수집
    keywords = set()
    all_descriptions = []

    print(f"Processing {len(rows)} rows...")
    for keyword, descriptions_json in rows:
        # 키워드 저장 (공백 제거 등 정규화가 필요하다면 여기서 수행, 현재는 그대로 사용)
        keywords.add(keyword)
        
        try:
            if descriptions_json:
                descriptions = json.loads(descriptions_json)
                if isinstance(descriptions, list):
                    # 각 설명 아이템의 앞뒤 공백 제거
                    cleaned_descs = [d.strip() for d in descriptions if d.strip()]
                    all_descriptions.extend(cleaned_descs)
        except json.JSONDecodeError:
            print(f"Warning: Failed to decode JSON for keyword '{keyword}'")
            continue

    conn.close()

    # 카운트
    print("Counting descriptions...")
    desc_counts = Counter(all_descriptions)

    # 결과 포맷팅 및 정렬 (가나다순)
    output_lines = []
    sorted_items = sorted(desc_counts.items())

    print("Formatting output...")
    for desc, count in sorted_items:
        line = f"{desc} - {count}"
        # 키워드와 정확히 일치하는지 확인
        if desc in keywords:
            line += "*"
        output_lines.append(line)

    # 파일 저장
    print(f"Writing to {OUTPUT_FILE}...")
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(output_lines))

    print(f"Successfully wrote {len(output_lines)} unique descriptions to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
