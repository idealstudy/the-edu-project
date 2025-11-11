import {
  RoomClassFormSchema,
  RoomModalitySchema,
  RoomSchema,
  RoomSchoolLevelSchema,
  RoomSubjectSchema,
  RoomVisibilitySchema,
} from '@/entities/study-room/types/schema';
import { z } from 'zod';

export type Room = z.infer<typeof RoomSchema>;
export type RoomVisibility = z.infer<typeof RoomVisibilitySchema>;
export type RoomModality = z.infer<typeof RoomModalitySchema>;
export type RoomClassForm = z.infer<typeof RoomClassFormSchema>;
export type RoomSchoolLevel = z.infer<typeof RoomSchoolLevelSchema>;
export type RoomSubject = z.infer<typeof RoomSubjectSchema>;
