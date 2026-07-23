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

/* ─────────────────────────────────────────────────────
 * 강의 재생시간 포맷 (초 → "mm:ss")
 *  durationSec 이 없거나 유효하지 않으면 null(프론트가 표시를 생략).
 * ────────────────────────────────────────────────────*/
export const lessonDurationLabel = (
  durationSec: number | null | undefined
): string | null => {
  if (durationSec == null || durationSec <= 0) return null;
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

/**
 * lessons 를 unitName 기준으로 묶는다. order_index 가 단원별로 물리적으로
 * 인접하지 않아도(예: 문제풀이 Day 가 사이에 끼어있어도) unitName 이 처음
 * 등장한 순서를 그룹 순서로 유지한 채 병합한다 — DB 물리 순서에 좌우되지 않는
 * "논리적 단원 묶음" 그룹핑.
 */
export const groupLessonsByUnit = <T extends { unitName: string | null }>(
  lessons: T[]
): { unitName: string; lessons: T[] }[] => {
  const groups: { unitName: string; lessons: T[] }[] = [];
  const indexByUnit = new Map<string, number>();

  for (const lesson of lessons) {
    const unitName = lesson.unitName ?? '기타';
    const existingIndex = indexByUnit.get(unitName);
    if (existingIndex === undefined) {
      indexByUnit.set(unitName, groups.length);
      groups.push({ unitName, lessons: [lesson] });
    } else {
      groups[existingIndex]?.lessons.push(lesson);
    }
  }

  return groups;
};
