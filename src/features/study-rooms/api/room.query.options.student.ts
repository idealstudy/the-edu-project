import {
  StudentStudyRoomRequests,
  StudyRoomsQueryKey,
} from '@/features/study-rooms/api';
import { BaseQueryOptions, DEFAULT_QUERY_OPTION } from '@/lib/query';
import { queryOptions } from '@tanstack/react-query';

import type { StudentStudyRoom } from '../model/types';

export type StudentStudyRoomQueryOptions = ReturnType<
  typeof createStudentStudyRoomQueryOptions
>;

export const createStudentStudyRoomQueryOptions = (
  api: StudentStudyRoomRequests,
  qOpt: BaseQueryOptions = {}
) => {
  const opt = { ...DEFAULT_QUERY_OPTION, ...qOpt };
  const studentList = () =>
    queryOptions<StudentStudyRoom[]>({
      queryKey: StudyRoomsQueryKey.studentList,
      queryFn: () => api.getStudyRooms(),
      ...opt,
    });

  return { studentList };
};