import { Role } from '@/features/auth/type';
import { Pageable, PaginationMeta } from '@/types/http';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import type { StudyNoteGroup } from '../types';
import {
  getStudentStudyNoteGroup,
  getStudentStudyRooms,
  getStudyNoteGroup,
  studyroomApi,
} from './api';

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

export const getStudyNoteGroupInfiniteOption = (
  role: Role | undefined,
  args: {
    studyRoomId: number;
    pageable: Pageable;
  }
) => {
  return infiniteQueryOptions({
    queryKey: [StudyRoomsGroupQueryKey.all, args, role],
    queryFn: async ({ pageParam = 0 }) => {
      if (role !== 'ROLE_TEACHER' && role !== 'ROLE_STUDENT') {
        throw new Error('role not ready');
      }

      const req = {
        ...args,
        pageable: { ...args.pageable, page: pageParam },
      };
      if (role === 'ROLE_TEACHER') return getStudyNoteGroup(req);
      return getStudentStudyNoteGroup(req);
    },
    initialPageParam: 0,
    getNextPageParam: (
      lastPage: PaginationMeta & { content: StudyNoteGroup[] }
    ) => {
      if (lastPage.pageNumber >= lastPage.totalPages - 1) return undefined;
      return lastPage.pageNumber + 1;
    },
    enabled: !!role && (role === 'ROLE_TEACHER' || role === 'ROLE_STUDENT'),
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
