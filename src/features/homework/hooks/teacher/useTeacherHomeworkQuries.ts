import { useQuery } from '@tanstack/react-query';

import {
  getTeacherHomeworkDetail,
  getTeacherHomeworkList,
} from '../../api/teacher/homework.teacher.api';
import { HomeworkPageable } from '../../model/homework.types';
import { TeacherHomeworkQueryKey } from '../../service/query-keys';
import { Role } from '@/entities/member';

// 과제 리스트를 불러옴
export const useGetTeacherHomeworkList = (
  role: Role | undefined,
  studyRoomId: number,
  query: HomeworkPageable
) => {
  return useQuery({
    queryKey: TeacherHomeworkQueryKey.list(studyRoomId, query),
    queryFn: () => getTeacherHomeworkList(studyRoomId, query),
    enabled: role === "ROLE_TEACHER" && !!studyRoomId,
  });
};

// 과제 상세내용을 불러옴
export const useGetTeacherHomeworkDetail = (
  studyRoomId: number,
  homeworkId: number
) => {
  return useQuery({
    queryKey: TeacherHomeworkQueryKey.detail(studyRoomId, homeworkId),
    queryFn: () => getTeacherHomeworkDetail(studyRoomId, homeworkId),
    enabled: !!studyRoomId && !!homeworkId,
  });
};
