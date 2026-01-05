import { z } from 'zod';

const NotificationCategorySchema = z.enum([
  'SYSTEM',
  'HOMEWORK',
  'TEACHING_NOTE',
  'STUDY_ROOM',
  'QNA',
]);

/**
 * targetMetadata: 카테고리별 메타데이터
 * - QNA: qnaId, studyRoomId
 * - STUDY_ROOM: studyRoomId
 * - TEACHING_NOTE: teachingNoteId
 * TODO
 * - SYSTEM: noticeId (예정)
 * - HOMEWORK: homeworkId (예정)
 */
const TargetMetadataSchema = z.object({
  qnaId: z.string().optional(),
  studyRoomId: z.string().optional(),
  teachingNoteId: z.string().optional(),
  homeworkId: z.string().optional(),
});

const NotificationSchema = z.object({
  id: z.number().int().nonnegative(),
  message: z.string(),
  category: NotificationCategorySchema,
  targetMetadata: TargetMetadataSchema,
  regDate: z.string().nullable(),
  read: z.boolean(),
});

export const base = {
  category: NotificationCategorySchema,
  schema: NotificationSchema,
};
