'use client';

import { useMemo, useState } from 'react';

import { SearchInput } from '@/shared/components/ui';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib';

import { useAdminStudyRooms } from '../hooks/use-admin-operations';

const states = [
  ['ACTIVE', '운영 중'],
  ['RECRUITING', '모집 중'],
  ['ENDED', '종료됨'],
] as const;

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(value))
    : '기록 없음';

export const AdminStudyRooms = () => {
  const [state, setState] = useState<(typeof states)[number][0] | undefined>();
  const [searchValue, setSearchValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [showAllEnded, setShowAllEnded] = useState(false);
  const params = useMemo(
    () => ({
      state,
      keyword: keyword || undefined,
      page: 0,
      size: showAllEnded ? 100 : 20,
    }),
    [keyword, showAllEnded, state]
  );
  const query = useAdminStudyRooms(params);

  return (
    <main
      className="p-[14px] md:p-[22px]"
      data-testid="admin-study-rooms"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-[19px] font-extrabold">수업 전체</h1>
        <span className="text-xs text-[#71717a]">
          회원 관리가 사람 목록이라면 이 화면은{' '}
          <b className="text-[#27272a]">누가 누구를 가르치는가</b>를 보는 관계
          목록입니다.
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {states.map(([value, label]) => (
          <UnstyledButton
            variant="unstyled"
            size="none"
            key={value}
            type="button"
            className={cn(
              'flex min-h-[42px] items-center gap-2 rounded-lg border px-3 text-xs font-bold',
              (state === undefined && value === 'ACTIVE') || state === value
                ? 'border-[#c2410c] bg-[#fff7ed] text-[#9a3412]'
                : 'border-[#e4e4e7] bg-white text-[#3f3f46]'
            )}
            onClick={() => {
              setState(value);
              setShowAllEnded(false);
            }}
          >
            {label}{' '}
            <b className="tabular-nums">
              {query.data?.stateCounts[value] ?? 0}
            </b>
          </UnstyledButton>
        ))}
        <SearchInput
          className="min-w-[180px] flex-1 bg-white"
          value={searchValue}
          onChange={setSearchValue}
          onSearch={(value) => setKeyword(value.trim())}
          placeholder="선생님 이름, 학생 이름, 수업 이름으로 검색"
        />
      </div>
      {query.isPending && (
        <section className="rounded-xl border border-[#e4e4e7] bg-white p-10 text-center text-xs text-[#71717a]">
          수업 관계를 불러오는 중입니다.
        </section>
      )}
      {query.isError && (
        <section className="rounded-[10px] border border-[#f0c4c0] bg-[#fff4f2] p-4 text-xs text-[#a81b0e]">
          수업 전체 목록을 불러오지 못했어요.
        </section>
      )}
      {query.data && (
        <div className="overflow-x-auto rounded-xl border border-[#e4e4e7] bg-white px-2 py-1.5">
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead>
              <tr className="text-[10.5px] text-[#71717a]">
                {[
                  '수업',
                  '선생님',
                  '학생',
                  '상태',
                  '만든 날',
                  '마지막 활동',
                ].map((label) => (
                  <th
                    key={label}
                    className="border-b border-[#e4e4e7] px-2.5 py-2 font-extrabold"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {query.data.content.map((room) => (
                <tr
                  key={room.studyRoomId}
                  className="hover:bg-[#fff7ed]"
                >
                  <td className="border-b border-[#f4f4f5] px-2.5 py-3 font-bold">
                    {room.name}
                  </td>
                  <td className="border-b border-[#f4f4f5] px-2.5 py-3 text-[11px] text-[#52525b]">
                    {room.teacherName}
                  </td>
                  <td className="border-b border-[#f4f4f5] px-2.5 py-3 text-[11px] text-[#52525b]">
                    {room.studentCount > 1
                      ? `${room.studentName} 외 ${room.studentCount - 1}명`
                      : room.studentName}
                  </td>
                  <td className="border-b border-[#f4f4f5] px-2.5 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2 py-1 text-[10.5px] font-extrabold',
                        room.state === 'ENDED'
                          ? 'bg-[#fff7ed] text-[#c2410c]'
                          : 'bg-[#f0fdf4] text-[#15803d]'
                      )}
                    >
                      {states.find(([value]) => value === room.state)?.[1]}
                    </span>
                  </td>
                  <td className="border-b border-[#f4f4f5] px-2.5 py-3 text-[11px] text-[#52525b] tabular-nums">
                    {date(room.startedAt)}
                  </td>
                  <td className="border-b border-[#f4f4f5] px-2.5 py-3 text-[11px] text-[#52525b] tabular-nums">
                    {date(room.lastLessonAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(state === undefined || state === 'ENDED') &&
        !showAllEnded &&
        (query.data?.stateCounts.ENDED ?? 0) > 1 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white p-3 text-xs text-[#71717a]">
            종료된 수업은 최근 1건만 폈습니다. 나머지{' '}
            <b>{(query.data?.stateCounts.ENDED ?? 1) - 1}개</b>는 접어 두었어요.
            <UnstyledButton
              variant="unstyled"
              size="none"
              type="button"
              className="ml-auto min-h-11 rounded-lg border border-[#e4e4e7] px-3 font-extrabold text-[#27272a]"
              onClick={() => setShowAllEnded(true)}
            >
              종료분 전체 보기
            </UnstyledButton>
          </div>
        )}
      <p className="mt-3 text-xs leading-6 text-[#71717a]">
        관리자는 <b className="text-[#27272a]">수업 내용을 열지 않습니다.</b>{' '}
        노트, 오답, 회고 같은 학습 데이터는 이 화면에서 접근할 수 없습니다(학습
        데이터 격리, §5.4). 학생 화면을 실제로 봐야 하면 그 학생에게 화면 녹화를
        요청합니다.
      </p>
    </main>
  );
};
