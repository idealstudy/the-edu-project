'use client';

import { useTransition } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ColumnSortOption } from '@/entities/column';
import ColumnCard from '@/features/community/column/components/column-card';
import { ColumnListSkeleton } from '@/features/community/column/components/column-card-skeleton';
import { useColumnList } from '@/features/community/column/hooks/use-column-list';
import { Pagination } from '@/shared/components/ui';

const parseSort = (value?: string): ColumnSortOption => {
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

  const { data, isLoading } = useColumnList({ page: currentPage - 1, sort });

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    });
  };

  if (isLoading) return <ColumnListSkeleton />;

  return (
    <>
      <div className="tablet:grid-cols-2 grid gap-6">
        {data?.content.map((column) => (
          <ColumnCard
            key={column.id}
            column={column}
          />
        ))}
      </div>
      <Pagination
        className="mt-10 justify-center"
        page={currentPage}
        totalPages={data?.totalPages ?? 1}
        onPageChange={handlePageChange}
      />
    </>
  );
}
