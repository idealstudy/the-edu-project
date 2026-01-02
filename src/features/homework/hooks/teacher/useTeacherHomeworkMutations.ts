import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  postTeacherHomeworkCreate,
  removeTeacherHomework,
  updateTeacherHomework,
} from '../../api/teacher/homework.teacher.api';
import { TeacherHomeworkRequest } from '../../model/homework.types';
import { TeacherHomeworkQueryKey } from '../../service/query-keys';

// 선생님이 과제 생성
export const useTeacherCreateHomework = (studyRoomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TeacherHomeworkRequest) =>
      postTeacherHomeworkCreate(studyRoomId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TeacherHomeworkQueryKey.listBase(studyRoomId),
      });
    },
  });
};

// 선생님이 과제 삭제
export const useTeacherRemoveHomework = (
  studyRoomId: number,
  homeworkId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeTeacherHomework(studyRoomId, homeworkId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TeacherHomeworkQueryKey.listBase(studyRoomId),
      });
    },
  });
};

// 선생님이 과제 수정
export const useTeacherUpdateTeacherHomework = (
  studyRoomId: number,
  homeworkId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TeacherHomeworkRequest) =>
      updateTeacherHomework(studyRoomId, homeworkId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TeacherHomeworkQueryKey.listBase(studyRoomId),
      });
    },
  });
};
