import type { QuestionBankParams } from '@/entities/exam';

export type QuestionBankGrade = NonNullable<QuestionBankParams['grade']>;

const GRADE_SUBJECTS: Record<QuestionBankGrade, ReadonlySet<string>> = {
  HIGH_1: new Set(['COMMON_MATH_1', 'COMMON_MATH_2']),
  HIGH_2: new Set(['ALGEBRA', 'CALCULUS_1', 'PROBABILITY_STATISTICS']),
};

export const isQuestionBankSubjectAllowed = (
  grade: QuestionBankGrade,
  subject: string
) => GRADE_SUBJECTS[grade].has(subject);
