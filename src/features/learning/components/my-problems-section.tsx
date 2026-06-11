'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  type MyChallengeListItem,
  type MyChallengeResultFilter,
  type MyChallengeStatusFilter,
} from '@/entities/open-challenge';
import { MyOpenChallengeDetailDialog } from '@/features/mypage/open-challenge/components/my-open-challenge-detail-dialog';
import { useMyOpenChallenges } from '@/features/mypage/open-challenge/hooks/use-my-open-challenges';
import { MiniSpinner } from '@/shared/components/loading';
import { DropdownMenu, Pagination, StatusBadge } from '@/shared/components/ui';
import { ListItem } from '@/shared/components/ui/list-item';
import { PUBLIC } from '@/shared/constants';
import { cn, getRelativeTimeString } from '@/shared/lib';
import { TriangleAlert } from 'lucide-react';

const DIFFICULTY_LABEL = {
  TOP: '최상',
  HIGH: '상',
  MID: '중',
  LOW: '하',
} as const;

const STATUS_TABS: { value: MyChallengeStatusFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'IN_PROGRESS', label: '시도 중' },
  { value: 'UNRESOLVED', label: '미해결' },
  { value: 'COMPLETED', label: '완료' },
];

const RESULT_FILTERS: { value: MyChallengeResultFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'CORRECT', label: '정답' },
  { value: 'WRONG', label: '오답' },
];

/* 상태별 빈 목록 카피 — 학습 회고 톤(질책 X) */
const EMPTY_COPY: Record<MyChallengeStatusFilter, string> = {
  ALL: '아직 시작한 문제가 없어요. 오늘의 문제로 출발해 볼까요?',
  IN_PROGRESS: '지금 풀고 있는 문제가 없어요.',
  UNRESOLVED: '다시 들여다볼 문제가 없어요. 깔끔하네요.',
  COMPLETED: '아직 끝까지 푼 문제가 없어요.',
};

/* ─────────────────────────────────────────────────────
 * 항목 상태 뱃지
 *  진행 중=강조 / 미해결=경고(회고 톤) / 완료=정답·오답.
 * ────────────────────────────────────────────────────*/
const ItemStatusBadge = ({ item }: { item: MyChallengeListItem }) => {
  if (item.status === 'COMPLETED') {
    if (item.isCorrect === null)
      return (
        <StatusBadge
          variant="default"
          label="채점 전"
        />
      );
    return item.isCorrect ? (
      <StatusBadge
        variant="success"
        label="정답"
      />
    ) : (
      <StatusBadge
        variant="warning"
        label="오답"
      />
    );
  }

  if (item.status === 'UNRESOLVED')
    return (
      <StatusBadge
        variant="warning"
        label="더 풀어볼 문제"
      />
    );

  // IN_PROGRESS · AI_COACHING
  return (
    <StatusBadge
      variant="primary"
      label="진행 중"
    />
  );
};

const buildSubtitle = (item: MyChallengeListItem) => {
  if (item.status === 'COMPLETED' && item.completedAt) {
    return `${item.sourceText} · 마지막 제출 ${getRelativeTimeString(item.completedAt)}`;
  }
  if (item.status === 'UNRESOLVED') {
    return `${item.sourceText} · 다시 도전해 볼 문제`;
  }
  if (item.status === 'IN_PROGRESS' || item.status === 'AI_COACHING') {
    return `${item.sourceText} · 풀이를 이어서 진행해요`;
  }
  return item.sourceText;
};

/* ─────────────────────────────────────────────────────
 * 내 문제 섹션 (학습 허브)
 *  상태 탭(전체/시도 중/미해결/완료) + 완료 시 정답·오답 보조 필터.
 *  목록 + 상세 다이얼로그(mypage 컴포넌트 재사용).
 * ────────────────────────────────────────────────────*/
export const MyProblemsSection = () => {
  const [statusTab, setStatusTab] = useState<MyChallengeStatusFilter>('ALL');
  const [resultFilter, setResultFilter] =
    useState<MyChallengeResultFilter>('ALL');
  const [page, setPage] = useState(1); // 1-based (Pagination 규약)
  const [selected, setSelected] = useState<MyChallengeListItem | null>(null);

  const isCompletedTab = statusTab === 'COMPLETED';

  const { data, isLoading, isError, refetch } = useMyOpenChallenges({
    status: statusTab,
    result: isCompletedTab ? resultFilter : 'ALL',
    page: page - 1,
  });

  const items = data?.content ?? [];
  const totalPages = data?.hasNext ? page + 1 : page;

  const changeStatusTab = (next: MyChallengeStatusFilter) => {
    setStatusTab(next);
    setResultFilter('ALL');
    setPage(1);
  };

  const changeResultFilter = (next: MyChallengeResultFilter) => {
    setResultFilter(next);
    setPage(1);
  };

  return (
    <section
      className="border-line-line1 flex flex-col gap-4 rounded-[12px] border bg-white p-5"
      aria-label="내 문제"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-headline1-heading text-text-main">내 문제</h2>
        <p className="font-caption-normal text-text-sub1">
          시작한 문제를 상태별로 모았어요. 끝까지 못 푼 문제도 다시 도전해
          보세요.
        </p>
      </div>

      {/* 상태 탭 (터치 ≥44px) */}
      <div
        role="tablist"
        aria-label="문제 상태"
        className="flex flex-wrap gap-2"
      >
        {STATUS_TABS.map((tab) => {
          const active = tab.value === statusTab;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => changeStatusTab(tab.value)}
              className={cn(
                'font-label-heading flex h-11 items-center rounded-[8px] border px-4 transition-colors',
                active
                  ? 'border-key-color-primary bg-orange-1 text-key-color-primary'
                  : 'border-line-line1 text-text-sub1 hover:bg-gray-1'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 완료 탭일 때만 정답·오답 보조 필터 */}
      {isCompletedTab && (
        <div
          role="group"
          aria-label="채점 결과 필터"
          className="flex flex-wrap gap-2"
        >
          {RESULT_FILTERS.map((filter) => {
            const active = filter.value === resultFilter;
            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={active}
                onClick={() => changeResultFilter(filter.value)}
                className={cn(
                  'font-label-normal flex h-11 items-center rounded-full border px-4 transition-colors',
                  active
                    ? 'border-key-color-primary text-key-color-primary'
                    : 'border-line-line1 text-text-sub2 hover:bg-gray-1'
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 본문: 로딩 / 에러 / 빈 / 목록 */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <MiniSpinner />
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <TriangleAlert
            size={28}
            className="text-system-warning"
            aria-hidden
          />
          <p className="font-body2-heading text-text-main">
            문제 목록을 불러오지 못했어요.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="bg-key-color-primary font-label-heading flex h-11 items-center rounded-[8px] px-5 text-white"
          >
            다시 시도
          </button>
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="font-body2-heading text-text-main text-balance">
            {EMPTY_COPY[statusTab]}
          </p>
          <Link
            href={PUBLIC.OPEN_CHALLENGE.LIST}
            className="bg-key-color-primary font-label-heading flex h-11 items-center rounded-[8px] px-5 text-white"
          >
            오픈챌린지 가기
          </Link>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="flex flex-col">
            {items.map((item) => (
              <ListItem.Button
                key={item.challengeId}
                id={Number(item.challengeId)}
                title={item.questionText}
                subtitle={buildSubtitle(item)}
                rightTitle={<ItemStatusBadge item={item} />}
                tag={
                  <StatusBadge
                    label={DIFFICULTY_LABEL[item.difficulty]}
                    variant="default"
                  />
                }
                onClick={() => setSelected(item)}
                dropdown={
                  <DropdownMenu>
                    <DropdownMenu.Trigger asChild>
                      <Image
                        src="/studynotes/gray-kebab.svg"
                        width={24}
                        height={24}
                        alt="더보기"
                        className="hover:bg-gray-scale-gray-5 cursor-pointer rounded"
                      />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="w-[132px] justify-center">
                      <DropdownMenu.Item asChild>
                        <Link
                          href={PUBLIC.OPEN_CHALLENGE.DETAIL(item.challengeId)}
                          className="justify-center border-none focus:ring-0 focus:outline-none"
                        >
                          문제 보러가기
                        </Link>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                }
              />
            ))}
          </div>

          <Pagination
            className="mt-2 justify-center"
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {selected && (
        <MyOpenChallengeDetailDialog
          challengeId={selected.challengeId}
          challenge={selected}
          isOpen
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        />
      )}
    </section>
  );
};
