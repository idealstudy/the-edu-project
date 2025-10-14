export type ApiResponse<T> = { status: number; message: string; data: T };
export type Role =
  | 'ROLE_ADMIN'
  | 'ROLE_STUDENT'
  | 'ROLE_TEACHER'
  | 'ROLE_PARENT';

export interface StudyNoteGroup {
  id: number;
  title: string;
}

export interface CreateStepForm {
  onNext: () => void;
  disabled: boolean;
}

export type StudyRoom = {
  id: number;
  name: string;
  description: string;
  teacherName: string;
  visibility: 'PUBLIC' | 'PRIVATE';
};

// 스터디룸 사용자(학생)초대
export type Invitation = {
  role: string;
  canInvite: boolean;
  inviteeId: number;
  inviteeEmail: string;
  inviteeName: string;
  connectedGuardianCount: number;
  connectedStudentCount: number;
  studentResponseList: string[];
};

export type InviteSuccess = {
  email: string;
  name: string;
  role: Role;
};

export type InviteFailure = {
  email: string;
  name: string;
  reason: string;
};

export type MemberInvitation = {
  successEmailList: InviteSuccess[];
  failEmailList: InviteFailure[];
};
