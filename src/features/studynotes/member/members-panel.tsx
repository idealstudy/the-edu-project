'use client';

import { useMemo, useState } from 'react';

import Image from 'next/image';

import { Pagination } from '@/components/ui/pagination';
import { members } from '@/features/studynotes/data/member-mock';
import { SearchFilterBar } from '@/features/studyrooms/components/studynotes/search-filter-bar';
import {
  StudyNoteLimit,
  StudyNoteSortKey,
} from '@/features/studyrooms/components/studynotes/type';

export type Member = {
  id: string;
  name: string;
  email: string;
  guardianCount?: number;
  joinedText: string;
  avatarSrc?: string;
};

export default function MembersPanel() {
  // --- pagination (기존)
  const [currentPage, setCurrentPage] = useState(0);
  const handlePageChange = (page: number) => setCurrentPage(page);

  const page = {
    page: currentPage,
    totalPages: 1,
    onPageChange: handlePageChange,
  };

  // --- filter bar state
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<StudyNoteSortKey>('LATEST_EDITED');
  const [limit, setLimit] = useState<StudyNoteLimit>(20);

  // (선택) 간단한 필터/정렬 예시 — 실제 로직은 프로젝트 기준으로 교체해도 됨
  const viewMembers = useMemo(() => {
    let arr = [...members];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(
        (m) =>
          m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      );
    }

    // 데모 정렬 (실제 서비스에서는 서버/쿼리 파라미터 권장)
    switch (sort) {
      case 'TITLE_ASC':
        arr.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        break;
      case 'OLDEST_EDITED':
        arr.reverse();
        break;
      case 'TAUGHT_AT_ASC':
      case 'LATEST_EDITED':
      default:
        break;
    }

    return arr.slice(0, limit);
  }, [search, sort, limit]);

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 p-4">
        <SearchFilterBar
          search={search}
          sort={sort}
          limit={limit}
          onSearch={(v) => setSearch(v)}
          onSortChange={(v) => setSort(v)}
          onLimitChange={(v) => setLimit(v)}
        />
      </div>

      {/* List */}
      <ul
        role="list"
        className="divide-y divide-zinc-100"
      >
        {viewMembers.map((m, idx) => (
          <li
            key={m.id}
            className={[
              'flex items-center justify-between gap-4 px-4 py-3',
              'hover:bg-zinc-50',
              idx === 4 ? 'bg-zinc-100/70' : '',
            ].join(' ')}
          >
            {/* left: avatar + text + badge */}
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src={m.avatarSrc ?? '/note/student.svg'}
                alt={`${m.name} 프로필`}
                width={28}
                height={28}
                className="h-9 w-9 rounded-full object-cover ring-1 ring-black/5"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {m.name}
                  </p>
                  {m.guardianCount ? (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-500 ring-1 ring-red-100">
                      보호자 {m.guardianCount}
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-xs text-zinc-500">{m.email}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-zinc-500">{m.joinedText}</span>
              <Image
                src="/studynotes/gray-kebab.svg"
                width={28}
                height={28}
                alt="study-notes"
                className="h-[28px] w-[28px] cursor-pointer"
              />
            </div>
          </li>
        ))}
      </ul>

      <Pagination
        {...page}
        className="my-5 justify-center"
      />
    </div>
  );
}
