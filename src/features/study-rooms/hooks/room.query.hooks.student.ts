import {
  StudentStudyRoomRequests,
  createStudentStudyRoomQueryOptions,
} from '@/features/study-rooms/api';
import { BaseQueryOptions } from '@/shared/lib/query';
import { useQuery } from '@tanstack/react-query';

export const createStudentStudyRoomHooks = (
  api: StudentStudyRoomRequests,
  base?: BaseQueryOptions
) => {
  const qo = createStudentStudyRoomQueryOptions(api, base);

  // 학생 스터디룸 목록
  const useStudentStudyRoomsQuery = (options?: { enabled?: boolean }) =>
    useQuery({
      ...qo.studentList(),
      enabled: options?.enabled ?? true,
    });
  return {
    useStudentStudyRoomsQuery,
  };
};
