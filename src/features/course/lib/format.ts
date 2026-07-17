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

/* ─────────────────────────────────────────────────────
 * 3티어 앵커링 카피
 *  코스는 50일 관리형 프로그램(wiki/2-product 코스 정체성 확정) — 분모는 50일 고정.
 * ────────────────────────────────────────────────────*/
const COURSE_PROGRAM_DAYS = 50;

export const dailyPriceLabel = (
  price: number,
  days: number = COURSE_PROGRAM_DAYS
): string => `하루 ${Math.round(price / days).toLocaleString('ko-KR')}원`;

const PLAN_TYPE_LABELS: Record<string, string> = {
  SELF_PACED: '자율형',
  MANAGED: '관리형',
  PREMIUM_1ON1: '1:1 프리미엄',
};

export const planTypeLabel = (planType: string): string =>
  PLAN_TYPE_LABELS[planType] ?? planType;
