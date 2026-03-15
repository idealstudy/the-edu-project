'use client';

import { useTransition } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

import ColumnCard from '@/features/community/column/components/column-card';
import { Pagination } from '@/shared/components/ui';

type SortOption = 'LATEST' | 'POPULAR';

const parseSort = (value?: string): SortOption => {
  if (value === 'POPULAR') return value;
  return 'LATEST';
};

const parsePage = (value?: string) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
};

export default function ColumnList() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = parseSort(searchParams.get('sort') ?? undefined);
  const currentPage = parsePage(searchParams.get('page') ?? undefined);

  const router = useRouter();
  const [, startTransition] = useTransition();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    });
  };

  // TODO 데이터 패칭
  // const { data } = useColumnListQuery({ sort, page });

  return (
    <>
      <div className="tablet:grid-cols-2 grid gap-6">
        {sort}
        <ColumnCard />
        <ColumnCard />
        <ColumnCard />
        <ColumnCard />
        <ColumnCard />
        <ColumnCard />
        <ColumnCard />
        <ColumnCard />
        <ColumnCard />
        <ColumnCard />
        <ColumnCard />
        <ColumnCard />
      </div>
      <Pagination
        className="mt-10 justify-center"
        page={currentPage}
        totalPages={10}
        onPageChange={handlePageChange}
      />
    </>
  );
}
