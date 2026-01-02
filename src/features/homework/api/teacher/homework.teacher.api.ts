import { api } from '@/shared/api';

import {
  HomeworkPageable,
  TeacherHomeworkListResponse,
  TeacherHomeworkRequest,
} from '../../model/homework.types';
import { TeacherHomeworkDetailResponse } from '../../model/homeworkDetail.types';

// GET 선생님이 특정 스터디룸의 과제 목록을 조회한다.
export const getTeacherHomeworkList = async (
  studyRoomId: number,
  { page, size, sortKey, keyword }: HomeworkPageable
) => {
  const response = await api.private.get<TeacherHomeworkListResponse>(
    `/teacher/study-rooms/${studyRoomId}/homeworks`,
    {
      params: {
        page,
        size,
        sortKey,
        keyword,
      },
    }
  );
  return response.data;
};

// GET 선생님이 과제의 상세 정보를 조회한다.
export const getTeacherHomeworkDetail = async (
  studyRoomId: number,
  homeworkId: number
) => {
  const response = await api.private.get<TeacherHomeworkDetailResponse>(
    `/teacher/study-rooms/${studyRoomId}/homeworks/${homeworkId}`
  );
  return response.data;
};

// POST 선생님이 과제를 생성한다.
export const postTeacherHomeworkCreate = async (
  studyRoomId: number,
  body: TeacherHomeworkRequest
) => {
  await api.private.post(`/teacher/study-rooms/${studyRoomId}/homeworks`, body);
};

// DELETE 선생님이 과제를 삭제한다.
export const removeTeacherHomework = async (
  studyRoomId: number,
  homeworkId: number
) => {
  await api.private.delete(
    `/teacher/study-rooms/${studyRoomId}/homeworks/${homeworkId}`
  );
};

// PATCH 선생님이 과제를 수정한다.
export const updateTeacherHomwork = async (
  studyRoomId: number,
  homeworkId: number,
  body: TeacherHomeworkRequest
) => {
  await api.private.patch(
    `/teacher/study-rooms/${studyRoomId}/homeworks/${homeworkId}`,
    body
  );
};
