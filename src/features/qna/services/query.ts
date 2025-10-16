import { Pageable } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

import { getQnAsTeacherOption } from './query-options';

export const useQnAsTeacherQuery = (args: {
  studyRoomId: number;
  pageable: Pageable;
  status?: string;
  sort?: string;
}) => {
  return useQuery(getQnAsTeacherOption(args));
};
