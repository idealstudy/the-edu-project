import { useMutation, useQuery } from '@tanstack/react-query';

import { NewStudyNoteGroupData, StudyNote } from '../type';
import { addStudyNoteGroup, writeStudyNote } from './api';
import {
  getConnectMembersOption,
  getStudyNoteGroupsOption,
  getStudyRoomsOption,
} from './query-options';

export const useConnectMembers = (roomId: number) => {
  return useQuery(getConnectMembersOption(roomId));
};

export const useStudyNoteGroupsQuery = (roomId: number) => {
  return useQuery(getStudyNoteGroupsOption(roomId));
};

export const useWriteStudyNoteMutation = () => {
  return useMutation({
    mutationFn: (data: StudyNote) => writeStudyNote(data),
  });
};

export const useAddNewStudyNoteGroupMutation = () => {
  return useMutation({
    mutationFn: (data: NewStudyNoteGroupData) => addStudyNoteGroup(data),
  });
};

// export const useStudyNoteListByStudyRoomQuery = ({
//   roomId,
//   pageble,
// }: {
//   roomId: number;
//   pageble: Pageable;
// }) => {
//   return useQuery(getStudyNoteListByStudyRoomOption({ roomId, pageble }));
// };

// 임시로 작성된 스터디 룸 Query
export const useStudyRoomsQuery = () => {
  return useQuery(getStudyRoomsOption());
};
