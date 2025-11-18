import {
  StudentNotesApi,
  createNotesListQueryOptions,
} from '@/features/study-notes/api';
import { BaseQueryOptions } from '@/shared/lib/query/types';

export type StudentQueryOptions = ReturnType<
  typeof createStudentNoteQueryOptions
>;

export type StudentNotesApiWithOptionalDetail = StudentNotesApi & {
  getDetail?: (teachingNoteId: number) => Promise<unknown>;
};

export const createStudentNoteQueryOptions = (
  api: StudentNotesApiWithOptionalDetail,
  base: BaseQueryOptions = {}
) => {
  return createNotesListQueryOptions(api, base);
};
