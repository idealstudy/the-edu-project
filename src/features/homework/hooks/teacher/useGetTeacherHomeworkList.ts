import { useQuery } from '@tanstack/react-query';

import { getTeacherHomeworkList } from '../../api/teacher/homework.teacher.api';
import { HomeworkPageable } from '../../model/homework.types';
import { TeacherHomeworkQueryKey } from '../../service/query-keys';

export const useGetTeacherHomeworkList = (
  studyRoomId: number,
  query: HomeworkPageable
) => {
  return useQuery({
    queryKey: TeacherHomeworkQueryKey.list(studyRoomId, query),
    queryFn: () => getTeacherHomeworkList(studyRoomId, query),
  });
};
