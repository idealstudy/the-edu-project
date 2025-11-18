import { createNotesBaseApi } from '@/features/study-notes/api';
import type { StudyNote } from '@/features/study-notes/model';
import type { PaginationMeta } from '@/types/http';

export type StudentListResp = PaginationMeta & { content: StudyNote[] };

export interface StudentNotesApi
  extends ReturnType<typeof createNotesBaseApi<StudentListResp>> {}

// NOTE: [학생 전용] 여기서 확장
export const createStudentNotesApi = () => ({
  ...createNotesBaseApi<StudentListResp>('ROLE_STUDENT'),
});
