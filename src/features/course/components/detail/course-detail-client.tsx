'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useSession } from '@/providers';
import { Button, StatusBadge } from '@/shared/components/ui';
import { PRIVATE, PUBLIC } from '@/shared/constants';
import { BookOpen, Lock } from 'lucide-react';

import {
  useCourseDetailQuery,
  useCourseLessonsQuery,
  useEnrollCourseMutation,
} from '../../hooks';
import {
  courseSubjectLabel,
  isFreeCourse,
  priceLabel,
} from '../../lib/format';
import { LessonRow } from '../common/lesson-row';
import { CourseTierSection } from './course-tier-section';

/* ─────────────────────────────────────────────────────
 * 코스 상세 (공개) — 코스 메타 + 차시 목록(게이팅) + 수강 신청
 *  - 비로그인: 차시 잠금 게이팅을 못 받으므로 로그인 유도.
 *  - 로그인: 게이팅된 차시 목록 + 잠긴 차시 있으면 수강 신청 CTA.
 * ────────────────────────────────────────────────────*/
export const CourseDetailClient = ({ courseId }: { courseId: number }) => {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const {
    data: course,
    isLoading,
    isError,
    refetch,
  } = useCourseDetailQuery(courseId);
  const { data: lessons } = useCourseLessonsQuery(courseId, {
    enabled: isAuthenticated,
  });
  const { mutate: enroll, isPending: isEnrolling } =
    useEnrollCourseMutation(courseId);

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (isError || !course) {
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

  const hasLockedLesson = lessons?.some((lesson) => lesson.isLocked) ?? false;
  const isEnrolled = isAuthenticated && lessons != null && !hasLockedLesson;
  const free = isFreeCourse(course.price);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* 본문 */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="border-line-line2 flex flex-col gap-4 rounded-[12px] border bg-white p-6">
          <div className="flex items-center gap-2">
            <StatusBadge
              variant="primary"
              label={courseSubjectLabel(course.subject)}
            />
            <span className="font-caption-normal text-text-sub2 tabular-nums">
              총 {course.lessonCount}차시
            </span>
          </div>
          <h1 className="font-title-heading text-text-main text-balance">
            {course.title}
          </h1>
          {course.description && (
            <p className="font-body2-normal text-text-sub1 whitespace-pre-wrap">
              {course.description}
            </p>
          )}
        </div>

        {/* 3티어 선택·구매 */}
        <CourseTierSection
          courseId={courseId}
          isAuthenticated={isAuthenticated}
          onRequireLogin={() =>
            router.push(
              `${PUBLIC.CORE.LOGIN}?redirect=${encodeURIComponent(
                PUBLIC.COURSE.DETAIL(courseId)
              )}`
            )
          }
        />

        {/* 차시 목록 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-body1-heading text-text-main">차시</h2>
            {course.freeLessonCount > 0 && (
              <span className="font-caption-normal text-key-color-primary tabular-nums">
                {course.freeLessonCount}차시까지 무료 맛보기
              </span>
            )}
          </div>

          {isAuthenticated ? (
            lessons && lessons.length > 0 ? (
              <div className="flex flex-col gap-2">
                {lessons.map((lesson, index) => (
                  <LessonRow
                    key={lesson.lessonId}
                    lesson={lesson}
                    index={index}
                    interactive
                    onSelect={(target) => {
                      // 잠긴 차시는 이동 막고 수강 CTA 그대로(무동작),
                      // 무료/해제 차시는 해당 차시로 바로 이동.
                      if (target.isLocked) return;
                      router.push(
                        `${PRIVATE.COURSE.LEARN(courseId)}?lesson=${target.lessonId}`
                      );
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="border-line-line2 rounded-[12px] border border-dashed bg-white p-8 text-center">
                <p className="font-body2-normal text-text-sub1">
                  아직 등록된 차시가 없어요.
                </p>
              </div>
            )
          ) : (
            <div className="border-line-line2 flex flex-col items-center gap-3 rounded-[12px] border border-dashed bg-white p-8 text-center">
              <span className="bg-orange-1 text-key-color-primary flex size-12 items-center justify-center rounded-full">
                <BookOpen size={24} />
              </span>
              <p className="font-body2-heading text-text-main">
                로그인하면 차시를 볼 수 있어요
              </p>
              <p className="font-caption-normal text-text-sub2 text-balance">
                {course.freeLessonCount > 0
                  ? `로그인하면 ${course.freeLessonCount}차시까지 무료로 맛볼 수 있어요.`
                  : '로그인 후 수강 신청하면 차시가 열려요.'}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* 사이드 — 가격·수강 신청 */}
      <aside className="border-line-line2 flex w-full flex-col gap-4 rounded-[12px] border bg-white p-6 lg:w-[320px] lg:shrink-0">
        <div className="flex flex-col gap-1">
          <span className="font-caption-normal text-text-sub2">수강료</span>
          <span className="font-headline1-heading text-text-main tabular-nums">
            {priceLabel(course.price)}
          </span>
          {!free && (
            <span className="font-caption-normal text-text-sub2">
              지금은 무료로 등록할 수 있어요.
            </span>
          )}
        </div>

        {!isAuthenticated ? (
          <Button
            asChild
            size="medium"
            className="w-full"
          >
            <Link
              href={`${PUBLIC.CORE.LOGIN}?redirect=${encodeURIComponent(
                PUBLIC.COURSE.DETAIL(courseId)
              )}`}
            >
              로그인하고 수강하기
            </Link>
          </Button>
        ) : isEnrolled ? (
          <Button
            asChild
            size="medium"
            className="w-full"
          >
            <Link href={PRIVATE.COURSE.LEARN(courseId)}>이어서 학습하기</Link>
          </Button>
        ) : (
          <>
            <Button
              size="medium"
              className="w-full"
              disabled={isEnrolling}
              onClick={() => enroll()}
            >
              {isEnrolling ? '신청 중…' : '수강 신청하고 전체 차시 열기'}
            </Button>
            {course.freeLessonCount > 0 && (
              <Button
                asChild
                variant="outlined"
                size="medium"
                className="w-full"
              >
                <Link href={PRIVATE.COURSE.LEARN(courseId)}>
                  무료 차시 먼저 보기
                </Link>
              </Button>
            )}
          </>
        )}

        {hasLockedLesson && (
          <div className="bg-gray-1 flex items-start gap-2 rounded-[8px] p-3">
            <Lock
              size={16}
              className="text-text-sub2 mt-0.5 shrink-0"
            />
            <p className="font-caption-normal text-text-sub1">
              잠긴 차시는 수강 신청하면 열려요.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
};

const CourseDetailSkeleton = () => (
  <div className="flex flex-col gap-6 lg:flex-row">
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="border-line-line2 bg-gray-1 h-44 animate-pulse rounded-[12px] border" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-line-line2 bg-gray-1 h-16 animate-pulse rounded-[12px] border"
          />
        ))}
      </div>
    </div>
    <div className="border-line-line2 bg-gray-1 h-60 w-full animate-pulse rounded-[12px] border lg:w-[320px]" />
  </div>
);
