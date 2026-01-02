import { api } from '@/shared/api';

import {
  HomeworkPageable,
  StudentHomeworkListResponse,
} from '../../model/homework.types';

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
