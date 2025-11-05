export const TAB = {
  NOTES: '1',
  STUDENTS: '2',
  QUESTIONS: '3',
} as const;

export type TabValue = (typeof TAB)[keyof typeof TAB];
