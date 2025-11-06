import { teacherMutationOptions } from '@/features/study-notes/api';
import { useMutation } from '@tanstack/react-query';

export const createTeacherStudyNoteMutations = () => {
  // 노트 수정
  const useUpdateStudyNote = () => {
    return useMutation({
      ...teacherMutationOptions.update(),
    });
  };

  // 노트 그룹 이동(설정/해제)
  const useMoveNoteToGroup = () => {
    return useMutation({
      ...teacherMutationOptions.moveToGroup(),
    });
  };

  const useRemoveNoteFromGroup = () => {
    return useMutation({
      ...teacherMutationOptions.removeFromGroup(),
    });
  };

  return {
    useUpdateStudyNote,
    useMoveNoteToGroup,
    useRemoveNoteFromGroup,
  };
};
