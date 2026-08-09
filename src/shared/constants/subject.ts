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

/**
 * 과목 코드를 한글로 바꾼다.
 * 사전에 없는 코드는 raw enum 문자열을 그대로 노출하지 않고 `기타`로 접는다.
 */
export const subjectLabel = (subject: string | null | undefined): string => {
  if (!subject) return '기타';
  return SUBJECT_LABEL[subject] ?? '기타';
};
