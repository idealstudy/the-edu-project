'use client';

import { useState } from 'react';

import { Pagination } from '@/components/ui/pagination';
import { useMemberFilter } from '@/features/studynotes/hooks/use-member-filter';
import { MemberListItem } from '@/features/studynotes/member/member-list-item';
import { SearchFilterBar } from '@/features/studynotes/search-filter-bar';
import { useGetStudyNoteMembers } from '@/features/studynotes/services/query';
import { transformMembersData } from '@/features/studynotes/services/transform';
import { StudyNoteLimit, StudyNoteSortKey } from '@/features/studynotes/type';

type Props = {
  studyRoomId: number;
};

export default function MembersPanel({ studyRoomId }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<StudyNoteSortKey>('LATEST_EDITED');
  const [limit, setLimit] = useState<StudyNoteLimit>(20);

  const { data, isLoading } = useGetStudyNoteMembers({
    studyRoomId,
    page: currentPage,
    size: limit,
  });

  const members = transformMembersData(data?.data);
  const filteredMembers = useMemberFilter(members, search, sort);

  if (isLoading) {
    return (
      <div className="mx-auto flex h-64 w-full max-w-3xl items-center justify-center rounded-2xl border border-zinc-200 bg-white">
        <p className="text-sm text-zinc-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 p-4">
        <SearchFilterBar
          search={search}
          sort={sort}
          limit={limit}
          onSearch={setSearch}
          onSortChange={setSort}
          onLimitChange={setLimit}
        />
      </div>

      <ul
        role="list"
        className="divide-y divide-zinc-100"
      >
        {filteredMembers.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-zinc-500">
            사용자가 없습니다.
          </li>
        ) : (
          filteredMembers.map((member, idx) => (
            <MemberListItem
              key={member.id}
              member={member}
              isHighlighted={idx === 4}
            />
          ))
        )}
      </ul>

      <Pagination
        page={currentPage}
        totalPages={data?.data?.totalPages ?? 1}
        onPageChange={setCurrentPage}
        className="my-5 justify-center"
      />
    </div>
  );
}
