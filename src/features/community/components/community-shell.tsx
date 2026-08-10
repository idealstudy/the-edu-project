'use client';

import { useTransition } from 'react';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ColumnListSkeleton } from '@/features/community/column/components/column-card-skeleton';
import { Select } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

const SORT_OPTIONS: Array<{ value: 'LATEST' | 'POPULAR'; label: string }> = [
  { value: 'LATEST', label: '최신순' },
  { value: 'POPULAR', label: '인기순' },
];

const SELECT_STYLES = {
  trigger:
    'border-line-line2 h-9 rounded-button pr-8 pl-2 text-sm w-auto min-w-27.5 text-[var(--color-text-sub2)] whitespace-nowrap mock-[state=open]:border-line-line3 focus:ring-0 focus:outline-none px-3 font-label-normal',
  option:
    'flex h-8 border-b-0 text-center w-full font-body2-normal justify-center items-center',
};

export default function CommunityShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isColumn = pathname === '/community/column';
  const sortBy = searchParams.get('sort') ?? 'LATEST';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set('page', '1');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="mb-4 min-h-screen w-full bg-white">
      <div className="bg-system-background w-full">
        <div className="mx-auto w-full max-w-360 px-4 pt-8 md:px-8 lg:px-20">
          <h1 className="font-title-heading mt-4 mb-10 text-2xl leading-[135%] tracking-tight lg:text-3xl">
            디에듀의 다양한 콘텐츠를 만나보세요
          </h1>
          {/* 탭 메뉴 */}
          <div className="relative flex gap-6 lg:gap-10">
            <Link
              href="/community/column"
              replace
            >
              <div
                className={cn(
                  'relative cursor-pointer px-4 pb-4 text-lg leading-[135%] transition-all lg:text-2xl',
                  isColumn
                    ? 'text-gray-12 font-[700]'
                    : 'text-gray-6 font-[400]'
                )}
              >
                칼럼 게시판
                {isColumn && (
                  <div className="bg-orange-7 absolute bottom-0 left-0 h-1 w-full" />
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 하단 리스트 및 필터 영역 */}
      <div className="w-full bg-white">
        <div className="mx-auto max-w-360 px-4 py-8 md:px-8 lg:px-20">
          <div className="mb-6 flex gap-2">
            <Select
              value={sortBy}
              onValueChange={(v) => updateFilter('sort', v)}
            >
              <Select.Trigger
                className={SELECT_STYLES.trigger}
                placeholder="최신순"
              />
              <Select.Content>
                {SORT_OPTIONS.map((option) => (
                  <Select.Option
                    key={option.value}
                    value={option.value}
                    className={SELECT_STYLES.option}
                  >
                    {option.label}
                  </Select.Option>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="relative">
            <div className={isPending ? 'opacity-0' : 'opacity-100'}>
              {children}
            </div>
            {isPending && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-none">
                {isColumn ? <ColumnListSkeleton /> : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
