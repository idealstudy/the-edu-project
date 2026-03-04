export const teacherKeys = {
  all: ['teacher'] as const,
  report: () => [...teacherKeys.all, 'report'] as const,
  noteList: () => [...teacherKeys.all, 'noteList'] as const,
  studyRoomList: () => [...teacherKeys.all, 'studyRoomList'] as const,
  dashboard: {
    all: () => [...teacherKeys.all, 'dashboard'] as const,
    report: () => [...teacherKeys.dashboard.all(), 'report'] as const,
    noteList: () => [...teacherKeys.dashboard.all(), 'noteList'] as const,
    studyRoomList: () =>
      [...teacherKeys.dashboard.all(), 'studyRoomList'] as const,
    QnaList: () => [...teacherKeys.dashboard.all(), 'QnaList'] as const,
    memberList: () => [...teacherKeys.dashboard.all(), 'memberList'] as const,
    homeworkList: () =>
      [...teacherKeys.dashboard.all(), 'homeworkList'] as const,
  },
};
