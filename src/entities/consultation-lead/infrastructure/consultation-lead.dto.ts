import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * ⚠️ 이 엔티티는 기존 `entities/consultation`(스터디룸 상담기록,
 * ConsultationRecord)과 다른 도메인이다. 비회원 공개 리드/사례를
 * 다룬다 — api-contract-public-portal-v1.md §4.2·4.3,
 * frd-public-portal-v1.md §6.3(재사용 금지 판정) 근거로 신규 분리.
 * ────────────────────────────────────────────────────*/

/* ─────────────────────────────────────────────────────
 * POST /api/public/consultation-leads — 비회원 상담 접수
 * ────────────────────────────────────────────────────*/
export const ConsultationLeadRoleSchema = z.enum(['STUDENT', 'PARENT']);

const ConsultationLeadPayloadSchema = z.object({
  role: ConsultationLeadRoleSchema,
  name: z.string().max(30).optional(),
  contact: z.string().min(1).max(100),
  birthYear: z.number().int(),
  message: z.string().min(10).max(1000),
  consentPrivacy: z.literal(true),
  consentPublish: z.boolean().optional().default(false),
  consentVersion: z.string().max(20),
  source: z.string().max(50).optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
});

const ConsultationLeadResponseSchema = z.object({
  receiptNo: z.string(),
});

/* ─────────────────────────────────────────────────────
 * GET /api/public/consultation-cases — 동의받은 익명 사례
 * (leadId·name·contact·원문 message 필드가 구조적으로 없다 — R2)
 * ────────────────────────────────────────────────────*/
const ConsultationCaseListItemDtoSchema = z.object({
  caseId: z.number(),
  question: z.string(),
  summary: z.string(),
  category: z.string(),
  avatarKey: z.string(),
  publishedAt: z.string(),
});

const ConsultationCaseListDtoSchema = z.object({
  content: z.array(ConsultationCaseListItemDtoSchema),
  number: z.number(),
  size: z.number(),
  totalElements: z.number(),
});

const ConsultationCaseDetailDtoSchema = ConsultationCaseListItemDtoSchema.extend(
  {
    body: z.string(),
  }
);

export const dto = {
  leadPayload: ConsultationLeadPayloadSchema,
  leadResponse: ConsultationLeadResponseSchema,
  caseListItem: ConsultationCaseListItemDtoSchema,
  caseList: ConsultationCaseListDtoSchema,
  caseDetail: ConsultationCaseDetailDtoSchema,
};
