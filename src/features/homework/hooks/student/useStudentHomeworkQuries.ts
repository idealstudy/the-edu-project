import { useQuery } from '@tanstack/react-query';

import {
  getStudentHomeworkDetail,
  getStudentHomeworkList,
} from '../../api/student/homework.student.api';
import { HomeworkPageable } from '../../model/homework.types';
import { StudentHomeworkQueryKey } from '../../service/query-keys';

// 학생 과제 리스트
export const useGetStudentHomeworkList = (
  studyRoomId: number,
  query: HomeworkPageable
) => {
  return useQuery({
    queryKey: StudentHomeworkQueryKey.list(studyRoomId, query),
    queryFn: () => getStudentHomeworkList(studyRoomId, query),
    enabled: !!studyRoomId,
  });
};

// 학생 과제 상세 내용
export const useStudentHomeworkDetail = (
  studyRoomId: number,
  homeworkId: number
) => {
  return useQuery({
    queryKey: StudentHomeworkQueryKey.detail(studyRoomId, homeworkId),
    queryFn: () => getStudentHomeworkDetail(studyRoomId, homeworkId),
    enabled: !!studyRoomId && !!homeworkId,
  });
};
