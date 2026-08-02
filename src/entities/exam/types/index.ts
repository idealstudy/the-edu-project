import { dto, payload } from '@/entities/exam/infrastructure/exam.dto';
import { z } from 'zod';

export type AssignedExam = z.infer<typeof dto.assignedExamList>[number];
export type ExamAttemptSheet = z.infer<typeof dto.attemptSheet>;
export type ExamAnalysis = z.infer<typeof dto.analysis>;
export type TeacherExam = z.infer<typeof dto.teacherExamList>[number];
export type ParentGradeSummary = z.infer<typeof dto.parentSummary>;
export type CreateExamPayload = z.infer<typeof payload.create>;
export type AssignExamPayload = z.infer<typeof payload.assign>;
export type SubmitExamPayload = z.infer<typeof payload.submit>;
