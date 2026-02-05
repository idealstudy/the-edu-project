import { z } from 'zod';

import { dto } from '../infrastructure';

export type TeacherOnboardingDTO = z.infer<typeof dto.teacher>;
export type TeacherOnboardingStepType = z.infer<typeof dto.teacherStepType>;
