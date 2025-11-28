import { StyleSheet } from "react-native";
import { spacing } from "./spacing";
import { typography } from "./typography";
import { colors } from "./colors";

/**
 * 퀴즈 화면들(키워드 문제, 키워드 시기)에서 공유하는 스타일
 *
 * 이 파일을 수정하면 모든 퀴즈 화면의 레이아웃이 동시에 변경됩니다.
 */
export const quizScreenStyles = StyleSheet.create({
  // 전체 컨테이너
  container: {
    flex: 1,
    backgroundColor: colors.level3,
  },

  // 스크롤 영역
  scrollContent: {
    padding: spacing.lg,
  },

  // 메인 카드 (문제 영역)
  card: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: spacing.md,
  },

  // 상단 네비게이션 (이전/다음 버튼)
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },

  // 문제 번호 카운터
  counter: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },

  // 출제빈도와 출제횟수 행
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  // 출제빈도 텍스트
  frequencyText: {
    fontSize: typography.sizes.xs,
  },

  // 출제횟수 링크
  referenceText: {
    fontSize: typography.sizes.md,
    textDecorationLine: "underline",
  },

  // 확인하기 버튼
  submitButton: {
    marginTop: spacing.md,
  },

  // 로딩/에러 중앙 정렬
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

/**
 * 키워드 시기 문제 화면 전용 스타일
 */
export const eraQuizStyles = StyleSheet.create({
  // 힌트 라벨 (질문 텍스트)
  hintLabel: {
    fontSize: typography.sizes.sm,
  },

  // 키워드 텍스트
  keyword: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xs,
  },

  // 드롭다운 행 (시기/상세 선택)
  dropdownRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
    justifyContent: "center",
  },

  // 드롭다운 버튼
  dropdownButton: {
    width: 130,
    justifyContent: "center",
    alignItems: "center",
  },

  // 연도 입력 컨테이너
  yearContainer: {
    marginTop: spacing.md,
  },

  // 연도 입력 행
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  // 연도 입력 필드
  yearInput: {
    width: 80,
  },

  // 년/월 접미사
  yearSuffix: {
    fontSize: typography.sizes.md,
  },
});
