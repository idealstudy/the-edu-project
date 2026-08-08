/**
 * 승인 디자인 v22 `srRoomManage`(prototypes/mvp-g-3역할-hub-opus.html 3554~3690) 학습 관리 처리 행.
 *
 * 지금까지 화면에는 네 행위 진입 버튼만 있고 "지금 손볼 것" 행이 통째로 없었다(QA 8차 C조 #13).
 */
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';
import { z } from 'zod';

const noteRow = z.object({
  pageId: z.number(),
  studentId: z.number(),
  studentName: z.string().nullish(),
  title: z.string().nullish(),
  unitLabel: z.string().nullish(),
  sentAt: z.string().nullish(),
  hiddenAt: z.string().nullish(),
  state: z.enum(['SENT', 'HIDDEN']),
});

const todoRow = z.object({
  todoId: z.number(),
  studentId: z.number(),
  studentName: z.string().nullish(),
  title: z.string(),
  notDoneReason: z.string().nullish(),
  rewardPoints: z.number(),
  source: z.string().nullish(),
  kind: z.enum(['NOT_DONE', 'PENDING_APPROVAL']),
});

const feedbackRow = z.object({
  wrongAnswerId: z.number(),
  studentId: z.number(),
  studentName: z.string().nullish(),
  title: z.string().nullish(),
  reason: z.string().nullish(),
  sourceLabel: z.string().nullish(),
  teacherComment: z.string().nullish(),
  studentQuestion: z.string().nullish(),
});

const learningManagement = z.object({
  noteRows: z.array(noteRow),
  todoRows: z.array(todoRow),
  feedbackRows: z.array(feedbackRow),
  pendingCount: z.number(),
});

export type NoteRow = z.infer<typeof noteRow>;
export type TodoRow = z.infer<typeof todoRow>;
export type FeedbackRow = z.infer<typeof feedbackRow>;
export type LearningManagement = z.infer<typeof learningManagement>;

export const learningManagementKeys = {
  all: ['learning-management'] as const,
  room: (studyRoomId: number) =>
    [...learningManagementKeys.all, studyRoomId] as const,
};

const get = async (studyRoomId: number): Promise<LearningManagement> => {
  const response = await api.private.get(
    `/teacher/study-rooms/${studyRoomId}/learning-management`
  );
  return unwrapEnvelope(response, learningManagement);
};

/** v22 §2 `내일로 옮기기` */
const deferTodo = async (todoId: number): Promise<void> => {
  await api.private.post(`/teacher/todos/${todoId}/defer`);
};

/** v22 §2 `확인함` */
const acknowledgeTodo = async (todoId: number): Promise<void> => {
  await api.private.post(`/teacher/todos/${todoId}/acknowledge`);
};

/** v22 §2 `승인` — 기존 추천 승인 계약을 그대로 쓴다. */
const approveRecommendation = async (todoId: number): Promise<void> => {
  await api.private.post(`/teacher/todos/recommendations/${todoId}/approve`);
};

/** v22 §2 `빼기` */
const rejectRecommendation = async (todoId: number): Promise<void> => {
  await api.private.delete(`/teacher/todos/recommendations/${todoId}`);
};

/** v22 §3 행 `확인함` */
const acknowledgeWrongAnswer = async (
  wrongAnswerId: number
): Promise<void> => {
  await api.private.post(
    `/teacher/inbox/wrong-answers/${wrongAnswerId}/acknowledge`
  );
};

/** v22 §3 머리 `전부 확인함` */
const acknowledgeAllWrongAnswers = async (): Promise<void> => {
  await api.private.post('/teacher/inbox/wrong-answers/acknowledge-all');
};

/** v22 §3 `코멘트 쓰기` / `코멘트 고치기` */
const saveWrongAnswerComment = async (
  wrongAnswerId: number,
  comment: string
): Promise<void> => {
  await api.private.post(
    `/teacher/inbox/wrong-answers/${wrongAnswerId}/comments`,
    { comment }
  );
};

export const learningManagementRepository = {
  get,
  deferTodo,
  acknowledgeTodo,
  approveRecommendation,
  rejectRecommendation,
  acknowledgeWrongAnswer,
  acknowledgeAllWrongAnswers,
  saveWrongAnswerComment,
};
