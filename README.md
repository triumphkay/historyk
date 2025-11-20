# 한국사 키워드 플랫폼

이 저장소는 JSON 문제 데이터를 정규화된 SQLite 테이블로 변환하고, 변환된
데이터를 React Native/Expo 기반 모바일 앱(`app/`)에 공급하는 한국사 키워드 파이프라인
프로젝트입니다. `data-pipeline/` 아래의 스크립트로 `sessions`, `events`, `keywords`
테이블을 만들고, 생성된 키워드·사건 정보를 `app/assets`로 내려받아 퀴즈 화면에서 사용합니다.

## 구조 개요
- `data-pipeline/`: 데이터 파이프라인과 SQLite DB 생성, 원시 `sources/*.json` 문제 데이터
- `app/`: Expo 기반 모바일 앱, 퀴즈 UI와 Context/유틸리티 구현

### data-pipeline/ 주요 흐름
- `scripts/make_database.py`: 파이프라인 전체를 순차 실행하여 `sessions` → `events` → `keywords` 테이블을 재생성하고 `key-age` 메타를 갱신합니다.
- `scripts/json_to_sessions.py`: 문제 JSON을 읽어 `sessions` 테이블을 완전 재작성하며 지문, 보기, 분석 데이터를 구조화합니다.
- `scripts/sessions_to_events.py`: 키워드에 시기 관련 접미사(“-시기”)가 붙은 것들을 `events` 테이블로 추출하고, `database/keyword-types.json` 기준으로 검증합니다.
- `scripts/sessions_to_keywords.py`: 모든 키워드를 `keywords` 테이블로 정리하면서 시간 접미사 제거, 연관 세션 누적, `age` 필드 갱신 등의 규칙을 적용합니다.
- `scripts/update-age-list.py` 및 `scripts/update_key_age.py`: 시대/왕/정부 리스트와 `keywords`의 `age` 필드를 최신 상태로 유지합니다.
- `scripts/generate-db-json.js`: 생성된 `keywords`/`events` 테이블을 SQLite에서 JSON으로 추출하여 `app/assets/db.json`과 `data-pipeline/database/events.json`을 덮어씁니다.
- `scripts/copy-json.js` (`app/` 안): 파이프라인에서 만든 `keyword-types.json`, `events.json`을 앱 자산 디렉터리에 복사합니다.
- `database/`: SQLite DB(`korean-history.db`), `keyword-types.json`, `events.json`, `age-list.json`, `timetable.json` 등 결과 산출물이 위치합니다.
- `sources/`: 문제 JSON 원본, 파이프라인 실행 시 각종 세션 데이터를 읽어 들입니다.

### 실행 방법
1. `data-pipeline/sources/*.json` 기반으로 DB와 JSON을 갱신하려면:
   ```bash
   cd data-pipeline
   python3 scripts/make_database.py
   ```
2. 파이프라인 완료 후 `app/assets`로 JSON을 반영하려면 `app/`에서:
   ```bash
   cd ../app
   npm run generate:db
   npm run copy:json
   ```
   ※ `generate:db`는 `data-pipeline/scripts/generate-db-json.js`를 실행하여 SQLite `keywords`/`events`를 JSON으로 변환합니다.
3. Expo 앱 실행:
   ```bash
   npm install
   npm start
   ```
   엔진은 `prestart`/`pre*` 스크립트에서 자동으로 `generate:db` + `copy:json`을 실행하므로, 개발 서버 시작 전 항상 최신 데이터가 반영됩니다.

## 앱(app/) 개요
- `App.tsx`가 엔트리 포인트이며 React Navigation + React Native Paper를 사용해 퀴즈 흐름을 구성합니다.
- `src/components`, `src/screens`, `src/context`, `src/utils`, `src/theme`, `src/types` 등으로 UI/로직을 분리합니다.
- 주요 Context:
  - `QuizContext`: 일반 키워드 퀴즈 상태 및 정답 처리
  - `EraQuizContext`: 시대 퀴즈 상태와 시대/왕/정부 선택 로직
  - `ThemePreferenceContext`: 라이트/다크 모드 설정
- 정적 데이터:
  - `assets/db.json`: `keywords` 테이블 JSON (`generate-db-json.js`에서 생성)
  - `assets/events.json`: `events` 테이블 JSON (`generate-db-json.js` 생성 후 `copy-json.js`가 복사)
  - `assets/keyword-types.json`: 키워드 타입/시기 정의 (`copy-json.js`로 동기화)
- 주요 스크립트:
  - `npm run generate:db`: `data-pipeline/scripts/generate-db-json.js`
  - `npm run copy:json`: `app/assets`로 JSON 복사
  - `npm start`/`npm run ios`/`npm run android`/`npm run web`: Expo CLI 실행 흐름
  - `npm run build`: Expo 프로덕션 빌드

## 기타
- 모든 스크립트는 JSON 파싱/길이 불일치/비정상 값 감지 시 `[ERROR] ...` 로그를 출력하고 `sys.exit(1)`로 종료하여 DB 일관성을 유지합니다.
- `database/keyword-types.json`은 키워드 타입(`types`), 시기 접미사(`times-key`), `ages` 목록 등 파이프라인 검증 설정을 포함합니다.
- `temp/` 디렉터리는 점수/설명 통계 출력으로 분석에 참고할 수 있습니다.
