import { apiClient } from '@/lib/api';

// POST /api/study-rooms/{studyRoomId}/qna - 질문 생성
// POST /api/study-rooms/{studyRoomId}/qna/{contextId}/messages - 학생 추가 질문
// POST /api/teacher/study-rooms/{studyRoomId}/qna/{contextId}/answers - 선생님 답변

// GET /api/study-rooms/{studyRoomId}/qna - 학생 QnA 목록
export const getStudentQnAList = async (args: { studyRoomId: number }) => {
  const response = await apiClient.get(`/study-rooms/${args.studyRoomId}/qna`);

  return response.data;
};

// GET /api/study-rooms/{studyRoomId}/qna/{contextId} - 학생 QnA 상세
export const getStudentQnADetail = async (args: {
  studyRoomId: number;
  contextId: number;
}) => {
  const response = await apiClient.get(
    `/study-rooms/${args.studyRoomId}/qna/${args.contextId}`
  );

  return response;
};

// GET /api/teacher/study-rooms/{studyRoomId}/qna - 선생님 QnA 목록
export const getTeacherQnAList = async (args: { studyRoomId: number }) => {
  const response = await apiClient.get(
    `/teacher/study-rooms/${args.studyRoomId}/qna`
  );

  return response.data;
};

// GET /api/teacher/study-rooms/{studyRoomId}/qna/{contextId} - 선생님 QnA 상세
export const getTeacherQnADetail = async (args: {
  studyRoomId: number;
  contextId: number;
}) => {
  const response = await apiClient.get(
    `/teacher/study-rooms/${args.studyRoomId}/qna/${args.contextId}`
  );

  return response.data;
};
