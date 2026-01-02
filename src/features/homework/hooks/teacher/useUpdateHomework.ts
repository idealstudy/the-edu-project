import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateTeacherHomwork } from '../../api/teacher/homework.teacher.api';
import { TeacherHomeworkRequest } from '../../model/homework.types';
import { TeacherHomeworkQueryKey } from '../../service/query-keys';

export const useUpdateTeacherHomework = (
  studyRoomId: number,
  homeworkId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TeacherHomeworkRequest) =>
      updateTeacherHomwork(studyRoomId, homeworkId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TeacherHomeworkQueryKey.listBase(studyRoomId),
      });
    },
  });
};
