'use client';

import Link from 'next/link';

import { PRIVATE } from '@/shared/constants';
import { ChevronRight, TriangleAlert, UserRound, Users } from 'lucide-react';

import { useChildrenQuery } from '../hooks/use-parent-report';

/* ─────────────────────────────────────────────────────
 * 학부모 대시보드 — 자녀 목록
 *  GET /api/parent/children → 자녀별 카드(리포트로 진입).
 *  로딩 / 에러 / 빈(연결된 자녀 없음) / 정상 4상태.
 *  톤: 회고·격려(질책 금지).
 * ────────────────────────────────────────────────────*/
export const ParentDashboardClient = () => {
  const { data, isLoading, isError, refetch } = useChildrenQuery();
  const children = data ?? [];

  if (isLoading) {
    return (
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <li
            key={index}
            className="border-line-line1 bg-gray-1/40 rounded-card h-22 animate-pulse border motion-reduce:animate-none"
          />
        ))}
      </ul>
    );
  }

  if (isError) {
    return (
      <div className="border-line-line1 rounded-card flex flex-col items-center gap-3 border bg-white py-14 text-center">
        <TriangleAlert
          size={28}
          className="text-system-warning"
          aria-hidden
        />
        <p className="font-body2-heading text-text-main">
          자녀 목록을 불러오지 못했어요.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="bg-orange-7 font-label-heading rounded-button flex h-11 items-center px-5 text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="border-line-line1 rounded-card flex flex-col items-center gap-3 border border-dashed bg-white py-14 text-center">
        <Users
          size={28}
          className="text-orange-7"
          aria-hidden
        />
        <p className="font-body2-heading text-text-main text-balance">
          아직 연결된 자녀가 없어요.
        </p>
        <p className="font-caption-normal text-text-sub1 max-w-90 text-balance">
          자녀가 학습을 시작하고 연결되면 이곳에서 학습 리포트를 볼 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {children.map((child) => (
        <li key={child.childId}>
          <Link
            href={PRIVATE.PARENT.CHILD_REPORT(child.childId)}
            className="border-line-line1 hover:border-orange-3 hover:bg-orange-1/40 rounded-card flex min-h-22 items-center gap-4 border bg-white p-5 transition-colors"
          >
            <span className="bg-orange-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
              <UserRound
                size={24}
                className="text-orange-7"
                aria-hidden
              />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="font-body1-heading text-text-main truncate">
                {child.childName}
              </span>
              <span className="font-caption-normal text-text-sub1">
                학습 리포트 보기
              </span>
            </span>
            <ChevronRight
              size={20}
              className="text-text-sub2 ml-auto shrink-0"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
};
