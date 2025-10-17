import { Role } from '@/features/auth/type';
import { Pageable } from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';

import { getStudentQnAList, getTeacherQnAList, writeQnA } from './api';

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

export const useWriteQnAMutation = () => {
  return useMutation({
    mutationFn: (args: {
      studyRoomId: number;
      title: string;
      content: string;
    }) => writeQnA(args),
  });
};
