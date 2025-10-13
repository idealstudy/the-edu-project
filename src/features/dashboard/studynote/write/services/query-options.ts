import { Pageable } from '@/lib/api';
import { queryOptions } from '@tanstack/react-query';

import { getConnectMembers, getStudyNoteGroups, getStudyRooms } from './api';

export const StudyNoteWriteQueryKey = {
  all: ['studyNote'],
  // 임시로 작성
  rooms: () => [...StudyNoteWriteQueryKey.all, 'rooms'],
  students: (roomId: number) => [
    ...StudyNoteWriteQueryKey.all,
    'students',
    roomId,
  ],
  studyNoteGroups: (roomId: number) => [
    ...StudyNoteWriteQueryKey.all,
    'studyNoteGroups',
    roomId,
  ],
  studyNoteListByStudyRoom: ({
    roomId,
    pageble,
  }: {
    roomId: number;
    pageble: Pageable;
  }) => [...StudyNoteWriteQueryKey.all, 'studyNoteList', roomId, pageble],
};

// 임시로 작성
export const getStudyRoomsOption = () => {
  return queryOptions({
    queryKey: StudyNoteWriteQueryKey.rooms(),
    queryFn: () => getStudyRooms(),
  });
};

export const getConnectMembersOption = (roomId: number) => {
  return queryOptions({
    queryKey: StudyNoteWriteQueryKey.students(roomId),
    queryFn: () => getConnectMembers(roomId),
    select(data) {
      const flatMembers = data.members.flatMap(
        ({ studentInfo, parentInfo }) => [studentInfo, parentInfo]
      );
      return flatMembers;
    },
    enabled: !!roomId,
  });
};

export const getStudyNoteGroupsOption = (roomId: number) => {
  return queryOptions({
    queryKey: StudyNoteWriteQueryKey.studyNoteGroups(roomId),
    queryFn: () => getStudyNoteGroups(roomId),
    enabled: !!roomId,
  });
};

// export const getStudyNoteListByStudyRoomOption = ({
//   roomId,
//   pageble,
// }: {
//   roomId: number;
//   pageble: Pageable;
// }) => {
//   return queryOptions({
//     queryKey: StudyNoteWriteQueryKey.studyNoteListByStudyRoom({
//       roomId,
//       pageble,
//     }),
//     queryFn: () => getStudyNotesByStudyRoomId({ roomId, pageble }),
//   });
// };
