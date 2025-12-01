import { api } from '@/shared/api';
import { CommonResponse, Pageable, PaginationMeta } from '@/types/http';

import { QnADetailResponse, QnAListItem } from '../types';

// POST /api/study-rooms/{studyRoomId}/qna - 질문 생성
export const writeQnA = async (args: {
  studyRoomId: number;
  title: string;
  content: string;
}) => {
  const data = { title: args.title, content: args.content };
  await api.private.post(`/study-rooms/${args.studyRoomId}/qna`, data);
};

// POST /api/study-rooms/{studyRoomId}/qna/{contextId}/messages - 학생 추가 질문
export const writeStudentQnAMessage = async (args: {
  studyRoomId: number;
  contextId: number;
  content: string;
}) => {
  await api.private.post(
    `/study-rooms/${args.studyRoomId}/qna/${args.contextId}/messages`,
    { content: args.content }
  );
};

// POST /api/teacher/study-rooms/{studyRoomId}/qna/{contextId}/answers - 선생님 답변
export const writeTeacherQnAMessage = async (args: {
  studyRoomId: number;
  contextId: number;
  content: string;
}) => {
  await api.private.post(
    `/teacher/study-rooms/${args.studyRoomId}/qna/${args.contextId}/answers`,
    {
      content: args.content,
    }
  );
};

// GET /api/study-rooms/{studyRoomId}/qna - 학생 QnA 목록
export const getStudentQnAList = async (args: {
  studyRoomId: number;
  pageable: Pageable;
  status?: string;
  sort?: string;
}) => {
  const response = await api.private.get<
    CommonResponse<PaginationMeta & { content: QnAListItem[] }>
  >(`/study-rooms/${args.studyRoomId}/qna`, {
    params: {
      status: args.status,
      page: args.pageable.page,
      size: args.pageable.size,
      sort: args.sort ?? args.pageable.sort,
    },
  });

  return response.data;
};

// GET /api/study-rooms/{studyRoomId}/qna/{contextId} - 학생 QnA 상세
export const getStudentQnADetail = async (args: {
  studyRoomId: number;
  contextId: number;
}) => {
  const response = await api.private.get<CommonResponse<QnADetailResponse>>(
    `/study-rooms/${args.studyRoomId}/qna/${args.contextId}`
  );

  return response.data;
};

// GET /api/teacher/study-rooms/{studyRoomId}/qna - 선생님 QnA 목록
export const getTeacherQnAList = async (args: {
  studyRoomId: number;
  pageable: Pageable;
  status?: string;
  sort?: string;
}) => {
  const response = await api.private.get<
    CommonResponse<PaginationMeta & { content: QnAListItem[] }>
  >(`/teacher/study-rooms/${args.studyRoomId}/qna`, {
    params: {
      status: args.status,
      page: args.pageable.page,
      size: args.pageable.size,
      sort: args.sort ?? args.pageable.sort,
    },
  });

  return response.data;
};

// GET /api/teacher/study-rooms/{studyRoomId}/qna/{contextId} - 선생님 QnA 상세
export const getTeacherQnADetail = async (args: {
  studyRoomId: number;
  contextId: number;
}) => {
  const response = await api.private.get<CommonResponse<QnADetailResponse>>(
    `/teacher/study-rooms/${args.studyRoomId}/qna/${args.contextId}`
  );

  return response.data;
};

// PATCH /api/study-rooms/{studyRoomId}/qna/{contextId}/messages/{messageId} - 학생 메시지 수정
export const updateStudentQnAMessage = async (args: {
  studyRoomId: number;
  contextId: number;
  messageId: number;
  content: string;
}) => {
  await api.private.patch(
    `/study-rooms/${args.studyRoomId}/qna/${args.contextId}/messages/${args.messageId}`,
    { content: args.content }
  );
};

// DELETE /api/study-rooms/{studyRoomId}/qna/{contextId}/messages/{messageId} - 학생 메시지 삭제
export const deleteStudentQnAMessage = async (args: {
  studyRoomId: number;
  contextId: number;
  messageId: number;
}) => {
  await api.private.delete(
    `/study-rooms/${args.studyRoomId}/qna/${args.contextId}/messages/${args.messageId}`
  );
};

// PATCH /api/study-rooms/{studyRoomId}/qna/{contextId}/messages/{messageId} - 선생님 메시지 수정
// 백엔드 스펙: PATCH/DELETE는 /api/study-rooms/... 사용 (학생/선생님 공통)
// answers는 POST만 존재하고, 수정/삭제는 messages 엔드포인트 사용
export const updateTeacherQnAMessage = async (args: {
  studyRoomId: number;
  contextId: number;
  messageId: number;
  content: string;
}) => {
  await api.private.patch(
    `/study-rooms/${args.studyRoomId}/qna/${args.contextId}/messages/${args.messageId}`,
    { content: args.content }
  );
};

// DELETE /api/study-rooms/{studyRoomId}/qna/{contextId}/messages/{messageId} - 선생님 메시지 삭제
// 백엔드 스펙: PATCH/DELETE는 /api/study-rooms/... 사용 (학생/선생님 공통)
// answers는 POST만 존재하고, 수정/삭제는 messages 엔드포인트 사용
export const deleteTeacherQnAMessage = async (args: {
  studyRoomId: number;
  contextId: number;
  messageId: number;
}) => {
  await api.private.delete(
    `/study-rooms/${args.studyRoomId}/qna/${args.contextId}/messages/${args.messageId}`
  );
};
