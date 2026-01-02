import {
  postTeacherHomeworkFeedback,
  removeTeacherHomeworkFeedback,
  updateTeacherHomeworkFeedback,
} from '@/features/homework/api/teacher/homeworkFeedback.teacher.api';
import { TeacherHomeworkQueryKey } from '@/features/homework/service/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// 선생님이 피드백 생성
export const usePostTeacherHomeworkFeedback = (
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
    }) =>
      postTeacherHomeworkFeedback(studyRoomId, homeworkStudentId, { content }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TeacherHomeworkQueryKey.detail(studyRoomId, homeworkId),
      });
    },
  });
};

// 선생님이 피드백 수정
export const useUpdateTeacherHomeworkFeedback = (
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
    }) =>
      updateTeacherHomeworkFeedback(studyRoomId, homeworkStudentId, {
        content,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TeacherHomeworkQueryKey.detail(studyRoomId, homeworkId),
      });
    },
  });
};

// 선생님이 피드백 삭제
export const useRemoveTeacherHomeworkFeedback = (
  studyRoomId: number,
  homeworkId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (homeworkStudentId: number) =>
      removeTeacherHomeworkFeedback(studyRoomId, homeworkStudentId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TeacherHomeworkQueryKey.detail(studyRoomId, homeworkId),
      });
    },
  });
};
