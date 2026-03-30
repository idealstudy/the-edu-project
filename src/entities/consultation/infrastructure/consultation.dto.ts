import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 문의 답변 DTO
 * ────────────────────────────────────────────────────*/
const ConsultationAnswerDtoSchema = z.object({
  id: z.number(),
  content: z.string(),
  regDate: z.string(),
  modDate: z.string(),
});

/* ─────────────────────────────────────────────────────
 * 문의 상세 DTO
 * ────────────────────────────────────────────────────*/
const ConsultationDetailDtoSchema = z.object({
  id: z.number(),
  inquirerId: z.number(),
  inquirerName: z.string(),
  targetTeacherId: z.number(),
  studyRoomId: z.number().nullish(),
  studyRoomName: z.string().nullish(),
  title: z.string(),
  content: z.string(),
  status: z.enum(['PENDING', 'ANSWERED']),
  regDate: z.string(),
  modDate: z.string(),
  answer: ConsultationAnswerDtoSchema.optional(),
});

/* ─────────────────────────────────────────────────────
 * 문의 등록 Payload
 * POST
 * ────────────────────────────────────────────────────*/
const CreateConsultationPayloadSchema = z.object({
  targetTeacherId: z.number(),
  studyRoomId: z.number().optional(),
  title: z.string(),
  content: z.string(),
});

/* ─────────────────────────────────────────────────────
 * 답변 등록 Payload
 * POST
 * ────────────────────────────────────────────────────*/
const ConsultationAnswerPayloadSchema = z.object({
  content: z.string(),
});

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const dto = {
  detail: ConsultationDetailDtoSchema,
};

export const payload = {
  create: CreateConsultationPayloadSchema,
  createAnswer: ConsultationAnswerPayloadSchema,
};
