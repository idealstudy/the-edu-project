'use client';

import { useMemo, useState } from 'react';

import { PageLayout } from '@/layout';
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
    <PageLayout
      width="fluid"
      data-testid="admin-study-rooms"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-extrabold">수업 전체</h1>
        <span className="text-gray-8 text-xs">
          회원 관리가 사람 목록이라면 이 화면은{' '}
          <b className="text-gray-12">누가 누구를 가르치는가</b>를 보는 관계
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
              '-0 flex items-center gap-2 rounded-lg border px-3 text-xs font-bold',
              (state === undefined && value === 'ACTIVE') || state === value
                ? 'bg-orange-1 text-orange-11 border-orange-10'
                : 'border-gray-3 text-gray-11 bg-white'
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
          className="-0 flex-1 bg-white"
          value={searchValue}
          onChange={setSearchValue}
          onSearch={(value) => setKeyword(value.trim())}
          placeholder="선생님 이름, 학생 이름, 수업 이름으로 검색"
        />
      </div>
      {query.isPending && (
        <section className="border-gray-3 text-gray-8 rounded-xl border bg-white p-10 text-center text-xs">
          수업 관계를 불러오는 중입니다.
        </section>
      )}
      {query.isError && (
        <section className="border-red-3 bg-red-1 text-red-10 rounded-row border p-4 text-xs">
          수업 전체 목록을 불러오지 못했어요.
        </section>
      )}
      {query.data && (
        <div className="border-gray-3 overflow-x-auto rounded-xl border bg-white px-2 py-1.5">
          <table className="-0 w-full border-collapse text-left text-xs">
            <thead>
              <tr className="text-gray-8 text-ui-compact">
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
                    className="border-gray-3 border-b px-2.5 py-2 font-extrabold"
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
                  className="hover:bg-orange-1"
                >
                  <td className="border-gray-1 border-b px-2.5 py-3 font-bold">
                    {room.name}
                  </td>
                  <td className="border-gray-1 text-gray-10 text-ui-choice border-b px-2.5 py-3">
                    {room.teacherName}
                  </td>
                  <td className="border-gray-1 text-gray-10 text-ui-choice border-b px-2.5 py-3">
                    {room.studentCount > 1
                      ? `${room.studentName} 외 ${room.studentCount - 1}명`
                      : room.studentName}
                  </td>
                  <td className="border-gray-1 border-b px-2.5 py-3">
                    <span
                      className={cn(
                        'text-ui-compact rounded-full px-2 py-1 font-extrabold',
                        room.state === 'ENDED'
                          ? 'bg-orange-1 text-orange-10'
                          : 'bg-system-success-alt text-system-success'
                      )}
                    >
                      {states.find(([value]) => value === room.state)?.[1]}
                    </span>
                  </td>
                  <td className="border-gray-1 text-gray-10 text-ui-choice border-b px-2.5 py-3 tabular-nums">
                    {date(room.startedAt)}
                  </td>
                  <td className="border-gray-1 text-gray-10 text-ui-choice border-b px-2.5 py-3 tabular-nums">
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
          <div className="border-gray-3 text-gray-8 mt-3 flex items-center gap-2 rounded-lg border bg-white p-3 text-xs">
            종료된 수업은 최근 1건만 폈습니다. 나머지{' '}
            <b>{(query.data?.stateCounts.ENDED ?? 1) - 1}개</b>는 접어 두었어요.
            <UnstyledButton
              variant="unstyled"
              size="none"
              type="button"
              className="border-gray-3 text-gray-12 ml-auto min-h-11 rounded-lg border px-3 font-extrabold"
              onClick={() => setShowAllEnded(true)}
            >
              종료분 전체 보기
            </UnstyledButton>
          </div>
        )}
      <p className="text-gray-8 mt-3 text-xs leading-6">
        관리자는 <b className="text-gray-12">수업 내용을 열지 않습니다.</b>{' '}
        노트, 오답, 회고 같은 학습 데이터는 이 화면에서 접근할 수 없습니다(학습
        데이터 격리, §5.4). 학생 화면을 실제로 봐야 하면 그 학생에게 화면 녹화를
        요청합니다.
      </p>
    </PageLayout>
  );
};
