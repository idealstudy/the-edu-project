import { StudyNoteQueryKey } from '@/entities/study-note';
import {
  TeacherNotesApi,
  createNotesListQueryOptions,
} from '@/features/study-notes/api';
import { BaseQueryOptions, DEFAULT_QUERY_OPTION } from '@/shared/lib/query';
import { queryOptions } from '@tanstack/react-query';

export type TeacherQueryOptions = ReturnType<
  typeof createTeacherNoteQueryOptions
>;

export const createTeacherNoteQueryOptions = (
  api: TeacherNotesApi,
  base: BaseQueryOptions = {}
) => {
  const opt = { ...DEFAULT_QUERY_OPTION, ...base };
  const common = createNotesListQueryOptions(api, opt);

  const members = (args: {
    studyRoomId: number;
    page?: number;
    size?: number;
  }) => {
    const page = args.page ?? 0;
    const size = args.size ?? 20;
    return queryOptions({
      queryKey: StudyNoteQueryKey.members(args.studyRoomId, page, size),
      queryFn: () =>
        api.getMembers({ studyRoomId: args.studyRoomId, page, size }),
      ...opt,
    });
  };

  return { ...common, members };
};
