// api
import { createStudentNotesApi } from '@/features/study-notes/api/note.api.student';
import type { StudentNotesApi } from '@/features/study-notes/api/note.api.student';
import { createTeacherNotesApi } from '@/features/study-notes/api/note.api.teacher';
import type { TeacherNotesApi } from '@/features/study-notes/api/note.api.teacher';
import { createTeacherNoteMutationOptions } from '@/features/study-notes/api/note.mutation.options.teacher';
// 쿼리옵션
import { createStudentNoteQueryOptions } from '@/features/study-notes/api/note.query.options.student';
import { createTeacherNoteQueryOptions } from '@/features/study-notes/api/note.query.options.teacher';

export { createNotesBaseApi } from '@/features/study-notes/api/note.api.base';
export type { TeacherNotesApi } from '@/features/study-notes/api/note.api.teacher';
export type { StudentNotesApi } from '@/features/study-notes/api/note.api.student';

// 쿼리키, 헬퍼
export { StudyNoteQueryKey } from '@/features/study-notes/api/note.query.key';

export * from '@/features/study-notes/api/note.query.options.base';
export * from '@/features/study-notes/api/note.query.options.teacher';
export * from '@/features/study-notes/api/note.query.options.student';
export * from '@/features/study-notes/api/note.mutation.options.teacher';

// api 인스턴스 / 쿼리(뮤테이션)옵션 생성
export const teacherApi: TeacherNotesApi = createTeacherNotesApi();
export const studentApi: StudentNotesApi = createStudentNotesApi();

export const teacherQo = createTeacherNoteQueryOptions(teacherApi);
export const studentQo = createStudentNoteQueryOptions(studentApi);
export const teacherMutationOptions =
  createTeacherNoteMutationOptions(teacherApi);
