import { api } from '@/shared/api';

import {
  HomeworkPageable,
  StudentHomeworkListResponse,
} from '../../model/homework.types';
import { StudentHomeworkDetailResponse } from '../../model/homeworkDetail.types';

// GET 학생이 특정 스터디룸의 과제 목록을 조회한다.
export const getStudentHomeworkList = async (
  studyRoomId: number,
  { page, size, sortKey, keyword }: HomeworkPageable
) => {
  const response = await api.private.get<StudentHomeworkListResponse>(
    `/student/study-rooms/${studyRoomId}/homeworks`,
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

// GET 학생이 과제의 상세 내용을 조회한다.
export const getStudentHomeworkDetail = async (
  studyRoomId: number,
  homeworkId: number
) => {
  const response = await api.private.get<StudentHomeworkDetailResponse>(
    `/student/study-rooms/${studyRoomId}/homeworks/${homeworkId}`
  );
  return response.data;
};

// POST 학생이 과제를 제출한다.
export const postStudentHomework = async (
  studyRoomId: number,
  homeworkId: number,
  body: { content: string }
) => {
  await api.private.post(
    `/student/study-rooms/${studyRoomId}/homeworks/${homeworkId}/homework-students`,
    body
  );
};

// DELETE 학생이 제출한 과제를 삭제한다. 피드벡도 같이 삭제된다.
export const removeStudentHomework = async (
  studyRoomId: number,
  homeworkStudentId: number
) => {
  await api.private.delete(
    `/student/study-rooms/${studyRoomId}/homework-students/${homeworkStudentId}`
  );
};

// PATCH 학생이 제출한 과제를 수정한다.
export const updateStudentHomework = async (
  studyRoomId: number,
  homeworkStudentId: number,
  body: { content: string }
) => {
  await api.private.patch(
    `/student/study-rooms/${studyRoomId}/homework-students/${homeworkStudentId}`,
    body
  );
};
