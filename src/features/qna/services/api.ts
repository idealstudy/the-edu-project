import { CommonResponse, Pageable, PaginationMeta, apiClient } from '@/lib/api';

import { QnADetailResponse, QnAListItem } from '../type';

// POST /api/study-rooms/{studyRoomId}/qna - 질문 생성
export const writeQnA = async (args: {
  studyRoomId: number;
  title: string;
  content: string;
}) => {
  const data = { title: args.title, content: args.content };
  await apiClient.post(`/study-rooms/${args.studyRoomId}/qna`, data);
};

// POST /api/study-rooms/{studyRoomId}/qna/{contextId}/messages - 학생 추가 질문
export const writeStudentQnAMessage = async (args: {
  studyRoomId: number;
  contextId: number;
  content: string;
}) => {
  await apiClient.post(
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
  await apiClient.post(
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
  const response = (
    await apiClient.get<
      CommonResponse<PaginationMeta & { content: QnAListItem[] }>
    >(`/study-rooms/${args.studyRoomId}/qna`, {
      params: {
        status: args.status,
        page: args.pageable.page,
        size: args.pageable.size,
        sort: args.sort ?? args.pageable.sort,
      },
    })
  ).data;

  return response.data;
};

// GET /api/study-rooms/{studyRoomId}/qna/{contextId} - 학생 QnA 상세
export const getStudentQnADetail = async (args: {
  studyRoomId: number;
  contextId: number;
}) => {
  const response = (
    await apiClient.get<CommonResponse<QnADetailResponse>>(
      `/study-rooms/${args.studyRoomId}/qna/${args.contextId}`
    )
  ).data;

  return response.data;
};

// GET /api/teacher/study-rooms/{studyRoomId}/qna - 선생님 QnA 목록
export const getTeacherQnAList = async (args: {
  studyRoomId: number;
  pageable: Pageable;
  status?: string;
  sort?: string;
}) => {
  const response = (
    await apiClient.get<
      CommonResponse<PaginationMeta & { content: QnAListItem[] }>
    >(`/teacher/study-rooms/${args.studyRoomId}/qna`, {
      params: {
        status: args.status,
        page: args.pageable.page,
        size: args.pageable.size,
        sort: args.sort ?? args.pageable.sort,
      },
    })
  ).data;

  return response.data;
};

// GET /api/teacher/study-rooms/{studyRoomId}/qna/{contextId} - 선생님 QnA 상세
export const getTeacherQnADetail = async (args: {
  studyRoomId: number;
  contextId: number;
}) => {
  const response = (
    await apiClient.get<CommonResponse<QnADetailResponse>>(
      `/teacher/study-rooms/${args.studyRoomId}/qna/${args.contextId}`
    )
  ).data;

  return response.data;
};
