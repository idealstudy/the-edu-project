import { useMutation, useQueryClient } from '@tanstack/react-query';

import { removeTeacherHomework } from '../../api/teacher/homework.teacher.api';
import { TeacherHomeworkQueryKey } from '../../service/query-keys';

export const useRemoveHomework = (studyRoomId: number, homeworkId: number) => {
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
