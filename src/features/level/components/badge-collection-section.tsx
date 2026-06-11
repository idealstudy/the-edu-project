'use client';

import { type Badge } from '@/entities/level';
import { cn } from '@/shared/lib';
import { Award, Lock, TriangleAlert } from 'lucide-react';

import { useMyBadgesQuery } from '../hooks/use-level';

/* ─────────────────────────────────────────────────────
 * 뱃지 1칸 — 보유=오렌지 컬러 / 미보유=회색 + 획득 조건
 * ────────────────────────────────────────────────────*/
const BadgeCell = ({ badge }: { badge: Badge }) => (
  <li
    className={cn(
      'flex flex-col items-center gap-2 rounded-[12px] border p-4 text-center transition-colors',
      badge.earned
        ? 'border-orange-3 bg-orange-1'
        : 'border-line-line1 bg-white'
    )}
  >
    <div
      className={cn(
        'relative flex h-14 w-14 items-center justify-center rounded-full',
        badge.earned ? 'bg-orange-7/10' : 'bg-gray-1'
      )}
    >
      {badge.icon ? (
        <span
          className={cn(
            'text-2xl leading-none',
            !badge.earned && 'opacity-40 grayscale'
          )}
          aria-hidden
        >
          {badge.icon}
        </span>
      ) : (
        <Award
          size={26}
          className={badge.earned ? 'text-orange-7' : 'text-text-sub2'}
          aria-hidden
        />
      )}

      {!badge.earned && (
        <span className="bg-gray-1 border-line-line1 absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border">
          <Lock
            size={11}
            className="text-text-sub2"
            aria-hidden
          />
        </span>
      )}
    </div>

    <span
      className={cn(
        'font-label-heading text-balance',
        badge.earned ? 'text-text-main' : 'text-text-sub2'
      )}
    >
      {badge.name}
    </span>

    <span className="font-caption-normal text-text-sub2 leading-relaxed text-balance">
      {badge.earned ? badge.description : badge.conditionLabel}
    </span>
  </li>
);

/* ─────────────────────────────────────────────────────
 * 뱃지 컬렉션 섹션 (학습 허브)
 *  GET /api/common/me/badges — 보유 + 미보유 카탈로그 그리드.
 *  로딩 / 에러 / 빈(카탈로그 없음) / 정상 4상태.
 * ────────────────────────────────────────────────────*/
export const BadgeCollectionSection = () => {
  const { data, isLoading, isError, refetch } = useMyBadgesQuery();
  const badges = data ?? [];
  const earnedCount = badges.filter((badge) => badge.earned).length;

  return (
    <section
      className="flex flex-col gap-3"
      aria-label="뱃지 컬렉션"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-headline1-heading text-text-main">뱃지</h2>
        {!isLoading && !isError && badges.length > 0 && (
          <span className="font-label-heading text-text-sub1 tabular-nums">
            {earnedCount} / {badges.length}
          </span>
        )}
      </div>

      {isLoading && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <li
              key={index}
              className="border-line-line1 bg-gray-1/40 h-[150px] animate-pulse rounded-[12px] border motion-reduce:animate-none"
            />
          ))}
        </ul>
      )}

      {isError && !isLoading && (
        <div className="border-line-line1 flex flex-col items-center gap-3 rounded-[12px] border bg-white py-12 text-center">
          <TriangleAlert
            size={28}
            className="text-system-warning"
            aria-hidden
          />
          <p className="font-body2-heading text-text-main">
            뱃지를 불러오지 못했어요.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="bg-orange-7 font-label-heading flex h-11 items-center rounded-[8px] px-5 text-white"
          >
            다시 시도
          </button>
        </div>
      )}

      {!isLoading && !isError && badges.length === 0 && (
        <div className="border-line-line1 flex flex-col items-center gap-3 rounded-[12px] border border-dashed bg-white py-12 text-center">
          <Award
            size={28}
            className="text-orange-7"
            aria-hidden
          />
          <p className="font-body2-heading text-text-main text-balance">
            아직 모을 수 있는 뱃지가 없어요.
          </p>
          <p className="font-caption-normal text-text-sub1 max-w-[320px] text-balance">
            문제를 제대로 풀어 가면 새로운 뱃지가 열려요.
          </p>
        </div>
      )}

      {!isLoading && !isError && badges.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {badges.map((badge) => (
            <BadgeCell
              key={badge.id}
              badge={badge}
            />
          ))}
        </ul>
      )}
    </section>
  );
};
