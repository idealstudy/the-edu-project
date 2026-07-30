import type {
  DailyProblemQueue,
  ReviewWrongAnswerPayload,
  WrongAnswerList,
  WrongAnswerReviewResult,
} from '@/entities/wrong-answer/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { dto, payload } from './wrong-answer.dto';

/* ─────────────────────────────────────────────────────
 * [READ] 오늘의 문제 3개 조회
 * ────────────────────────────────────────────────────*/
const getDailyProblems = async (date?: string): Promise<DailyProblemQueue> => {
  const response = await api.private.get('/student/daily-problems', {
    params: date ? { date } : undefined,
  });
  return unwrapEnvelope(response, dto.dailyProblemQueue);
};

/* ─────────────────────────────────────────────────────
 * [READ] 오답 창고 조회
 * ────────────────────────────────────────────────────*/
const getWrongAnswers = async (nodeId?: number): Promise<WrongAnswerList> => {
  const response = await api.private.get('/student/wrong-answers', {
    params: nodeId ? { nodeId } : undefined,
  });
  return unwrapEnvelope(response, dto.wrongAnswerList);
};

/* ─────────────────────────────────────────────────────
 * [CREATE] 오답 회독 1회 제출
 * ────────────────────────────────────────────────────*/
const reviewWrongAnswer = async (
  id: number,
  input: ReviewWrongAnswerPayload
): Promise<WrongAnswerReviewResult> => {
  const validated = payload.review.parse(input);
  const response = await api.private.post(
    `/student/wrong-answers/${id}/reviews`,
    validated
  );
  return unwrapEnvelope(response, dto.reviewResult);
};

export const repository = {
  getDailyProblems,
  getWrongAnswers,
  reviewWrongAnswer,
};
