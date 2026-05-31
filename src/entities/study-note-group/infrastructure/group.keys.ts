// 스터디노트 그룹 (목록)
export const StudyRoomsGroupQueryKey = {
  all: ['studyNoteGroups'] as const,
  list: (studyRoomId: number) =>
    ['studyNoteGroups', 'list', studyRoomId] as const,
};
