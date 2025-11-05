export interface StudyNoteMemberResponse {
  status: number;
  message: string;
  data: {
    pageNumber: number;
    size: number;
    totalElements: number;
    totalPages: number;
    members: StudyMember[];
  };
}

export interface StudyMember {
  studentInfo: MemberInfo;
  parentInfo?: MemberInfo;
}

export interface MemberInfo {
  role: 'ROLE_ADMIN' | 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_PARENT';
  id: number;
  name: string;
  email: string;
  joinDate: string;
}

export interface StudyNoteMember {
  id: string;
  name: string;
  email: string;
  guardianCount?: number;
  joinedText: string;
  avatarSrc?: string;
}
