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

/** 승인 디자인 v22 `sReviewOk` 3219 `질문 남기기` — 학생이 선생님 코멘트에 되묻는다. */
const askTeacher = async (id: number, question: string) => {
  const response = await api.private.post(
    `/student/wrong-answers/${id}/questions`,
    { question }
  );
  return unwrapEnvelope(response, dto.wrongAnswerItem);
};

const getTeacherInbox = async () => {
  const response = await api.private.get('/teacher/inbox');
  return unwrapEnvelope(response, dto.teacherInbox);
};

const saveTeacherComment = async (id: number, comment: string) => {
  const validated = payload.comment.parse({ comment });
  const response = await api.private.post(
    `/teacher/inbox/wrong-answers/${id}/comments`,
    validated
  );
  return unwrapEnvelope(response, dto.wrongAnswerItem);
};

export const repository = {
  getDailyProblems,
  getWrongAnswers,
  reviewWrongAnswer,
  askTeacher,
  getTeacherInbox,
  saveTeacherComment,
};
