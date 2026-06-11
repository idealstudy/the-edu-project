import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 코스 목록 / 상세 DTO
 *  (백엔드 isPublished 직렬화: Lombok getter `isPublished` → `published`)
 * ────────────────────────────────────────────────────*/
const PublishedSchema = z
  .union([z.boolean(), z.undefined()])
  .transform((v) => v ?? false);

const CourseListItemDtoSchema = z
  .object({
    courseId: z.number(),
    title: z.string(),
    subject: z.string(),
    description: z.string().nullable().optional(),
    price: z.number().optional().default(0),
    freeLessonCount: z.number().optional().default(0),
    isPublished: z.boolean().optional(),
    published: z.boolean().optional(),
  })
  .transform((raw) => ({
    courseId: raw.courseId,
    title: raw.title,
    subject: raw.subject,
    description: raw.description ?? null,
    price: raw.price,
    freeLessonCount: raw.freeLessonCount,
    isPublished: PublishedSchema.parse(raw.isPublished ?? raw.published),
  }));

const CourseDetailDtoSchema = z
  .object({
    courseId: z.number(),
    title: z.string(),
    subject: z.string(),
    description: z.string().nullable().optional(),
    price: z.number().optional().default(0),
    freeLessonCount: z.number().optional().default(0),
    isPublished: z.boolean().optional(),
    published: z.boolean().optional(),
    lessonCount: z.number().optional().default(0),
  })
  .transform((raw) => ({
    courseId: raw.courseId,
    title: raw.title,
    subject: raw.subject,
    description: raw.description ?? null,
    price: raw.price,
    freeLessonCount: raw.freeLessonCount,
    isPublished: PublishedSchema.parse(raw.isPublished ?? raw.published),
    lessonCount: raw.lessonCount,
  }));

/* ─────────────────────────────────────────────────────
 * 코스 목록 페이지네이션 DTO (PageResponse)
 * ────────────────────────────────────────────────────*/
const CoursePageDtoSchema = z.object({
  content: z.array(z.unknown()),
  hasNext: z.boolean(),
});

/* ─────────────────────────────────────────────────────
 * 차시(게이팅) DTO (LessonWithGatingResponse)
 * ────────────────────────────────────────────────────*/
const LessonDtoSchema = z
  .object({
    lessonId: z.number(),
    title: z.string(),
    orderIndex: z.number(),
    isLocked: z.boolean().optional(),
    locked: z.boolean().optional(),
    contentRef: z.string().nullable().optional(),
    progressStatus: z
      .enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])
      .optional()
      .default('NOT_STARTED'),
  })
  .transform((raw) => ({
    lessonId: raw.lessonId,
    title: raw.title,
    orderIndex: raw.orderIndex,
    isLocked: raw.isLocked ?? raw.locked ?? false,
    contentRef: raw.contentRef ?? null,
    progressStatus: raw.progressStatus,
  }));

/* ─────────────────────────────────────────────────────
 * 수강 신청 / 진도 DTO
 * ────────────────────────────────────────────────────*/
const EnrollResultDtoSchema = z.object({
  result: z.enum(['ENROLLED', 'PENDING_PAYMENT']),
  orderId: z.number().nullable().optional(),
});

const ProgressResultDtoSchema = z.object({
  progressId: z.number(),
  lessonId: z.number(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  completedAt: z.string().nullable().optional(),
});

export const dto = {
  listItem: CourseListItemDtoSchema,
  detail: CourseDetailDtoSchema,
  page: CoursePageDtoSchema,
  lesson: LessonDtoSchema,
  enrollResult: EnrollResultDtoSchema,
  progressResult: ProgressResultDtoSchema,
};

/* ─────────────────────────────────────────────────────
 * Payload
 * ────────────────────────────────────────────────────*/
const UpdateProgressPayloadSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED']),
});

export const payload = {
  updateProgress: UpdateProgressPayloadSchema,
};
