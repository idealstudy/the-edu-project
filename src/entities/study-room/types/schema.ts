import { z } from 'zod';

export const RoomVisibilitySchema = z.enum(['PRIVATE', 'PUBLIC']);

export const RoomModalitySchema = z.enum(['ONLINE', 'OFFLINE']);

export const RoomClassFormSchema = z.enum(['ONE_ON_ONE', 'ONE_TO_MANY']);

export const RoomSubjectSchema = z.enum(['KOREAN', 'ENGLISH', 'MATH', 'OTHER']);

export const RoomSchoolLevelSchema = z.enum(['ELEMENTARY', 'MIDDLE', 'HIGH']);

export const RoomSchema = z.object({
  id: z.number().int().nonnegative(),
  teacherId: z.number().int().nonnegative(),
  name: z.string(),
  description: z.string(),
});
