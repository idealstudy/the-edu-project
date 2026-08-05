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
  })
  .refine(
    (value) => value.grade1 > value.grade2 && value.grade2 > value.grade3,
    {
      message: '등급컷은 1등급부터 원점수 하한이 낮아져야 합니다.',
      path: ['root'],
    }
  );

export type GradeCutoffForm = z.infer<typeof GradeCutoffFormSchema>;
