import { z } from 'zod';

import { diagnosisDomain } from '../core/onboarding.diagnosis.domain';
import { dto } from '../infrastructure';
import { diagnosisDto } from '../infrastructure/onboarding.diagnosis.dto';

export const TeacherOnboardingStepTypes = dto.teacherStepType._def.values;

export type TeacherOnboardingDTO = z.infer<typeof dto.teacher>;
export type TeacherOnboardingStepType = z.infer<typeof dto.teacherStepType>;
export type TeacherOnboardingStep = z.infer<typeof dto.teacherOnboardingStep>;

/* ─────────────────────────────────────────────────────
 * 학생 온보딩(진단) Type — 학년/과목/등급/약점·모의진단
 * ────────────────────────────────────────────────────*/
export type OnboardingGrade = z.infer<typeof diagnosisDomain.grade>;
export type OnboardingElective = z.infer<typeof diagnosisDomain.elective>;
export type OnboardingSelfGrade = z.infer<typeof diagnosisDomain.selfGrade>;
export type OnboardingInput = z.infer<typeof diagnosisDomain.input>;
export type DiagnosisItem = z.infer<typeof diagnosisDto.item>;
export type DiagnosisResult = z.infer<typeof diagnosisDto.result>;
