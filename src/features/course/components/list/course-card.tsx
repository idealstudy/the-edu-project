import Link from 'next/link';

import { type CourseListItem } from '@/entities/course';
import { StatusBadge } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { BookOpen } from 'lucide-react';

import { courseSubjectLabel, priceLabel } from '../../lib/format';

/* ─────────────────────────────────────────────────────
 * 코스 카드 — 목록 아이템
 * ────────────────────────────────────────────────────*/
export const CourseCard = ({ course }: { course: CourseListItem }) => (
  <Link
    href={PUBLIC.COURSE.DETAIL(course.courseId)}
    data-testid="course-card"
    className="border-line-line2 hover:border-key-color-primary group flex flex-col gap-4 rounded-[12px] border bg-white p-5 transition-colors"
  >
    <div className="flex items-start justify-between gap-3">
      <span className="bg-orange-1 text-key-color-primary flex size-11 shrink-0 items-center justify-center rounded-[12px]">
        <BookOpen size={22} />
      </span>
      <StatusBadge
        variant="primary"
        label={courseSubjectLabel(course.subject)}
      />
    </div>

    <div className="flex min-w-0 flex-col gap-1">
      <h3 className="font-body1-heading text-text-main group-hover:text-key-color-primary line-clamp-2 text-balance transition-colors">
        {course.title}
      </h3>
      {course.description && (
        <p className="font-caption-normal text-text-sub2 line-clamp-2">
          {course.description}
        </p>
      )}
    </div>

    <div className="mt-auto flex items-center justify-between">
      <span className="font-body2-heading text-text-main tabular-nums">
        {priceLabel(course.price)}
      </span>
      {course.freeLessonCount > 0 && (
        <span className="font-caption-normal text-key-color-primary tabular-nums">
          {course.freeLessonCount}차시 무료 맛보기
        </span>
      )}
    </div>
  </Link>
);
