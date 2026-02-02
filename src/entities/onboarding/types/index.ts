import { dto } from '@/entities/onboarding/infrastructure';
import { z } from 'zod';

export type TeacherOnboardingDTO = z.infer<typeof dto.teacher>;
export type TeacherOnboardingStepType = z.infer<typeof dto.teacherStepType>;
