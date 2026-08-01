'use client';

import Link from 'next/link';

import { Button } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants/route';
import { BookOpen, ChevronRight } from 'lucide-react';

import { useUnitNoteLibraryQuery } from '../hooks/use-unit-note-query';

export const UnitNoteEntryCard = () => {
  const libraryQuery = useUnitNoteLibraryQuery();
  const nodesWithNotes =
    libraryQuery.data?.nodes.filter((node) => node.pageCount > 0).length ?? 0;
  const totalPages = libraryQuery.data?.totalPages ?? 0;

  return (
    <section
      className="border-gray-3 bg-gray-white rounded-xl border p-5"
      data-testid="unit-note-entry-card"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-orange-1 text-orange-8 flex size-11 shrink-0 items-center justify-center rounded-xl">
            <BookOpen
              size={23}
              aria-hidden
            />
          </span>
          <div>
            <h2 className="font-headline2-heading text-gray-12">나의 단권화</h2>
            <p className="font-body2-normal text-gray-8 mt-1">
              선생님 판서와 내 필기, 관련 오답을 개념별로 한 권에 쌓아요.
            </p>
            {!libraryQuery.isPending && !libraryQuery.isError && (
              <p className="font-caption-heading text-orange-10 mt-2">
                {nodesWithNotes}개 소단원 · 내 페이지 {totalPages}장
              </p>
            )}
          </div>
        </div>
        <Button
          asChild
          variant="outlined"
          size="small"
        >
          <Link href={PRIVATE.DASHBOARD.UNIT_NOTES}>
            책장 열기
            <ChevronRight
              size={17}
              aria-hidden
            />
          </Link>
        </Button>
      </div>
    </section>
  );
};
