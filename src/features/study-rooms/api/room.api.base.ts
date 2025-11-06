import type {
  Invitation,
  MemberInvitation,
  SearchInvitationPayload,
  StudentStudyRoom,
  StudyNoteGroup,
  StudyRoom,
  StudyRoomClient,
} from '@/features/study-rooms/model';
import { StudyRoomFormValues } from '@/features/study-rooms/model/room.create.schema';
import { authApi } from '@/lib/http/http.client';
import { Pageable, PaginationData } from '@/types/http';

type GroupListResponse = PaginationData<StudyNoteGroup>;
type GroupApiArgs = { studyRoomId: number; pageable: Pageable };
// TODO: 임시 초대 수락 응답 타입
export type InvitationAcceptResponse = unknown;

export interface TeacherStudyRoomRequests {
  getStudyRooms(): Promise<StudyRoom[]>;
  create(payload: StudyRoomFormValues): Promise<StudyRoom>;
  invitations: {
    send(args: {
      studyRoomId: number;
      emails: string[];
    }): Promise<MemberInvitation>;
    search(args: SearchInvitationPayload): Promise<Invitation>;
  };
  getStudyNoteGroup(args: GroupApiArgs): Promise<GroupListResponse>;
}

export interface StudentStudyRoomRequests {
  getStudyRooms(): Promise<StudentStudyRoom[]>;
  getStudentStudyNoteGroup(args: GroupApiArgs): Promise<GroupListResponse>;
  acceptInvitation(
    invitationId: number | string
  ): Promise<InvitationAcceptResponse>;
}

export interface StudyRoomRequests {
  getTeacherStudyRooms(): Promise<StudyRoom[]>;
  getStudentStudyRooms(): Promise<StudentStudyRoom[]>;

  // Teacher
  create(payload: StudyRoomFormValues): Promise<StudyRoom>;
  invitations: {
    send(args: {
      studyRoomId: number;
      emails: string[];
    }): Promise<MemberInvitation>;
    search(args: SearchInvitationPayload): Promise<Invitation>;
  };
  getStudyNoteGroup(args: GroupApiArgs): Promise<GroupListResponse>;

  // Student
  acceptInvitation(
    invitationId: number | string
  ): Promise<InvitationAcceptResponse>;
}

export const createStudyRoomBaseApi = (client: StudyRoomClient = authApi) => ({
  client,
  teacherBasePath: '/teacher/study-rooms',
  studentBasePath: '/student/study-rooms',
  studentInvitationPath: '/student/study-invites',
});