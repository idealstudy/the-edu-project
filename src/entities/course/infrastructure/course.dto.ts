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
 * 차시 연결 문제 정규화 helper
 *  백엔드 난이도/과목 직렬화 케이스(대/소문자·한글)를 도메인 enum으로 흡수.
 * ────────────────────────────────────────────────────*/
const toProblemDifficulty = (
  value: string
): 'TOP' | 'HIGH' | 'MID' | 'LOW' => {
  switch (value.toUpperCase()) {
    case 'TOP':
    case 'HIGHEST':
    case '최상':
      return 'TOP';
    case 'HIGH':
    case '상':
      return 'HIGH';
    case 'LOW':
    case '하':
      return 'LOW';
    default:
      return 'MID';
  }
};

const toProblemSubject = (
  value: string
): 'MATH' | 'KOREAN' | 'ENGLISH' | 'SCIENCE' => {
  switch (value.toLowerCase()) {
    case 'korean':
    case '국어':
      return 'KOREAN';
    case 'english':
    case '영어':
      return 'ENGLISH';
    case 'science':
    case '탐구':
    case '과학':
      return 'SCIENCE';
    default:
      return 'MATH';
  }
};

/* ─────────────────────────────────────────────────────
 * 차시에 연결된 오픈챌린지 문제 DTO
 *  잠긴(locked) 차시는 백엔드가 빈 배열을 내려준다.
 * ────────────────────────────────────────────────────*/
const LessonProblemDtoSchema = z
  .object({
    challengeId: z.union([z.string(), z.number()]).transform(String),
    title: z.string().optional().default('오픈챌린지 문제'),
    difficulty: z.string().optional().default('MID'),
    subject: z.string().optional().default('MATH'),
    orderIndex: z.number().optional().default(0),
  })
  .transform((raw) => ({
    challengeId: raw.challengeId,
    title: raw.title,
    difficulty: toProblemDifficulty(raw.difficulty),
    subject: toProblemSubject(raw.subject),
    orderIndex: raw.orderIndex,
  }));

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
    problems: z.array(LessonProblemDtoSchema).optional().default([]),
  })
  .transform((raw) => ({
    lessonId: raw.lessonId,
    title: raw.title,
    orderIndex: raw.orderIndex,
    isLocked: raw.isLocked ?? raw.locked ?? false,
    contentRef: raw.contentRef ?? null,
    progressStatus: raw.progressStatus,
    problems: raw.problems,
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
