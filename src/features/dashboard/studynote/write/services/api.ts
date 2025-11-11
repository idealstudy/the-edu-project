import { authApi } from '@/shared/lib';
import { CommonResponse, PaginationMeta } from '@/types/http';

import {
  ConnectedMember,
  StudyNote,
  StudyNoteGroupResponse,
  StudyRoom,
} from '../type';

export const getStudyRooms = async () => {
  const response = await authApi.get<CommonResponse<StudyRoom[]>>(
    '/teacher/study-rooms'
  );
  return response.data;
};

export const getConnectMembers = async (roomId: number) => {
  const response = await authApi.get<
    CommonResponse<
      PaginationMeta & {
        members: {
          studentInfo: ConnectedMember;
          parentInfo: ConnectedMember | null;
        }[];
      }
    >
  >(`/teacher/study-rooms/${roomId}/members`);

  return response.data;
};

export const writeStudyNote = async (data: StudyNote) => {
  await authApi.post('/teacher/teaching-notes', data);
};

export const getStudyNoteGroups = async (roomId: number) => {
  const response = await authApi.get<CommonResponse<StudyNoteGroupResponse>>(
    `teacher/study-rooms/${roomId}/teaching-note-groups`
  );

  return response.data;
};

export const createStudyNoteGroup = async (data: {
  studyRoomId: number;
  title: string;
}) => {
  const response = await authApi.post<
    CommonResponse<{
      id: number;
      title: string;
    }>
  >(`/teacher/teaching-note-groups`, data);

  return response.data;
};

// export const getStudyNotesByStudyRoomId = async ({
//   roomId,
//   pageble,
// }: {
//   roomId: number;
//   pageble: Pageable;
// }) => {
//   const response = (
//     await apiClient.get<
//       CommonResponse<PaginationMeta & { content: StudyNoteSearch[] }>
//     >(
//       `/teacher/study-rooms/${roomId}/teaching-notes?${objectToQueryString(pageble)}`
//     )
//   ).mock;

//   return response.mock;
// };
