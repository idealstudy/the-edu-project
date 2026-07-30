import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * [READ] 오늘의 문제 큐
 * ────────────────────────────────────────────────────*/
const dailyProblemItem = z.object({
  position: z.number().int().positive(),
  provider: z.enum(['TEACHER', 'OPEN_CHALLENGE_RECOMMEND']),
  wrongAnswerId: z.number().int().positive().nullable(),
  challengeId: z.number().int().positive().nullable(),
  reason: z.string(),
  difficulty: z.string().nullable(),
  nationalWrongRate: z.number().int().min(0).max(100).nullable(),
  stampsFilled: z.number().int().nonnegative(),
  stampsTotal: z.number().int().positive(),
  solvedStatus: z.string(),
});

const dailyProblemQueue = z.object({
  queueDate: z.string(),
  backlogCount: z.number().int().nonnegative(),
  onboarding: z.boolean(),
  items: z.array(dailyProblemItem),
});

/* ─────────────────────────────────────────────────────
 * [READ] 오답 창고
 * ────────────────────────────────────────────────────*/
const wrongAnswerItem = z.object({
  id: z.number().int().positive(),
  studentId: z.number().int().positive(),
  sourceType: z.enum(['EXAM', 'TEACHER', 'SELF_REVIEW']),
  challengeId: z.number().int().positive().nullable(),
  challengeAttemptId: z.number().int().positive().nullable(),
  examAnswerId: z.number().int().positive().nullable(),
  questionSnapshot: z.record(z.string(), z.unknown()).nullable(),
  treeNodeId: z.number().int().positive().nullable(),
  status: z.enum(['ACTIVE', 'GRADUATED']),
  reviewCount: z.number().int().min(0).max(5),
  hintFreeSolveCount: z.number().int().nonnegative(),
  lastReviewCorrect: z.boolean().nullable(),
  wrongAgainCount: z.number().int().nonnegative(),
  nextReviewAt: z.string().nullable(),
  graduatedAt: z.string().nullable(),
  difficulty: z.string().nullable(),
  nationalWrongRate: z.number().int().min(0).max(100).nullable(),
  title: z.string().nullable(),
  questionText: z.string().nullable(),
  questionImageUrl: z.string().nullable(),
});

const wrongAnswerList = z.object({
  totalCount: z.number().int().nonnegative(),
  items: z.array(wrongAnswerItem),
});

/* ─────────────────────────────────────────────────────
 * [CREATE] 회독 제출
 * ────────────────────────────────────────────────────*/
const reviewPayload = z.object({
  isCorrect: z.boolean(),
  usedHint: z.boolean(),
  usedAi: z.boolean(),
});

const reviewResult = z.object({
  reviewNo: z.number().int().positive(),
  reviewCount: z.number().int().min(1).max(5),
  graduated: z.boolean(),
  nextReviewAt: z.string().nullable(),
  hintFreeSolveCount: z.number().int().nonnegative(),
  stampsFilled: z.number().int().nonnegative(),
  stampsTotal: z.number().int().positive(),
});

export const dto = {
  dailyProblemItem,
  dailyProblemQueue,
  wrongAnswerItem,
  wrongAnswerList,
  reviewResult,
};

export const payload = {
  review: reviewPayload,
};
