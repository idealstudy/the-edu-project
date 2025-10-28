import { StudyRoomFormValues } from '@/features/studyrooms/schemas/create';
import { CommonResponse, PaginationMeta, api, apiClient } from '@/lib/api';
import { Pageable } from '@/lib/api';

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
  const response = (
    await apiClient.get<CommonResponse<StudentStudyRoom[]>>(
      `/student/study-rooms`
    )
  ).data;

  return response.data;
};

// (선생님) 수업노트 그룹 조회
export const getStudyNoteGroup = async (args: {
  studyRoomId: number;
  pageable: Pageable;
}) => {
  const response = (
    await apiClient.get<
      CommonResponse<PaginationMeta & { content: StudyNoteGroup[] }>
    >(`/teacher/study-rooms/${args.studyRoomId}/teaching-note-groups`, {
      params: {
        page: args.pageable.page,
        size: args.pageable.size,
        sort: args.pageable.sort,
      },
      paramsSerializer: {
        indexes: null,
      },
    })
  ).data;
  return response.data;
};

// (학생) 수업노트 그룹 조회
export const getStudentStudyNoteGroup = async (args: {
  studyRoomId: number;
  pageable: Pageable;
}) => {
  const response = (
    await apiClient.get<
      CommonResponse<PaginationMeta & { content: StudyNoteGroup[] }>
    >(`/student/study-rooms/${args.studyRoomId}/teaching-note-groups`, {
      params: {
        page: args.pageable.page,
        size: args.pageable.size,
        sort: args.pageable.sort,
      },
      paramsSerializer: {
        indexes: null,
      },
    })
  ).data;
  return response.data;
};

export const studyroomApi = {
  create: async (payload: StudyRoomFormValues): Promise<StudyRoom> => {
    const response = await api.post<ApiResponse<StudyRoom>>(
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
      const response = await api.post<ApiResponse<MemberInvitation>>(
        `/teacher/study-rooms/${args.studyRoomId}/members`,
        { studentEmailList: args.emails }
      );
      return response.data;
    },
    search: async (args: {
      studyRoomId: number;
      email: string;
    }): Promise<Invitation> => {
      const response = await api.get<ApiResponse<Invitation>>(
        `/teacher/study-rooms/${args.studyRoomId}/search`,
        {
          params: { email: args.email },
        }
      );
      return response.data;
    },
  },
};
