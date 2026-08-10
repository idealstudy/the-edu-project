'use client';

import Link from 'next/link';

import ColumnCard from '@/features/community/column/components/column-card';
import { ColumnListSkeleton } from '@/features/community/column/components/column-card-skeleton';
import { useColumnList } from '@/features/community/column/hooks/use-column-list';
import { PUBLIC } from '@/shared/constants';

/**
 * 홈 "인기 글" 모듈 — frd-public-portal-v1 §4.1 모듈 순서 3번째,
 * `/board`(column_article) 재사용. SAMPLE_ALLOWED 목록에 있지만(§3.2)
 * 예시 데이터 생성기는 이번 슬라이스 범위 밖이라 0건이면 안전한 P
 * (준비중)로만 렌더한다 — 실제 값이 아닌 것을 실제처럼 보이는 리스크가
 * 없는 쪽을 택함.
 */
export function PortalPopularPosts() {
  const { data, isLoading, isError } = useColumnList({
    page: 0,
    sort: 'POPULAR',
  });

  const posts = data?.content?.slice(0, 3);

  return (
    <section className="mx-auto w-full max-w-360 px-4 py-10 md:px-8 lg:px-20">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-headline2-heading">인기 글</h2>
        <Link
          href={PUBLIC.BOARD.LIST}
          className="font-label-normal text-text-sub2"
        >
          더보기 →
        </Link>
      </div>

      {isLoading && <ColumnListSkeleton />}

      {!isLoading && (isError || !posts || posts.length === 0) && (
        <div className="border-line-line1 rounded-xl border bg-white px-8 py-10 text-center">
          <p className="font-body1-heading">
            {isError ? '글을 불러오지 못했어요' : '칼럼을 준비하고 있습니다'}
          </p>
        </div>
      )}

      {!isLoading && posts && posts.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {posts.map((column) => (
            <ColumnCard
              key={column.id}
              column={column}
            />
          ))}
        </div>
      )}
    </section>
  );
}
