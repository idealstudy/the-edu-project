import { StudyNoteQueryKey } from '@/entities/study-note';
import { teacherMutationOptions } from '@/features/study-notes/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const createTeacherStudyNoteMutations = () => {
  // 노트 수정
  const useUpdateStudyNote = () => {
    const queryClient = useQueryClient();

    return useMutation({
      ...teacherMutationOptions.update(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [StudyNoteQueryKey.list],
          exact: false,
        });
      },
    });
  };

  // 노트 그룹 이동
  const useMoveNoteToGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
      ...teacherMutationOptions.moveToGroup(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [StudyNoteQueryKey.list],
          exact: false,
        });
      },
    });
  };

  // 노트 그룹 해제
  const useRemoveNoteFromGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
      ...teacherMutationOptions.removeFromGroup(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [StudyNoteQueryKey.list],
          exact: false,
        });
      },
    });
  };

  return {
    useUpdateStudyNote,
    useMoveNoteToGroup,
    useRemoveNoteFromGroup,
  };
};
