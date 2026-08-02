/* ─────────────────────────────────────────────────────
 * 오답 회독 Query Keys
 * ────────────────────────────────────────────────────*/
export const wrongAnswerKeys = {
  all: ['wrong-answer'] as const,
  dailyProblems: (date?: string) =>
    [...wrongAnswerKeys.all, 'daily-problems', date ?? 'today'] as const,
  list: (nodeId?: number) =>
    [...wrongAnswerKeys.all, 'list', nodeId ?? 'all'] as const,
  teacherInbox: () => [...wrongAnswerKeys.all, 'teacher-inbox'] as const,
};
