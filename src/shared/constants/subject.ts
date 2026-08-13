/**
 * 과목 코드 한글 사전 (단일 정본).
 *
 * 서버 enum 정본 = `mvp-back/.../domain/open_challenge/tree/TreeSubject.java`
 * (MIDDLE_MATH · COMMON_MATH_1 · COMMON_MATH_2 · ALGEBRA · CALCULUS_1 ·
 *  CALCULUS_2 · MATH_1 · MATH_2 · CALCULUS · PROBABILITY_STATISTICS ·
 *  GEOMETRY · UNKNOWN)
 *
 * 이 사전이 전 항목을 덮는다. 화면마다 따로 복제하지 않는다.
 */
export const SUBJECT_LABEL: Record<string, string> = {
  MIDDLE_MATH: '중학 수학',
  COMMON_MATH_1: '공통수학1',
  COMMON_MATH_2: '공통수학2',
  ALGEBRA: '대수',
  CALCULUS_1: '미적분Ⅰ',
  CALCULUS_2: '미적분Ⅱ',
  MATH_1: '대수',
  MATH_2: '미적분Ⅰ',
  CALCULUS: '미적분Ⅱ',
  PROBABILITY_STATISTICS: '확률과 통계',
  GEOMETRY: '기하',
  UNKNOWN: '기타',
  OTHER: '기타',
};

const SERVER_ENUM_CODE = /^[A-Z][A-Z0-9_]*$/;

/**
 * 화면 표시용 과목명.
 *
 * 사전에 있는 서버 코드는 한글로 바꾸고, 이미 번역된 표시명은 보존한다.
 * 사전에 없는 서버 enum은 내부 식별자를 노출하지 않도록 null을 반환한다.
 */
export const subjectDisplayLabel = (
  subject: string | null | undefined
): string | null => {
  const normalized = subject?.trim();
  if (!normalized) return null;

  const mapped = SUBJECT_LABEL[normalized.toUpperCase()];
  if (mapped) return mapped;

  return SERVER_ENUM_CODE.test(normalized) ? null : normalized;
};

/**
 * 과목 코드를 한글로 바꾼다.
 * 사전에 없는 코드는 raw enum 문자열을 그대로 노출하지 않고 `기타`로 접는다.
 */
export const subjectLabel = (subject: string | null | undefined): string => {
  return subjectDisplayLabel(subject) ?? '기타';
};
