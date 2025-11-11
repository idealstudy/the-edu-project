import { z } from 'zod';

export const NoteSchema = z.object({
  id: z.number().int().nonnegative(),
  groupId: z.number().int().nonnegative(),
  groupName: z.string(),
  teacherName: z.string(),
  title: z.string(),
  visibility: z.enum([
    'TEACHER_ONLY',
    'SPECIFIC_STUDENTS_ONLY',
    'SPECIFIC_STUDENTS_AND_PARENTS',
    'STUDY_ROOM_STUDENTS_ONLY',
    'STUDY_ROOM_STUDENTS_AND_PARENTS',
    'PUBLIC',
  ]),
  taughtAt: z.string(),
  updatedAt: z.string(),
});

export const NoteListSchema = z.object({
  pageNumber: z.number().int().nonnegative(),
  size: z.number().int().nonnegative(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  content: z.array(NoteSchema),
});

export const NoteListResponseSchema = z.object({
  status: z.number(),
  message: z.string().optional(),
  data: NoteListSchema,
});
