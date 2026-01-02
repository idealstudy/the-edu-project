import { useQuery } from '@tanstack/react-query';

import { getTeacherHomeworkDetail } from '../../api/teacher/homework.teacher.api';
import { TeacherHomeworkQueryKey } from '../../service/query-keys';

export const useGetTeacherHomeworkDetail = (
  studyRoomId: number,
  homeworkId: number
) => {
  return useQuery({
    queryKey: TeacherHomeworkQueryKey.detail(studyRoomId, homeworkId),
    queryFn: () => getTeacherHomeworkDetail(studyRoomId, homeworkId),
  });
};
