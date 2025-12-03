import { z } from 'zod';

const NotificationTypeSchema = z.enum(['SYSTEM', 'CONNECTION_REQUEST']);

const NotificationSchema = z.object({
  id: z.number().int().nonnegative(),
  message: z.string(),
  type: NotificationTypeSchema,
  targetId: z.number().int().nonnegative(),
  regDate: z.string(),
  read: z.boolean(),
});

export const base = {
  type: NotificationTypeSchema,
  schema: NotificationSchema,
};
