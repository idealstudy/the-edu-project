import { Pageable, PaginationMeta } from '@/lib/api';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import type { StudyNoteGroup } from '../types';
import { getStudyNoteGroup, studyroomApi } from './api';

export const StudyRoomsGroupQueryKey = {
  all: ['studyNoteGroups'],
};

export const InvitationQueryKey = {
  all: ['invitations'] as const,
  search: (studyRoomId: number, email: string) =>
    [...InvitationQueryKey.all, 'search', studyRoomId, email] as const,
};

export const getStudyNoteGroupInfiniteOption = (args: {
  studyRoomId: number;
  pageable: Pageable;
}) => {
  return infiniteQueryOptions({
    queryKey: [StudyRoomsGroupQueryKey.all, args],
    queryFn: ({ pageParam = 0 }) =>
      getStudyNoteGroup({
        ...args,
        pageable: { ...args.pageable, page: pageParam },
      }),
    initialPageParam: 0,
    getNextPageParam: (
      lastPage: PaginationMeta & { content: StudyNoteGroup[] }
    ) => {
      if (lastPage.pageNumber >= lastPage.totalPages - 1) return undefined;
      return lastPage.pageNumber + 1;
    },
  });
};

export const getSearchInvitationOption = (args: {
  studyRoomId: number;
  email: string;
}) => {
  return queryOptions({
    queryKey: [InvitationQueryKey.search, args],
    queryFn: () => studyroomApi.invitations.search(args),
  });
};
