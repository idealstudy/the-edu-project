import {
  StudentStudyRoom,
  StudyNoteGroup,
  StudyRoomClient,
} from '@/features/study-rooms';
import {
  InvitationAcceptResponse,
  StudentStudyRoomRequests,
  createStudyRoomBaseApi,
} from '@/features/study-rooms/api';
import type { CommonResponse, Pageable, PaginationData } from '@/types/http';

export const createStudentStudyRoomApi = (
  client?: StudyRoomClient
): StudentStudyRoomRequests => {
  const base = createStudyRoomBaseApi(client);

  // 스터디룸 목록 조회
  const getStudyRooms = async (): Promise<StudentStudyRoom[]> => {
    const response = await base.client.get<CommonResponse<StudentStudyRoom[]>>(
      base.studentBasePath
    );
    return response.data;
  };

  // 수업노트 그룹 조회
  const getStudentStudyNoteGroup = async (args: {
    studyRoomId: number;
    pageable: Pageable;
  }): Promise<PaginationData<StudyNoteGroup>> => {
    const response = await base.client.get<
      CommonResponse<PaginationData<StudyNoteGroup>>
    >(
      `${base.teacherBasePath}/${args.studyRoomId}/teaching-note-groups`, // API 경로가 /teacher로 되어 있어 그대로 사용
      { params: args.pageable, paramsSerializer: { indexes: null } }
    );
    return response.data;
  };

  // 초대 수락
  const acceptInvitation = async (
    invitationId: number | string
  ): Promise<InvitationAcceptResponse> => {
    // 초대 수락은 PATCH 요청으로 가정
    const response = await base.client.post<
      CommonResponse<InvitationAcceptResponse>
    >(
      `${base.studentInvitationPath}/${invitationId}/respond`,
      { action: 'ACCEPT' } // 수락 액션 페이로드 가정
    );
    return response.data;
  };

  return {
    getStudyRooms,
    getStudentStudyNoteGroup,
    acceptInvitation,
  };
};