import { Pageable } from '@/lib/api';
import { queryOptions } from '@tanstack/react-query';

import { getTeacherQnAList } from './api';

export const QnAQueryKey = {
  all: ['qna'],
};

export const getQnAsTeacherOption = (args: {
  studyRoomId: number;
  pageable: Pageable;
  status?: string;
  sort?: string;
}) => {
  return queryOptions({
    queryKey: [QnAQueryKey.all, args],
    queryFn: () => getTeacherQnAList(args),
  });
};
