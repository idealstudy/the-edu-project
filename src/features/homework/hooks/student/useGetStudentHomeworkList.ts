import { useQuery } from '@tanstack/react-query';

import { getStudentHomeworkList } from '../../api/student/homework.student.api';
import { HomeworkPageable } from '../../model/homework.types';
import { StudentHomeworkQueryKey } from '../../service/query-keys';

export const useGetStudentHomeworkList = (
  studyRoomId: number,
  query: HomeworkPageable
) => {
  return useQuery({
    queryKey: StudentHomeworkQueryKey.list(studyRoomId, query),
    queryFn: () => getStudentHomeworkList(studyRoomId, query),
  });
};
