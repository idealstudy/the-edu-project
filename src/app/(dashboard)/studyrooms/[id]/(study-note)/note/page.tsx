'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { StudyNotesList } from '@/features/study-notes/list';
import {
  useStudyNotesByGroupIdQuery,
  useStudyNotesQuery,
} from '@/features/study-notes/services/query';
import type {
  StudyNoteGroupPageable,
  StudyNoteLimit,
  StudyNoteSortKey,
} from '@/features/study-notes/type';
import { StudyRoomDetailLayout } from '@/features/study-rooms/components/common/layout';
import { useRole } from '@/hooks/use-role';

export default function StudyNotePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedGroupId = 'all';

  const currentPage = useMemo(() => {
    const raw = searchParams.get('page');
    const n = raw == null ? 0 : Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [searchParams]);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<StudyNoteSortKey>('LATEST_EDITED');
  const [limit, setLimit] = useState<StudyNoteLimit>(20);

  const { role } = useRole();
  const { id } = useParams();
  const studyRoomId = Number(id);

  const pageable: StudyNoteGroupPageable = {
    page: currentPage,
    size: limit,
    sortKey: sort,
  };

  const { data: studyNotes } = useStudyNotesQuery(role, {
    studyRoomId,
    pageable /*, keyword: search*/,
  });

  const { data: studyNotesByGroupId } = useStudyNotesByGroupIdQuery(role, {
    studyRoomId,
    teachingNoteGroupId: Number(selectedGroupId),
    pageable,
    enabled: selectedGroupId !== 'all',
  });

  const setPage = useCallback(
    (page: number, { replace = false }: { replace?: boolean } = {}) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set('page', String(page));

      const href = `${pathname}?${next.toString()}`;
      if (replace) router.replace(href);
      else router.push(href);
    },
    [pathname, searchParams, router]
  );

  const handlePageChange = (page: number) => setPage(page);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0, { replace: true }); // 히스토리 누적 방지
  };

  const handleSortChange = (value: StudyNoteSortKey) => {
    setSort(value);
    setPage(0, { replace: true });
  };

  const handleLimitChange = (value: StudyNoteLimit) => {
    setLimit(value);
    setPage(0, { replace: true });
  };

  // Todo: 재설계 예정 -> 그룹 변경 시 page=0 (URL만 수정)
  useEffect(() => {
    setPage(0, { replace: true });
  }, [selectedGroupId, setPage]);

  const page = {
    page: currentPage,
    totalPages:
      selectedGroupId === 'all'
        ? studyNotes?.totalPages || 1
        : studyNotesByGroupId?.totalPages || 1,
    onPageChange: handlePageChange,
  };

  return (
    <StudyRoomDetailLayout
      search={search}
      sort={sort}
      limit={limit}
      onSearch={handleSearch}
      onSortChange={handleSortChange}
      onLimitChange={handleLimitChange}
      page={page}
    >
      <StudyNotesList
        data={
          selectedGroupId === 'all'
            ? studyNotes?.content || []
            : studyNotesByGroupId?.content || []
        }
        studyRoomId={studyRoomId}
        pageable={pageable}
        keyword={search}
      />
    </StudyRoomDetailLayout>
  );
}
