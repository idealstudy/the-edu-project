import { InvitationQueryKey, StudyRoomsQueryKey } from '@/features/study-rooms';
import { TeacherStudyRoomRequests } from '@/features/study-rooms/api/room.api.base';
import { BaseQueryOptions, DEFAULT_QUERY_OPTION } from '@/lib/query';
import { queryOptions } from '@tanstack/react-query';

import type { StudyRoom } from '../model/types';

export type TeacherStudyRoomQueryOptions = ReturnType<
  typeof createTeacherStudyRoomQueryOptions
>;

export const createTeacherStudyRoomQueryOptions = (
  api: TeacherStudyRoomRequests,
  qOpt: BaseQueryOptions = {}
) => {
  const opt = { ...DEFAULT_QUERY_OPTION, ...qOpt };

  // 스터디룸 목록 조회
  const teacherList = () =>
    queryOptions<StudyRoom[]>({
      queryKey: StudyRoomsQueryKey.teacherList,
      queryFn: () => api.getStudyRooms(),
      ...opt,
    });

  // 초대 검색 (이메일)
  const searchInvitation = (args: { studyRoomId: number; email: string }) =>
    queryOptions({
      queryKey: InvitationQueryKey.search(args.studyRoomId, args.email),
      queryFn: () => api.invitations.search(args),
      ...opt,
      staleTime: 10_000,
      retry: 0 as const,
      refetchOnWindowFocus: false as const,
      refetchOnMount: false as const,
    });

  return { teacherList, searchInvitation };
};