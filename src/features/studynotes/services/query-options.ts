import { Role } from '@/features/auth/type';
import { getStudyNoteDetail } from '@/features/dashboard/studynote/detail/service/api';
import { queryOptions } from '@tanstack/react-query';

import type { StudyNoteGroupPageable } from '../type';
import {
  getStudentStudyNotes,
  getStudentStudyNotesByGroupId,
  getStudyNoteMembers,
  getStudyNotes,
  getStudyNotesByGroupId,
  updateStudyNote,
} from './api';

export const StudyNoteQueryKey = {
  all: ['studynote'],
  byGroupId: ['studynote', 'byGroupId'],
  byId: ['studynote', 'byId'],
  update: ['studynote', 'update'],
};

export const getStudyNotesOption = (
  role: Role | undefined,
  args: {
    studyRoomId: number;
    pageable: StudyNoteGroupPageable;
    // keyword: string;
  }
) => {
  return queryOptions({
    queryKey: [StudyNoteQueryKey.all, args, role],
    queryFn: async () => {
      if (role === 'ROLE_TEACHER') return getStudyNotes(args);
      if (role === 'ROLE_STUDENT') return getStudentStudyNotes(args);
    },
    enabled: !!role,
  });
};

export const getStudyNotesByGroupIdOption = (
  role: Role | undefined,
  args: {
    studyRoomId: number;
    teachingNoteGroupId: number;
    pageable: StudyNoteGroupPageable;
  }
) => {
  return queryOptions({
    queryKey: [StudyNoteQueryKey.byGroupId, args, role],
    queryFn: async () => {
      if (role === 'ROLE_TEACHER') return getStudyNotesByGroupId(args);
      if (role === 'ROLE_STUDENT') return getStudentStudyNotesByGroupId(args);
    },
    enabled: !!role,
  });
};

export const getStudyNoteDetailsOption = (args: { teachingNoteId: number }) => {
  return queryOptions({
    queryKey: [StudyNoteQueryKey.byId, args],
    queryFn: () => getStudyNoteDetail(args.teachingNoteId),
  });
};

export const getUpdateStudyNoteOption = (args: {
  teachingNoteId: number;
  studyRoomId: number;
  teachingNoteGroupId: number;
  title: string;
  content: string;
  visibility: string;
  taughtAt: string;
  studentIds: number[];
}) => {
  return queryOptions({
    queryKey: [StudyNoteQueryKey.update, args],
    queryFn: () => updateStudyNote(args),
  });
};

export const getStudyNoteMembersOption = (args: {
  studyRoomId: number;
  page?: number;
  size?: number;
}) => {
  return queryOptions({
    queryKey: [StudyNoteQueryKey.all, args],
    queryFn: () => getStudyNoteMembers(args),
  });
};
