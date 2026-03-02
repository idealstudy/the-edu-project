import { base } from '@/entities/study-room/infrastructure';
import { sharedSchema } from '@/types';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 공통 하위 DTO - 학교 정보
 * ──────────────────────────────────────────────────── */
const PreviewSchoolInfoSchema = base.schoolInfo;

/* ─────────────────────────────────────────────────────
 * 공통 하위 DTO - 선생님 정보
 * ──────────────────────────────────────────────────── */
const PreviewTeacherSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  password: z.string().nullable().optional(),
  name: z.string(),
  nickname: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  acceptRequiredTerm: z.boolean(),
  acceptOptionalTerm: z.boolean(),
  role: z.string(),
  isProfilePublic: z.boolean(),
  regDate: z.string(),
  modDate: z.string(),
  modNicknameDate: z.string().nullable().optional(),
  deletedAt: z.string().nullable().optional(),
  profile: z.string().nullable().optional(),
  deleted: z.boolean(),
});

/* ─────────────────────────────────────────────────────
 * 공통 하위 DTO - 리뷰 해석 결과
 * ──────────────────────────────────────────────────── */
const PreviewReviewResolvedContentSchema = z.object({
  content: z.string(),
  expiresAt: z.string(),
});

/* ─────────────────────────────────────────────────────
 * 공통 하위 DTO - 리뷰 아이템
 * ──────────────────────────────────────────────────── */
const PreviewReviewItemSchema = z.object({
  id: z.number().int(),
  srcMemberId: z.number().int(),
  srcMemberName: z.string(),
  dstMemberId: z.number().int(),
  dstMemberName: z.string(),
  studyRoomId: z.number().int(),
  startDate: z.string(),
  endDate: z.string(),
  content: z.string(),
  regDate: z.string(),
  modDate: z.string(),
  resolvedContent: PreviewReviewResolvedContentSchema,
});

/* ─────────────────────────────────────────────────────
 * 공통 스터디룸 DTO
 * ──────────────────────────────────────────────────── */
const StudyRoomPreviewCoreSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  modality: base.modality,
  classForm: base.classForm,
  subjectType: base.subject,
  schoolInfo: PreviewSchoolInfoSchema,
});

/* ─────────────────────────────────────────────────────
 * 스터디룸 main DTO
 * ──────────────────────────────────────────────────── */
const StudyRoomPreviewMainDataSchema = StudyRoomPreviewCoreSchema.extend({
  reviewList: z.array(PreviewReviewItemSchema),
});

/* ─────────────────────────────────────────────────────
 * 다른 스터디룸 아이템 DTO
 * ──────────────────────────────────────────────────── */
const PreviewOtherStudyRoomItemSchema = StudyRoomPreviewCoreSchema.extend({
  teacher: PreviewTeacherSchema,
  capacity: z.number().int(),
  visibility: base.visibility,
  regDate: z.string(),
  modDate: z.string(),
});

/* ─────────────────────────────────────────────────────
 * 스터디룸 미리보기 통계 data DTO
 * ──────────────────────────────────────────────────── */
const StudyRoomPreviewSideDataSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  otherStudyRooms: z.array(PreviewOtherStudyRoomItemSchema),
  numberOfTeachingNotes: z.number().int(),
  numberOfStudents: z.number().int(),
  numberOfQuestions: z.number().int(),
});

/* ─────────────────────────────────────────────────────
 * API 응답 envelope (status/message/data)
 * ──────────────────────────────────────────────────── */
const StudyRoomPreviewDetailEnvelopeSchema = sharedSchema.response(
  StudyRoomPreviewMainDataSchema
);

const StudyRoomPreviewStatsEnvelopeSchema = sharedSchema.response(
  StudyRoomPreviewSideDataSchema
);

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ──────────────────────────────────────────────────── */
export const dto = {
  schoolInfo: PreviewSchoolInfoSchema,
  teacher: PreviewTeacherSchema,
  reviewResolvedContent: PreviewReviewResolvedContentSchema,
  reviewItem: PreviewReviewItemSchema,

  core: StudyRoomPreviewCoreSchema,
  main: StudyRoomPreviewMainDataSchema,
  statsItem: PreviewOtherStudyRoomItemSchema,
  side: StudyRoomPreviewSideDataSchema,

  detailEnvelope: StudyRoomPreviewDetailEnvelopeSchema,
  statsEnvelope: StudyRoomPreviewStatsEnvelopeSchema,
};
