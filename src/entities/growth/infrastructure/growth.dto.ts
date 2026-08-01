import { z } from 'zod';

const state = z.object({
  level: z.number().int().positive(),
  daysGrown: z.number().int().nonnegative(),
  xp: z.number().int().nonnegative(),
  xpToNextLevel: z.number().int().positive(),
  totalExperience: z.number().int().nonnegative(),
  streakDays: z.number().int().nonnegative(),
  stage: z.enum(['HEALTHY', 'WILTING', 'WITHERED', 'DORMANT']),
  wiltingDays: z.number().int().nonnegative(),
  lastActivityDate: z.string().nullable(),
  lastReflectionDate: z.string().nullable(),
});

export const dto = { state };
