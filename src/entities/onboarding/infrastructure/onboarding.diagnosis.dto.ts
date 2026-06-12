import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 모의고사 한방진단 요청 항목 DTO
 *  POST /api/common/onboarding/diagnosis body item
 * ────────────────────────────────────────────────────*/
const DiagnosisItemDtoSchema = z.object({
  treeNodeId: z.string(),
  weak: z.boolean(),
});

/* ─────────────────────────────────────────────────────
 * 진단 요청 바디 DTO — { items: [...] }
 * ────────────────────────────────────────────────────*/
const DiagnosisRequestDtoSchema = z.object({
  items: z.array(DiagnosisItemDtoSchema),
});

/* ─────────────────────────────────────────────────────
 * 진단 응답 DTO
 *  백엔드 응답 스펙이 확정 전이라 관대하게 — 갱신 노드 수만 추출.
 *  (없어도 통과. 약점 트리는 GET /common/tree 로 다시 읽는다.)
 * ────────────────────────────────────────────────────*/
const DiagnosisResultDtoSchema = z
  .object({
    diagnosedCount: z.number().optional().default(0),
  })
  .passthrough()
  .optional()
  .default({ diagnosedCount: 0 });

export const diagnosisDto = {
  item: DiagnosisItemDtoSchema,
  request: DiagnosisRequestDtoSchema,
  result: DiagnosisResultDtoSchema,
};
