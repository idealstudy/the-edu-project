import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * Timer - 진행 중인 학습 일지 조회
 * GET /api/student/study-note/timer/progress
 * ────────────────────────────────────────────────────*/
export const StudentNoteTimerProgressSchema = z.object({
  id: z.number().int(),
  studentId: z.number().int(),
  title: z.string(),
  subject: z.string(),
  content: z.string(),
  status: z.string(),
  studyTime: z.number().int(),
  regDate: z.string(),
  modDate: z.string(),
  restartTime: z.string(),
  resolvedContent: z.object({
    content: z.string(),
    expiresAt: z.string(),
  }),
  ongoing: z.boolean(),
  contentPreview: z.string(),
});

/* ─────────────────────────────────────────────────────
 * Timer - 공통 Payload
 * POST /api/student/study-note/timer/start
 * POST /api/student/study-note/timer/pause/{studyNoteId}
 * POST /api/student/study-note/timer/finish/{studyNoteId}
 * POST /api/student/study-note/temp/{studyNoteId}
 * POST /api/student/study-note
 * ────────────────────────────────────────────────────*/
export const StudentNoteWritePayloadSchema = z.object({
  title: z.string(),
  subject: z.string(),
  content: z.string(),
  mediaIds: z.array(z.string()),
  finishTimestamp: z.string(),
});

/* ─────────────────────────────────────────────────────
 * Timer - 학습 시간 측정 시작 응답
 * POST /api/student/study-note/timer/start
 * ────────────────────────────────────────────────────*/
export const StudentNoteTimerStartResponseSchema = z.object({
  id: z.number().int(),
});

export const StudentNoteTimerStartPayloadSchema = StudentNoteWritePayloadSchema;
export const StudentNoteTimerFinishPayloadSchema =
  StudentNoteWritePayloadSchema;
export const StudentNoteTimerPausePayloadSchema = StudentNoteWritePayloadSchema;
export const StudentNoteTimerTempSavePayloadSchema =
  StudentNoteWritePayloadSchema;

/* ─────────────────────────────────────────────────────
 * Calendar - 월 학습 시간 조회
 * GET /api/common/study-note/month/{studentId}
 * ────────────────────────────────────────────────────*/
export const StudentNoteMonthlyQuerySchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
});

export const StudentNoteMonthlyResponseSchema = z.object({
  totalStudyTime: z.number().int(),
  list: z.array(
    z.object({
      day: z.number().int(),
      studyTime: z.number().int(),
    })
  ),
});

/* ─────────────────────────────────────────────────────
 * Calendar - 일일 학습 기록 조회
 * GET /api/common/study-note/daily/{studentId}
 * ────────────────────────────────────────────────────*/
export const StudentNoteDailyQuerySchema = z.object({
  studentId: z.number().int(),
  date: z.string(), // YYYY-MM-DD
});

export const StudentNoteDailyResponseSchema = z.object({
  totalStudyTime: z.number().int(),
  list: z.array(
    z.object({
      id: z.number().int(),
      title: z.string(),
      subject: z.string(),
      studyTime: z.number().int(),
    })
  ),
});

/* ─────────────────────────────────────────────────────
 * CRUD - 학습 일지 작성 (타이머 없이)
 * POST /api/student/study-note
 * ────────────────────────────────────────────────────*/
export const StudentNoteCreatePayloadSchema = StudentNoteWritePayloadSchema;

/* ─────────────────────────────────────────────────────
 * CRUD - 학습 일지 목록 조회
 * GET /api/common/study-note/list
 * ────────────────────────────────────────────────────*/
export const StudentNoteListItemSchema = z.object({
  id: z.number().int(),
  regDate: z.string(),
  title: z.string(),
  content: z.string(),
});

export const StudentNoteListResponseSchema = z.object({
  pageNumber: z.number().int(),
  size: z.number().int(),
  totalElements: z.number().int(),
  totalPages: z.number().int(),
  list: z.array(StudentNoteListItemSchema),
});

/* ─────────────────────────────────────────────────────
 * CRUD - 학습 일지 상세 조회
 * GET /api/common/study-note/{studyNoteId}
 * ────────────────────────────────────────────────────*/
export const StudentNoteDetailSchema = StudentNoteTimerProgressSchema;

/* ─────────────────────────────────────────────────────
 * CRUD - 학습 일지 수정
 * PUT /api/student/study-note/{studyNoteId}
 * ────────────────────────────────────────────────────*/
export const StudentNoteUpdatePayloadSchema = StudentNoteWritePayloadSchema;

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const studentNoteDto = {
  timer: {
    progress: StudentNoteTimerProgressSchema,
    startResponse: StudentNoteTimerStartResponseSchema,
  },
  calendar: {
    monthlyResponse: StudentNoteMonthlyResponseSchema,
    dailyResponse: StudentNoteDailyResponseSchema,
  },
  crud: {
    listResponse: StudentNoteListResponseSchema,
    detail: StudentNoteDetailSchema,
  },
};

export const studentNotePayload = {
  timerStart: StudentNoteTimerStartPayloadSchema,
  timerFinish: StudentNoteTimerFinishPayloadSchema,
  timerPause: StudentNoteTimerPausePayloadSchema,
  timerTempSave: StudentNoteTimerTempSavePayloadSchema,
  monthlyQuery: StudentNoteMonthlyQuerySchema,
  dailyQuery: StudentNoteDailyQuerySchema,
  create: StudentNoteCreatePayloadSchema,
  update: StudentNoteUpdatePayloadSchema,
};
