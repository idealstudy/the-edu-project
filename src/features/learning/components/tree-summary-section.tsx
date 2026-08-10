'use client';

import Link from 'next/link';

import { TreeSummary } from '@/features/weakness-tree/components/tree-summary';
import { useMyTreeQuery } from '@/features/weakness-tree/hooks/use-tree';
import { PRIVATE, PUBLIC } from '@/shared/constants';
import { ChevronRight, Sprout, TriangleAlert } from 'lucide-react';

/* ─────────────────────────────────────────────────────
 * 약점 트리 요약 섹션 (학습 허브)
 *  weakness-tree 의 TreeSummary 재사용 + "트리 전체 보기" → /tree.
 *  로딩 / 에러 / 빈(신규=지도 없음) / 정상 4상태.
 * ────────────────────────────────────────────────────*/
export const TreeSummarySection = () => {
  const { data, isLoading, isError, refetch } = useMyTreeQuery();
  const hasNodes = (data?.groups.length ?? 0) > 0;

  return (
    <section
      className="flex flex-col gap-3"
      aria-label="약점 트리 요약"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-headline1-heading text-text-main">약점 트리</h2>
        <Link
          href={PRIVATE.TREE.INDEX}
          className="font-label-heading text-key-color-primary inline-flex h-11 items-center gap-0.5 hover:underline"
        >
          트리 전체 보기
          <ChevronRight
            size={16}
            aria-hidden
          />
        </Link>
      </div>

      {isLoading && (
        <div className="border-line-line1 bg-gray-1/40 rounded-card h-30 w-full animate-pulse border motion-reduce:animate-none" />
      )}

      {isError && !isLoading && (
        <div className="border-line-line1 rounded-card flex flex-col items-center gap-3 border bg-white py-12 text-center">
          <TriangleAlert
            size={28}
            className="text-system-warning"
            aria-hidden
          />
          <p className="font-body2-heading text-text-main">
            트리를 불러오지 못했어요.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="bg-key-color-primary font-label-heading rounded-button flex h-11 items-center px-5 text-white"
          >
            다시 시도
          </button>
        </div>
      )}

      {!isLoading && !isError && !hasNodes && (
        <div className="border-line-line1 rounded-card flex flex-col items-center gap-3 border border-dashed bg-white py-12 text-center">
          <Sprout
            size={28}
            className="text-key-color-primary"
            aria-hidden
          />
          <p className="font-body2-heading text-text-main text-balance">
            아직 채워진 지도가 없어요.
          </p>
          <p className="font-caption-normal text-text-sub1 max-w-80 text-balance">
            첫 문제를 제대로 풀면 단원이 오렌지로 채워지기 시작해요.
          </p>
          <Link
            href={PUBLIC.OPEN_CHALLENGE.LIST}
            className="bg-key-color-primary font-label-heading rounded-button mt-1 flex h-11 items-center px-5 text-white"
          >
            오늘의 문제 시작
          </Link>
        </div>
      )}

      {!isLoading && !isError && hasNodes && data && (
        <TreeSummary mastery={data.mastery} />
      )}
    </section>
  );
};
