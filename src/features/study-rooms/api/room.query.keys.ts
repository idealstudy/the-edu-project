// 스터디룸 (목록)
export const StudyRoomsQueryKey = {
  all: ['studyRooms'] as const,
  teacherList: ['studyRooms', 'teacherList'] as const,
  studentList: ['studyRooms', 'studentList'] as const,
  detail: (id: number) => ['studyRooms', 'detail', id] as const,
};

// 스터디노트 그룹 (목록)
export const StudyRoomsGroupQueryKey = {
  all: ['studyNoteGroups'] as const,
  list: (studyRoomId: number) => ['studyNoteGroups', 'list', studyRoomId] as const,
};

// 학생 초대
export const InvitationQueryKey = {
  all: ['invitations'] as const,
  search: (studyRoomId: number, email: string) =>
    ['invitations', 'search', studyRoomId, email] as const,
};