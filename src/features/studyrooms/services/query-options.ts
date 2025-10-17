import { Pageable, PaginationMeta } from '@/lib/api';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import type { StudyNoteGroup } from '../types';
import { getStudentStudyRooms, getStudyNoteGroup, studyroomApi } from './api';

// 스터디룸 (목록)
export const StudyRoomsQueryKey = {
  all: ['studyRooms'],
};

// 스터디노트 그룹 (목록)
export const StudyRoomsGroupQueryKey = {
  all: ['studyNoteGroups'],
};

// 학생 초대
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

export const getStudentStudyRoomsOption = () => {
  return queryOptions({
    queryKey: [StudyRoomsQueryKey.all],
    queryFn: getStudentStudyRooms,
  });
};
