import { z } from 'zod';

export const GradeCutoffFormSchema = z
  .object({
    examId: z.coerce.number().int().positive('시험을 선택해주세요.'),
    source: z.string().trim().min(1, '출처를 입력해주세요.').max(200),
    fullScore: z.coerce.number().positive(),
    mean: z.union([z.coerce.number().nonnegative(), z.literal('')]).optional(),
    stdDev: z.union([z.coerce.number().positive(), z.literal('')]).optional(),
    grade1: z.coerce.number().nonnegative(),
    grade2: z.coerce.number().nonnegative(),
    grade3: z.coerce.number().nonnegative(),
    grade4: z.coerce.number().nonnegative(),
    grade5: z.coerce.number().nonnegative(),
    grade6: z.coerce.number().nonnegative(),
    grade7: z.coerce.number().nonnegative(),
    grade8: z.coerce.number().nonnegative(),
  })
  .refine(
    (value) => {
      const cutoffs = [
        value.grade1,
        value.grade2,
        value.grade3,
        value.grade4,
        value.grade5,
        value.grade6,
        value.grade7,
        value.grade8,
      ];
      return cutoffs.every(
        (cutoff, index) => index === 0 || cutoffs[index - 1]! > cutoff
      );
    },
    {
      message:
        '1등급부터 8등급까지 원점수 하한을 빠짐없이, 높은 점수부터 낮은 점수 순서로 입력해주세요.',
      path: ['root'],
    }
  );

export type GradeCutoffForm = z.infer<typeof GradeCutoffFormSchema>;
