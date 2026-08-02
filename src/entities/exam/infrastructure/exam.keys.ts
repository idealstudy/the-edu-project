export const examKeys = {
  all: ['exam'] as const,
  assignedList: () => [...examKeys.all, 'student', 'assigned-list'] as const,
  attempt: (attemptId: number) =>
    [...examKeys.all, 'student', 'attempt', attemptId] as const,
  analysis: (attemptId: number) =>
    [...examKeys.all, 'student', 'analysis', attemptId] as const,
  teacherList: () => [...examKeys.all, 'teacher', 'list'] as const,
  parentSummary: (childId: number) =>
    [...examKeys.all, 'parent', 'summary', childId] as const,
};
