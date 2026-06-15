import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 진도 상태
 * ────────────────────────────────────────────────────*/
const ProgressStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
]);

/* ─────────────────────────────────────────────────────
 * 코스 목록 아이템 Domain
 *  GET /api/public/courses
 * ────────────────────────────────────────────────────*/
const CourseListItemSchema = z.object({
  courseId: z.number(),
  title: z.string(),
  subject: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  freeLessonCount: z.number(),
  isPublished: z.boolean(),
});

/* ─────────────────────────────────────────────────────
 * 코스 상세 Domain
 *  GET /api/public/courses/{id}
 * ────────────────────────────────────────────────────*/
const CourseDetailSchema = CourseListItemSchema.extend({
  lessonCount: z.number(),
});

/* ─────────────────────────────────────────────────────
 * 차시에 연결된 오픈챌린지 문제 Domain
 *  잠긴 차시는 빈 배열([]).
 * ────────────────────────────────────────────────────*/
const LessonProblemSchema = z.object({
  challengeId: z.string(),
  title: z.string(),
  difficulty: z.enum(['TOP', 'HIGH', 'MID', 'LOW']),
  subject: z.enum(['MATH', 'KOREAN', 'ENGLISH', 'SCIENCE']),
  orderIndex: z.number(),
});

/* ─────────────────────────────────────────────────────
 * 차시(맛보기 게이팅 반영) Domain
 *  GET /api/common/courses/{id}/lessons
 *  - isLocked=true 면 contentRef=null (잠금) + problems=[]
 * ────────────────────────────────────────────────────*/
const LessonSchema = z.object({
  lessonId: z.number(),
  title: z.string(),
  orderIndex: z.number(),
  isLocked: z.boolean(),
  contentRef: z.string().nullable(),
  progressStatus: ProgressStatusSchema,
  problems: z.array(LessonProblemSchema).default([]),
});

/* ─────────────────────────────────────────────────────
 * 수강 신청 결과 Domain
 *  POST /api/common/courses/{id}/enroll
 * ────────────────────────────────────────────────────*/
const EnrollResultSchema = z.object({
  result: z.enum(['ENROLLED', 'PENDING_PAYMENT']),
  orderId: z.number().nullable(),
});

/* ─────────────────────────────────────────────────────
 * 진도 업데이트 결과 Domain
 *  POST /api/common/lessons/{id}/progress
 * ────────────────────────────────────────────────────*/
const ProgressResultSchema = z.object({
  progressId: z.number(),
  lessonId: z.number(),
  status: ProgressStatusSchema,
  completedAt: z.string().nullable(),
});

export const domain = {
  progressStatus: ProgressStatusSchema,
  listItem: CourseListItemSchema,
  detail: CourseDetailSchema,
  lesson: LessonSchema,
  lessonProblem: LessonProblemSchema,
  enrollResult: EnrollResultSchema,
  progressResult: ProgressResultSchema,
};
