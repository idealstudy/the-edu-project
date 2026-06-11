'use client';

import { useState } from 'react';

import { Button } from '@/shared/components/ui';
import { BookOpen } from 'lucide-react';

import { useCoursesQuery } from '../../hooks';
import { CourseCard } from './course-card';
import { CourseListSkeleton } from './course-list-skeleton';

/* ─────────────────────────────────────────────────────
 * 코스 목록 클라이언트 — 로딩/에러/빈/콘텐츠 4상태 + 더 보기
 *  (백엔드 PageResponse 는 hasNext 만 제공 → size 누적 방식)
 * ────────────────────────────────────────────────────*/
const PAGE_SIZE = 12;

export const CourseListClient = () => {
  const [size, setSize] = useState(PAGE_SIZE);
  const { data, isLoading, isError, isFetching, refetch } = useCoursesQuery(
    0,
    size
  );

  if (isLoading) {
    return <CourseListSkeleton />;
  }

  if (isError) {
    return (
      <div className="border-line-line2 flex flex-col items-center gap-3 rounded-[12px] border bg-white p-12 text-center">
        <p className="font-body2-normal text-text-sub1">
          코스를 불러오지 못했어요.
        </p>
        <Button
          variant="outlined"
          size="small"
          onClick={() => refetch()}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  const courses = data?.content ?? [];

  if (courses.length === 0) {
    return (
      <div className="border-line-line2 flex flex-col items-center gap-2 rounded-[12px] border border-dashed bg-white p-12 text-center">
        <span className="bg-orange-1 text-key-color-primary flex size-14 items-center justify-center rounded-full">
          <BookOpen size={26} />
        </span>
        <p className="font-body2-heading text-text-main">
          아직 열린 코스가 없어요
        </p>
        <p className="font-caption-normal text-text-sub2 text-balance">
          곧 새로운 코스가 준비될 예정이에요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="tablet:[grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] grid grid-cols-1 gap-5">
        {courses.map((course) => (
          <CourseCard
            key={course.courseId}
            course={course}
          />
        ))}
      </div>

      {data?.hasNext && (
        <div className="flex justify-center">
          <Button
            variant="outlined"
            size="small"
            disabled={isFetching}
            onClick={() => setSize((prev) => prev + PAGE_SIZE)}
          >
            {isFetching ? '불러오는 중…' : '더 보기'}
          </Button>
        </div>
      )}
    </div>
  );
};
