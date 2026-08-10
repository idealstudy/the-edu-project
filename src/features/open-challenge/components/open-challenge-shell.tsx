'use client';

import { useTransition } from 'react';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ChallengeListSkeleton } from '@/features/open-challenge/components/list/challenge-list-skeleton';
import { Select } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

const SORT_OPTIONS: Array<{ value: 'latest' | 'popular'; label: string }> = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
];

const SELECT_STYLES = {
  trigger:
    'border-line-line2 h-9 rounded-button pr-8 pl-2 text-sm w-auto min-w-27.5 text-[var(--color-text-sub2)] whitespace-nowrap mock-[state=open]:border-line-line3 focus:ring-0 focus:outline-none px-3 font-label-normal',
  option:
    'flex h-8 border-b-0 text-center w-full font-body2-normal justify-center items-center',
};

export default function OpenChallengeShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isOpenChallenge = pathname === '/' || pathname === '/open-challenge';
  const sortBy = searchParams.get('sort') ?? 'latest';

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
            디에듀 AI와 함께 문제를 풀어보세요
          </h1>

          <div className="relative flex gap-6 lg:gap-10">
            <Link
              href="/"
              replace
            >
              <div
                className={cn(
                  'relative cursor-pointer px-4 pb-4 text-lg leading-[135%] transition-all lg:text-2xl',
                  isOpenChallenge
                    ? 'font-[700] text-[#1A1A1A]'
                    : 'font-[400] text-[#AAAAAA]'
                )}
              >
                오픈챌린지
                {isOpenChallenge && (
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-[#FF5C35]" />
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full bg-white">
        <div className="mx-auto max-w-360 px-4 py-8 md:px-8 lg:px-20">
          <div className="mb-6 flex gap-2">
            <Select
              value={sortBy}
              onValueChange={(value) => updateFilter('sort', value)}
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
                {isOpenChallenge ? <ChallengeListSkeleton /> : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
