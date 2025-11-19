# History Keyword Quiz

한국 역사 키워드를 학습하고 테스트하는 모바일 애플리케이션입니다. React Native와 Expo를 기반으로 개발되었으며, 다양한 형식의 퀴즈를 통해 역사 지식을 향상시킬 수 있습니다.

## 🎯 주요 기능

### 키워드 학습 및 테스트
- **키워드 목록**: 한국 역사의 주요 키워드를 카테고리별로 조회
- **키워드 퀴즈**: 키워드의 유형(국가, 인물, 사건 등)을 맞히는 퀴즈
- **시기 퀴즈**: 키워드와 관련된 시대와 왕/정부를 선택하는 퀴즈

### 다양한 퀴즈 유형
- **국가**: 키워드와 관련된 국가 맞히기
- **인물**: 키워드와 관련된 왕이나 인물 맞히기
- **사건**: 역사적 사건 학습
- **시대/제도**: 특정 제도나 개혁의 시기 학습
- **그 외**: 지역, 종교, 문화유산 등 다양한 카테고리

### 학습 지원 기능
- **출제 빈도 표시**: 입시 및 학력 평가에서의 출제 빈도 표시
- **참고자료 링크**: 각 문제별 참고할 수 있는 출처 표시
- **상세 설명**: 정답에 대한 상세한 설명 제공
- **테마 설정**: 다크/라이트 모드 지원

## 📱 플랫폼 지원

- **iOS**: iPhone, iPad
- **Android**: 안드로이드 기기
- **Web**: 웹 브라우저

## 🏗️ 프로젝트 구조

```
publish/
├── src/
│   ├── components/          # UI 컴포넌트
│   │   ├── AnswerBoxes.tsx
│   │   ├── AnswerModal.tsx
│   │   ├── EraAnswerModal.tsx
│   │   ├── ReferenceModal.tsx
│   │   └── ...
│   ├── screens/             # 화면 컴포넌트
│   │   ├── HomeScreen.tsx
│   │   ├── KeywordListScreen.tsx
│   │   ├── QuizScreen.tsx
│   │   ├── KeywordEraQuizScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── context/             # 상태 관리 (Context API)
│   │   ├── QuizContext.tsx
│   │   ├── EraQuizContext.tsx
│   │   └── ThemePreferenceContext.tsx
│   ├── utils/               # 유틸리티 함수
│   │   ├── dataLoader.ts
│   │   ├── eraQuiz.ts
│   │   ├── filters.ts
│   │   ├── references.ts
│   │   ├── score.ts
│   │   └── ...
│   ├── theme/               # 디자인 시스템
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   └── types/               # TypeScript 타입 정의
│       ├── Keyword.ts
│       ├── EventItem.ts
│       ├── QuizItem.ts
│       └── ...
├── assets/                  # 정적 자산
│   ├── events.json          # 역사 사건 데이터
│   ├── keyword-types.json   # 키워드 타입 및 시기 데이터
│   └── db.json              # 생성된 데이터베이스
├── scripts/
│   └── copy-keyword-types.js # 빌드 스크립트
├── App.tsx                  # 애플리케이션 진입점
├── app.json                 # Expo 설정
├── babel.config.js          # Babel 설정
├── metro.config.js          # Metro 번들러 설정
└── package.json             # 프로젝트 의존성
```

## 🚀 시작하기

### 필수 요구사항
- Node.js 14.0 이상
- npm 또는 yarn
- Expo CLI (설치: `npm install -g expo-cli`)

### 설치 및 실행

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **개발 서버 시작**
   ```bash
   npm start
   ```

3. **플랫폼별 실행**
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

### 빌드

```bash
npm run build
```

## 📊 데이터 구조

### 키워드 데이터 (keyword-types.json)
- **types**: 키워드 분류 타입 목록
- **types-details**: 각 타입별 상세 정보 및 문제 템플릿
- **times-key**: 역사적 시기를 나타내는 키워드
- **key-age**: 국가별 왕/정부 목록 (시대 퀴즈용)

### 사건 데이터 (events.json)
- `id`: 고유 식별자
- `keyword`: 키워드명
- `times`: 관련된 시대/왕/정부
- `years`: 발생 연도 및 시기
- `types`: 키워드 분류 타입
- `score`: 출제 빈도 점수
- `ref_id`, `q_ref_id`: 참고자료 ID

## 🎨 기술 스택

- **React Native**: 크로스 플랫폼 모바일 개발
- **Expo**: React Native 개발 프레임워크
- **React Navigation**: 화면 네비게이션
- **React Native Paper**: Material Design UI 컴포넌트
- **TypeScript**: 타입 안정성
- **Context API**: 상태 관리

## 🔧 주요 Context API

### QuizContext
- 일반 키워드 퀴즈 상태 관리
- 현재 문제, 진행도, 정답 확인 등

### EraQuizContext
- 시기/연도 퀴즈 상태 관리
- 국가-왕/정부 선택 로직

### ThemePreferenceContext
- 라이트/다크 모드 테마 설정

## 📝 스크립트 명령어

```bash
npm run generate:db    # 데이터베이스 JSON 생성
npm run copy:json      # JSON 파일 복사
npm start             # 개발 서버 시작
npm run android       # Android 개발 빌드
npm run ios           # iOS 개발 빌드
npm run web           # 웹 개발 빌드
npm run build         # 프로덕션 빌드
```

## 📄 라이선스

이 프로젝트는 개인 학습 목적으로 작성되었습니다.

## 👨‍💻 개발자

- **Repository**: [historyk](https://github.com/triumphkay/historyk)

## 📞 피드백 및 문의

버그 리포트나 기능 요청은 GitHub Issues를 통해 제출해주시기 바랍니다.
