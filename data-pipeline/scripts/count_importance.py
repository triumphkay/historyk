import sqlite3
import json
import os

# 경로 설정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "database/korean-history.db")

def get_label(total):
    if total <= 0: return "없음"
    if total < 5: return "낮음"
    if total < 10: return "보통"
    if total < 20: return "높음"
    return "매우 높음"

def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    cur.execute("SELECT scores FROM newwords")
    rows = cur.fetchall()
    conn.close()
    
    counts = {"없음": 0, "낮음": 0, "보통": 0, "높음": 0, "매우 높음": 0}
    
    for row in rows:
        scores_json = row[0]
        try:
            scores = json.loads(scores_json)
            total = sum(int(s) for s in scores)
            label = get_label(total)
            counts[label] += 1
        except:
            pass
            
    print("새로운 기준 중요도 분포:")
    for label in ["매우 높음", "높음", "보통", "낮음", "없음"]:
        print(f"{label}: {counts[label]}개")

if __name__ == "__main__":
    main()
