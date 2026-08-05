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
  teacherPins: () => [...examKeys.all, 'teacher', 'pins'] as const,
  questionBank: (params: {
    treeNodeIds: number[];
    difficulty?: string;
    grade?: number;
    excludeChallengeIds: number[];
    page: number;
    size: number;
  }) => [...examKeys.all, 'teacher', 'question-bank', params] as const,
  hall: () => [...examKeys.all, 'student', 'hall'] as const,
  adminQuestionBank: (params: {
    treeNodeIds: number[];
    difficulty?: string;
    grade?: number;
    excludeChallengeIds: number[];
    page: number;
    size: number;
  }) => [...examKeys.all, 'admin', 'question-bank', params] as const,
  adminExams: () => [...examKeys.all, 'admin', 'exams'] as const,
};
