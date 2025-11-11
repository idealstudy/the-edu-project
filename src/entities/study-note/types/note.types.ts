import {
  NoteListResponseSchema,
  NoteListSchema,
  NoteSchema,
} from '@/entities/study-note/types/schema';
import { z } from 'zod';

export type Note = z.infer<typeof NoteSchema>;
export type NoteList = z.infer<typeof NoteListSchema>;
export type NoteListResponse = z.infer<typeof NoteListResponseSchema>;
