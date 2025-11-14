# 한국사 키워드 파이프라인

이 레포지터리는 JSON 기반의 역사 시험 데이터를 읽어 들여, 정규화된 SQLite
테이블(`sessions`, `events`, `keywords`)을 생성하고 키워드 메타데이터를 추출하는
커스텀 파이프라인을 포함합니다. 전체 흐름은 `scripts/make_database.py`가
조율하며, 실행 순서는 다음과 같습니다.

1. `json_to_sessions.py`: `sources/*.json` 문제 데이터를 파싱하고 이전 내용을
   삭제한 뒤 `sessions` 테이블을 다시 채웁니다. 지문, 분석, 정답 등의 필드를
   구조화합니다.
2. `sessions_to_events.py`: 타입이 “-시기”로 끝나는 키워드만 골라 `events` 테이블을
   생성합니다. 접미사 제거 및 시대 검증 규칙은 `database/keyword-types.json`을
   참고합니다.
3. `sessions_to_keywords.py`: `keywords` 테이블을 항상 새로 만들어, 시간 접미사
   처리, “국가 시기 왕” 패턴 인식, 설명 중복 검사, 참조 ID·타입·점수 누적,
   `age` 필드 갱신 등의 규칙을 적용합니다.

### 디렉터리 구조
- `sources/`: 세션별 JSON 문제 데이터
- `scripts/`: 파이프라인 스크립트 및 헬퍼
- `database/`: 생성된 SQLite 파일(`korean-history.db`)과
  `keyword-types.json` 등 설정 파일

### 실행 방법
```bash
python3 scripts/make_database.py
```
현재 `sources` 내용을 기반으로 `sessions`, `events`, `keywords` 테이블을
재생성합니다.

### 주요 설정 (database/keyword-types.json)
- `types`: 허용되는 세션 타입 목록
- `except-types`: 시간 접미사 제거 대상 타입
- `times-key`: “설치”, “공포” 등 접미사 목록
- `ages`: “국가 시기 왕” 표준 문자열 리스트

### keywords 테이블 구조
- `id`: 매 실행 시 `k0001`부터 부여
- `keyword`: 최종 키워드 문자열
- `descriptions`: 설명 문자열 리스트(JSON)
- `ref_id` / `q_ref_id`: 보기/지문 참조 세션 ID 리스트
- `types`: 이 키워드를 언급한 모든 세션 타입
- `score`: 누적 점수(지문=3, 보기=1 또는 2)
- `age`: `ages` 목록에서 매칭된 가장 긴 문자열

### 오류 처리
모든 스크립트는 JSON 파싱 실패, 길이 불일치, 접미사/age 처리 후 빈 문자열
등의 문제를 발견하면 즉시 stderr에 `[ERROR] ...`를 출력하고 `sys.exit(1)`로
종료합니다. 정상 종료 시에는 아무 메시지도 출력하지 않아 DB가 일관된 상태로만
업데이트되도록 합니다.
