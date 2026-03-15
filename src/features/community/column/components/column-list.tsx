'use client';

import { useTransition } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

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
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {sort}
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
