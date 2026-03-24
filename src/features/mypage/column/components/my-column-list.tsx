'use client';

import { useTransition } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useMyColumns } from '@/features/mypage/column/hooks/use-my-columns';
import SectionContainer from '@/features/profile/components/section-container';
import { Pagination } from '@/shared/components/ui';
import { ListItem } from '@/shared/components/ui/list-item';
import { PUBLIC } from '@/shared/constants';
import { cn, getRelativeTimeString } from '@/shared/lib';

const parsePage = (value?: string) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
};

const COLUMN_STATUS_LABEL = { PENDING_APPROVAL: '승인 대기', APPROVED: '승인' };

export default function MyColumnList() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const currentPage = parsePage(searchParams.get('page') ?? undefined);

  const { data, isLoading, isError, refetch } = useMyColumns({
    page: currentPage - 1,
  });

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    });
  };

  return (
    <SectionContainer
      title="내 칼럼 목록"
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    >
      {data && data.content.length > 0 ? (
        <>
          {data.content.map((column) => (
            <ListItem
              key={column.id}
              id={column.id}
              title={column.title}
              href={
                // TODO: 승인 대기 중인 칼럼 상세 조회 API 연결 후 별도 처리 필요
                column.status === 'PENDING_APPROVAL'
                  ? '#'
                  : PUBLIC.COMMUNITY.COLUMN.DETAIL(column.id)
              }
              subtitle={`조회수 ${column.viewCount} | 작성일 ${getRelativeTimeString(column.regDate)}`}
              rightTitle={
                <span
                  className={cn(
                    'font-label-normal px-3 py-1.5 whitespace-nowrap',
                    column.status === 'PENDING_APPROVAL'
                      ? 'bg-gray-1'
                      : 'bg-orange-1 text-key-color-primary'
                  )}
                >
                  {COLUMN_STATUS_LABEL[column.status]}
                </span>
              }
            />
          ))}
          <Pagination
            className="mt-6 justify-center"
            page={currentPage}
            totalPages={data.totalPages ?? 1}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <p className="text-gray-5 py-10 text-center text-sm">
          작성한 칼럼이 없습니다.
        </p>
      )}
    </SectionContainer>
  );
}
