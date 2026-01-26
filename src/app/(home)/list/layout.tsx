'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { Button } from '@/shared/components/ui/button';

export default function ListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sortBy = searchParams.get('sort') ?? 'NEWEST';

  const isTeachers = pathname === '/list/teachers';
  const isStudyRooms = pathname === '/list/study-rooms-list';

  const createHref = (sort: string) => `${pathname}?sort=${sort}`;

  return (
    <div className="bg-system-background min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="font-title-heading text-text-main mb-4">디에듀 101</h1>
          <p className="font-body1-normal text-text-sub1">
            최근 가입한 선생님들의 프로필과 스터디룸을 확인해보세요
          </p>
        </div>

        {/* 탭 */}
        <div className="mb-8 flex justify-center gap-4">
          <Link href={`/list/teachers?sort=${sortBy}`}>
            <Button variant={isTeachers ? 'primary' : 'outlined'}>
              강사 프로필
            </Button>
          </Link>
          <Link href={`/list/study-rooms-list?sort=${sortBy}`}>
            <Button variant={isStudyRooms ? 'primary' : 'outlined'}>
              스터디룸 목록
            </Button>
          </Link>
        </div>

        {/* 정렬 */}
        <div className="mb-6 flex justify-end gap-2">
          {(['NEWEST', 'OLDEST', 'ALPHABETICAL'] as const).map((sort) => (
            <Link
              key={sort}
              href={createHref(sort)}
            >
              <Button
                size="xsmall"
                variant={sortBy === sort ? 'primary' : 'outlined'}
              >
                {sort === 'NEWEST'
                  ? '최신순'
                  : sort === 'OLDEST'
                    ? '오래된순'
                    : '가나다순'}
              </Button>
            </Link>
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}
