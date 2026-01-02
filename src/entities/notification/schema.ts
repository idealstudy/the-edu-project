import { z } from 'zod';

const NotificationCategorySchema = z.enum([
  'SYSTEM',
  'HOMEWORK',
  'TEACHING_NOTE',
  'STUDY_ROOM',
  'QNA',
]);

const NotificationSchema = z.object({
  id: z.number().int().nonnegative(),
  message: z.string(),
  category: NotificationCategorySchema,
  targetId: z.number().int().nonnegative(),
  regDate: z.string().nullable(),
  read: z.boolean(),
});

export const base = {
  category: NotificationCategorySchema,
  schema: NotificationSchema,
};
