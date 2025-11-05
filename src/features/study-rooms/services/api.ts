import { StudyRoomFormValues } from '@/features/study-rooms/schemas/create';
import { authApi } from '@/lib/http/api';
import { Pageable, PaginationData } from '@/types/http';
import type { CommonResponse } from '@/types/http';

import {
  ApiResponse,
  Invitation,
  MemberInvitation,
  StudentStudyRoom,
  StudyNoteGroup,
  StudyRoom,
} from '../types';

// 학생이 스터디룸 리스트 조회
export const getStudentStudyRooms = async () => {
  const response =
    await authApi.get<CommonResponse<StudentStudyRoom[]>>(
      `/student/study-rooms`
    );
  return response.data;
};

// (선생님) 수업노트 그룹 조회
export const getStudyNoteGroup = async (args: {
  studyRoomId: number;
  pageable: Pageable;
}) => {
  const response = await authApi.get<
    CommonResponse<PaginationData<StudyNoteGroup>>
  >(`/teacher/study-rooms/${args.studyRoomId}/teaching-note-groups`, {
    params: {
      page: args.pageable.page,
      size: args.pageable.size,
      sort: args.pageable.sort,
    },
    paramsSerializer: { indexes: null },
  });
  return response.data;
};

// (학생) 수업노트 그룹 조회
export const getStudentStudyNoteGroup = async (args: {
  studyRoomId: number;
  pageable: Pageable;
}) => {
  const response = await authApi.get<
    CommonResponse<PaginationData<StudyNoteGroup>>
  >(`/teacher/study-rooms/${args.studyRoomId}/teaching-note-groups`, {
    params: {
      page: args.pageable.page,
      size: args.pageable.size,
      sort: args.pageable.sort,
    },
    paramsSerializer: { indexes: null },
  });
  return response.data;
};

export const studyroomApi = {
  create: async (payload: StudyRoomFormValues): Promise<StudyRoom> => {
    const response = await authApi.post<ApiResponse<StudyRoom>>(
      '/teacher/study-rooms',
      payload
    );
    return response.data;
  },

  // 스터디룸 사용자(학생)초대
  invitations: {
    send: async (args: {
      studyRoomId: number;
      emails: string[];
    }): Promise<MemberInvitation> => {
      const response = await authApi.post<ApiResponse<MemberInvitation>>(
        `/teacher/study-rooms/${args.studyRoomId}/members`,
        { studentEmailList: args.emails }
      );
      return response.data;
    },
    search: async (args: {
      studyRoomId: number;
      email: string;
    }): Promise<Invitation> => {
      const response = await authApi.get<ApiResponse<Invitation>>(
        `/teacher/study-rooms/${args.studyRoomId}/search`,
        {
          params: { email: args.email },
        }
      );
      return response.data;
    },
  },
};
