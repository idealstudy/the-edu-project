import type { Role } from '@/features/auth/types';
import { StudyRoomsGroupQueryKey } from '@/features/study-rooms';
import type { StudyNoteGroup } from '@/features/study-rooms/model/types';
import type { Pageable, PaginationMeta } from '@/types/http';
import { infiniteQueryOptions } from '@tanstack/react-query';

// TODO: 추후 Study Notes Group 엔티티를 분리해서 Study Notes 내부로 옮겨지거나 API 주입 방식으로 전환
type StudyNoteGroupPage = PaginationMeta & { content: StudyNoteGroup[] };

type InfiniteGroupApi = (args: {
  studyRoomId: number;
  pageable: Pageable;
}) => Promise<StudyNoteGroupPage>;

export const createStudyNoteGroupInfiniteOption = (
  teacherApiFn: InfiniteGroupApi,
  studentApiFn: InfiniteGroupApi
) => {
  return (
    role: Role | undefined,
    args: { studyRoomId: number; pageable: Pageable }
  ) =>
    infiniteQueryOptions({
      queryKey: [StudyRoomsGroupQueryKey.all, args, role] as const,
      queryFn: async ({ pageParam = 0 }) => {
        if (role !== 'ROLE_TEACHER' && role !== 'ROLE_STUDENT') {
          throw new Error('role not ready');
        }

        const req = {
          ...args,
          pageable: { ...args.pageable, page: pageParam },
        };

        if (role === 'ROLE_TEACHER') return teacherApiFn(req);
        return studentApiFn(req);
      },
      initialPageParam: 0,
      getNextPageParam: (
        lastPage: PaginationMeta & { content: StudyNoteGroup[] }
      ) => {
        if (lastPage.pageNumber >= lastPage.totalPages - 1) return undefined;
        return lastPage.pageNumber + 1;
      },
      enabled: !!role && (role === 'ROLE_TEACHER' || role === 'ROLE_STUDENT'),
    });
};