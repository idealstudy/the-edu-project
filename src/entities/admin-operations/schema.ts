import { sharedSchema } from '@/types';
import { z } from 'zod';

const publicPosting = z.object({
  postingId: z.number().int().positive(),
  examId: z.number().int().positive(),
  title: z.string(),
  questionCount: z.number().int().nonnegative(),
  audience: z.enum(['ALL', 'NO_STUDY_ROOM']),
  openAt: z.string(),
  closeAt: z.string().nullable(),
  postedAt: z.string(),
  attemptCount: z.number().int().nonnegative(),
  hasCutoff: z.boolean(),
});

const publicClone = z.object({
  examId: z.number().int().positive(),
  title: z.string(),
  questionCount: z.number().int().nonnegative(),
  gradeBasis: z.string(),
  sourceExamId: z.number().int().positive(),
  sourceQuestionCount: z.number().int().nonnegative(),
  teacherName: z.string(),
  clonedAt: z.string(),
});

const publicHall = z.object({
  postings: z.array(publicPosting),
  clones: z.array(publicClone),
});

const studyRoom = z.object({
  studyRoomId: z.number().int().positive(),
  name: z.string(),
  teacherName: z.string(),
  studentName: z.string(),
  studentCount: z.number().int().nonnegative(),
  state: z.enum(['ACTIVE', 'RECRUITING', 'ENDED']),
  startedAt: z.string().nullable(),
  lastLessonAt: z.string().nullable(),
});

const studyRooms = z.object({
  content: z.array(studyRoom),
  totalElements: z.number().int().nonnegative(),
  stateCounts: z.record(z.string(), z.number().int().nonnegative()),
});

const consultationCase = z.object({
  caseId: z.number().int().positive(),
  status: z.enum(['RECEIVED', 'IN_PROGRESS', 'ANSWERED']),
  title: z.string(),
  message: z.string(),
  senderName: z.string(),
  senderRole: z.string(),
  senderContact: z.string().nullable(),
  senderMemberId: z.number().int().positive().nullish(),
  receivedAt: z.string().nullable(),
  assigneeName: z.string().nullable(),
  answer: z.string().nullable(),
  answeredAt: z.string().nullable(),
  delayed: z.boolean(),
});

const consultationCases = z.object({
  content: z.array(consultationCase),
  totalElements: z.number().int().nonnegative(),
  statusCounts: z.record(z.string(), z.number().int().nonnegative()),
  // 지연 건수. 받은 지 24시간이 지난 접수 건 수이며 지연 칩에 그대로 표시한다.
  delayedCount: z.number().int().nonnegative(),
});

const summary = z.object({
  totalMemberCount: z.number().int().nonnegative(),
  newMemberCount: z.number().int().nonnegative(),
  consultationCount: z.number().int().nonnegative(),
  averageFirstResponseMinutes: z.number().int().nonnegative().nullable(),
  activeStudyRoomCount: z.number().int().nonnegative(),
  challengeCount: z.number().int().nonnegative(),
  mostCommonConsultationCategory: z.string().nullable(),
});

export const adminOperationsSchema = {
  publicPosting,
  publicPostingResponse: sharedSchema.response(publicPosting),
  publicHall,
  publicHallResponse: sharedSchema.response(publicHall),
  studyRooms,
  studyRoomsResponse: sharedSchema.response(studyRooms),
  consultationCases,
  consultationCasesResponse: sharedSchema.response(consultationCases),
  consultationCase,
  consultationCaseResponse: sharedSchema.response(consultationCase),
  summary,
  summaryResponse: sharedSchema.response(summary),
  consultationUpdate: z.object({
    status: z.enum(['IN_PROGRESS', 'ANSWERED']),
    answer: z.string().trim().max(5000).optional(),
  }),
  publicPost: z.object({
    examId: z.number().int().positive(),
    audience: z.enum(['ALL', 'NO_STUDY_ROOM']),
    openAt: z.string().datetime(),
    closeAt: z.string().datetime().nullable(),
  }),
};

export type AdminPublicHall = z.infer<typeof publicHall>;
export type AdminStudyRoomList = z.infer<typeof studyRooms>;
export type AdminConsultationList = z.infer<typeof consultationCases>;
export type AdminConsultationCase = z.infer<typeof consultationCase>;
export type AdminSummary = z.infer<typeof summary>;
