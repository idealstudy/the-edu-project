import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 자녀 1명 DTO (백엔드 ChildrenListResponse.ChildItem)
 * ────────────────────────────────────────────────────*/
const ChildItemDtoSchema = z.object({
  childId: z.number(),
  childName: z.string().optional().default(''),
});

/* ─────────────────────────────────────────────────────
 * 자녀 목록 DTO (백엔드 ChildrenListResponse)
 *  - { children: [...] } envelope를 벗겨 배열만 노출.
 * ────────────────────────────────────────────────────*/
const ChildrenListDtoSchema = z
  .object({
    children: z.array(ChildItemDtoSchema).optional().default([]),
  })
  .transform((value) => value.children);

/* ─────────────────────────────────────────────────────
 * 자녀 학습 리포트 DTO (백엔드 ChildReportResponse)
 *  - 누락 필드는 안전 기본값으로 채운다(빈 데이터 graceful).
 * ────────────────────────────────────────────────────*/
const ChildReportDtoSchema = z.object({
  childId: z.number().optional().default(0),
  childName: z.string().optional().default(''),
  from: z.string().optional().default(''),
  to: z.string().optional().default(''),
  totalCompleted: z.number().optional().default(0),
  avgThinkingTimeSecs: z.number().optional().default(0),
  aiUsageRate: z.number().optional().default(0),
  solutionViewRate: z.number().optional().default(0),
  expectedGradeRange: z.string().optional().default('데이터 없음'),
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
  teacherComment: z.string().nullable().optional().default(null),
  teacherName: z.string().nullable().optional().default(null),
  lastActivityAt: z.string().nullable().optional().default(null),
});

/* ─────────────────────────────────────────────────────
 * 리포트 조회 기간 Payload
 * ────────────────────────────────────────────────────*/
const ReportRangeParamsSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const dto = {
  childrenList: ChildrenListDtoSchema,
  childItem: ChildItemDtoSchema,
  report: ChildReportDtoSchema,
};

export const payload = {
  reportRange: ReportRangeParamsSchema,
};
