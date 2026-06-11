/* ─────────────────────────────────────────────────────
 * 코스 표시용 포맷터
 * ────────────────────────────────────────────────────*/
const SUBJECT_LABELS: Record<string, string> = {
  MATH: '수학',
  KOREAN: '국어',
  ENGLISH: '영어',
  SCIENCE: '탐구',
};

export const courseSubjectLabel = (subject: string): string =>
  SUBJECT_LABELS[subject.toUpperCase()] ?? subject;

export const priceLabel = (price: number): string =>
  price <= 0 ? '무료' : `${price.toLocaleString('ko-KR')}원`;

export const isFreeCourse = (price: number): boolean => price <= 0;
