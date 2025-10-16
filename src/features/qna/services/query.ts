import { Role } from '@/features/auth/type';
import { Pageable } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

import { getStudentQnAList, getTeacherQnAList } from './api';

export const useQnAsQuery = (
  role: Role | undefined,
  args: {
    studyRoomId: number;
    pageable: Pageable;
    status?: string;
    sort?: string;
  }
) => {
  return useQuery({
    queryKey: ['qnaList', role, args],
    queryFn: async () => {
      if (role === 'ROLE_TEACHER') return getTeacherQnAList(args);
      if (role === 'ROLE_STUDENT') return getStudentQnAList(args);
      throw new Error('role not ready');
    },
    enabled: role === 'ROLE_TEACHER' || role === 'ROLE_STUDENT',
  });
};
