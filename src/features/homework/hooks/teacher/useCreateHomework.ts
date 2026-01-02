import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postTeacherHomeworkCreate } from '../../api/teacher/homework.teacher.api';
import { TeacherHomeworkRequest } from '../../model/homework.types';
import { TeacherHomeworkQueryKey } from '../../service/query-keys';

export const useCreateHomework = (studyRoomId: number) => {
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
