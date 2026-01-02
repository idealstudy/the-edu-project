import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  postStudentHomework,
  removeStudentHomework,
  updateStudentHomework,
} from '../../api/student/homework.student.api';
import { StudentHomeworkQueryKey } from '../../service/query-keys';

// 학생이 과제 제출
export const usePostStudentHomework = (
  studyRoomId: number,
  homeworkId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      postStudentHomework(studyRoomId, homeworkId, { content }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: StudentHomeworkQueryKey.detail(studyRoomId, homeworkId),
      });
    },
  });
};

// 학생이 제출한 과제 삭제
export const useRemoveStudentHomework = (
  studyRoomId: number,
  homeworkId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (homeworkStudentId: number) =>
      removeStudentHomework(studyRoomId, homeworkStudentId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: StudentHomeworkQueryKey.detail(studyRoomId, homeworkId),
      });
    },
  });
};

// 학생이 제출한 과제 수정
export const useUpdateStudentHomework = (
  studyRoomId: number,
  homeworkId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      homeworkStudentId,
      content,
    }: {
      homeworkStudentId: number;
      content: string;
    }) => updateStudentHomework(studyRoomId, homeworkStudentId, { content }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: StudentHomeworkQueryKey.detail(studyRoomId, homeworkId),
      });
    },
  });
};
