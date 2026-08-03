import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 자녀 1명 Domain (학부모-자녀 연결 목록 아이템)
 * ────────────────────────────────────────────────────*/
const ChildSchema = z.object({
  childId: z.number(),
  childName: z.string(),
});

/* ─────────────────────────────────────────────────────
 * 자녀 학습 리포트 Domain
 *  지표 톤(회고·격려) — 질책 금지.
 *  - avgThinkingTimeSecs : 고민시간(긍정) — 평균 소요 시간(초)
 *  - aiUsageRate         : 조교활용도(긍정/중립) — 0~100%
 *  - solutionViewRate    : 해설의존도(주의) — 0~100%
 *  - expectedGradeRange  : 예상 등급 "범위"(단정 금지). 예) "2~3등급"
 *  - lastActivityAt      : 마지막 완료 일시(없으면 null)
 * ────────────────────────────────────────────────────*/
const ChildReportSchema = z.object({
  childId: z.number(),
  childName: z.string(),
  from: z.string(),
  to: z.string(),
  totalCompleted: z.number(),
  avgThinkingTimeSecs: z.number(),
  aiUsageRate: z.number(),
  solutionViewRate: z.number(),
  expectedGradeRange: z.string(),
  beforeAfter: z.object({
    solutionViewRateBefore: z.number(),
    solutionViewRateAfter: z.number(),
    selfStudyDaysPerWeekBefore: z.number(),
    selfStudyDaysPerWeekAfter: z.number(),
    expectedGradeRangeBefore: z.string(),
    expectedGradeRangeAfter: z.string(),
    learningRecordCount: z.number().int().nonnegative(),
    sufficientData: z.boolean(),
  }),
  teacherComment: z.string().nullable(),
  teacherName: z.string().nullable(),
  lastActivityAt: z.string().nullable(),
});

/* ─────────────────────────────────────────────────────
 * 고민시간(초) → 사람이 읽는 표기 헬퍼 ("3분 20초" / "45초")
 * ────────────────────────────────────────────────────*/
const toThinkingTimeLabel = (secs: number): string => {
  const rounded = Math.round(secs);
  if (rounded < 60) return `${rounded}초`;
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return remainder > 0 ? `${minutes}분 ${remainder}초` : `${minutes}분`;
};

/* ─────────────────────────────────────────────────────
 * 비율(%) 정리 헬퍼 — 0~100 범위로 가두고 반올림.
 * ────────────────────────────────────────────────────*/
const toPercent = (value: number): number =>
  Math.min(100, Math.max(0, Math.round(value)));

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const domain = {
  child: ChildSchema,
  report: ChildReportSchema,
};

export const helpers = {
  toThinkingTimeLabel,
  toPercent,
};
