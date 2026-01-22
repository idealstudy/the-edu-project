import {
  postTeacherHomeworkFeedback,
  removeTeacherHomeworkFeedback,
  updateTeacherHomeworkFeedback,
} from '@/features/homework/api/teacher/homeworkFeedback.teacher.api';
import { TeacherHomeworkQueryKey } from '@/features/homework/service/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type TeacherHomeworkFeedbackPayload = {
  studyRoomId: number;
  homeworkId: number;
  homeworkStudentId: number;
  content?: string;
  mediaIds?: string[];
};

// 선생님이 피드백 생성
export const usePostTeacherHomeworkFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studyRoomId,
      homeworkStudentId,
      content,
    }: TeacherHomeworkFeedbackPayload) =>
      postTeacherHomeworkFeedback(studyRoomId, homeworkStudentId, {
        content: content!,
      }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: TeacherHomeworkQueryKey.detail(
          variables.studyRoomId,
          variables.homeworkId
        ),
      });
    },
  });
};

// 선생님이 피드백 수정
export const useUpdateTeacherHomeworkFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studyRoomId,
      homeworkStudentId,
      content,
    }: TeacherHomeworkFeedbackPayload) =>
      updateTeacherHomeworkFeedback(studyRoomId, homeworkStudentId, {
        content: content!,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: TeacherHomeworkQueryKey.detail(
          variables.studyRoomId,
          variables.homeworkId
        ),
      });
    },
  });
};

// 선생님이 피드백 삭제
export const useRemoveTeacherHomeworkFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studyRoomId,
      homeworkStudentId,
    }: TeacherHomeworkFeedbackPayload) =>
      removeTeacherHomeworkFeedback(studyRoomId, homeworkStudentId),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: TeacherHomeworkQueryKey.detail(
          variables.studyRoomId,
          variables.homeworkId
        ),
      });
    },
  });
};
