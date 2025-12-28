import { z } from 'zod';

const NotificationCategorySchema = z.enum([
  'TEACHING_NOTE',
  'SYSTEM',
  'CONNECTION_REQUEST',
  // TODO: 추가 카테고리
]);

const NotificationSchema = z.object({
  id: z.number().int().nonnegative(),
  message: z.string(),
  category: NotificationCategorySchema,
  targetId: z.number().int().nonnegative(),
  regDate: z.string().nullable(),
  isRead: z.boolean(),
});

export const base = {
  category: NotificationCategorySchema,
  schema: NotificationSchema,
};
