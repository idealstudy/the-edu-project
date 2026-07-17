'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { type LessonProblem, type LessonSegment } from '@/entities/course';
import { MathMarkdown } from '@/shared/components/markdown';
import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib';
import { CheckCircle2, ChevronRight, Lock } from 'lucide-react';

import {
  useCourseDetailQuery,
  useCourseLessonsQuery,
  useEnrollCourseMutation,
  useLessonSegmentsQuery,
  useUpdateLessonProgressMutation,
} from '../../hooks';
import { LessonRow } from '../common/lesson-row';
import { ConceptNoteRewardPanel } from './concept-note-reward-panel';
import { SegmentCheckpointDialog } from './segment-checkpoint-dialog';
import { SegmentStageBar } from './segment-stage-bar';

/* ─────────────────────────────────────────────────────
 * 차시 학습 뷰 (수강용·인증)
 *  - 좌: 차시 목록(선택) / 우: 본문 또는 잠금 패널
 *  - 맛보기: 무료 차시까지 열람, 이후 잠금 + 수강 신청 유도
 * ────────────────────────────────────────────────────*/
export const LessonViewClient = ({ courseId }: { courseId: number }) => {
  const { data: course } = useCourseDetailQuery(courseId);
  const {
    data: lessons,
    isLoading,
    isError,
    refetch,
  } = useCourseLessonsQuery(courseId);
  const { mutate: enroll, isPending: isEnrolling } =
    useEnrollCourseMutation(courseId);
  const { mutate: updateProgress, isPending: isUpdating } =
    useUpdateLessonProgressMutation(courseId);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [checkpointSegment, setCheckpointSegment] =
    useState<LessonSegment | null>(null);

  const selectedLessonLocked =
    lessons?.find((lesson) => lesson.lessonId === selectedId)?.isLocked ??
    true;
  // 세그먼트/체크포인트(frd-v2 §4, api-contract-v2 ⑦) — 잠긴 차시는 조회하지 않는다.
  const { data: segmentGroup } = useLessonSegmentsQuery(selectedId, {
    enabled: selectedId != null && !selectedLessonLocked,
  });

  // 코스 상세에서 넘어올 때 ?lesson=<id> 로 진입 차시를 지정할 수 있다.
  const searchParams = useSearchParams();
  const lessonParam = searchParams.get('lesson');

  // 최초 로드 시 차시를 자동 선택.
  //  - ?lesson= 가 가리키는 차시가 잠겨있지 않으면 그 차시
  //  - 없거나 잠긴 차시면 첫 열린 차시(없으면 첫 차시)로 폴백
  useEffect(() => {
    if (!lessons || lessons.length === 0 || selectedId !== null) return;
    const requestedId = lessonParam ? Number(lessonParam) : null;
    const requested =
      requestedId != null
        ? lessons.find(
            (lesson) => lesson.lessonId === requestedId && !lesson.isLocked
          )
        : undefined;
    const fallback =
      requested ?? lessons.find((lesson) => !lesson.isLocked) ?? lessons[0];
    if (fallback) setSelectedId(fallback.lessonId);
  }, [lessons, selectedId, lessonParam]);

  if (isLoading) {
    return <LessonViewSkeleton />;
  }

  if (isError) {
    return (
      <div className="border-line-line2 flex flex-col items-center gap-3 rounded-[12px] border bg-white p-12 text-center">
        <p className="font-body2-normal text-text-sub1">
          차시를 불러오지 못했어요.
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

  if (!lessons || lessons.length === 0) {
    return (
      <div className="border-line-line2 rounded-[12px] border border-dashed bg-white p-12 text-center">
        <p className="font-body2-normal text-text-sub1">
          아직 등록된 차시가 없어요.
        </p>
      </div>
    );
  }

  const selected =
    lessons.find((lesson) => lesson.lessonId === selectedId) ?? lessons[0];

  if (!selected) {
    return <LessonViewSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* 차시 목록 */}
      <nav
        aria-label="차시 목록"
        className="flex w-full flex-col gap-2 lg:w-[320px] lg:shrink-0"
      >
        {lessons.map((lesson, index) => (
          <LessonRow
            key={lesson.lessonId}
            lesson={lesson}
            index={index}
            isActive={lesson.lessonId === selected.lessonId}
            onSelect={(target) => {
              if (target.isLocked) return;
              setSelectedId(target.lessonId);
            }}
          />
        ))}
      </nav>

      {/* 본문 / 잠금 */}
      <section className="border-line-line2 flex min-w-0 flex-1 flex-col gap-5 rounded-[12px] border bg-white p-6">
        <header className="border-line-line2 flex flex-col gap-2 border-b pb-4">
          <span className="font-caption-normal text-text-sub2">
            {course?.title ?? '코스'}
          </span>
          <h1 className="font-headline1-heading text-text-main text-balance">
            {selected.title}
          </h1>
        </header>

        {selected.isLocked ? (
          <LockedPanel
            isEnrolling={isEnrolling}
            onEnroll={() => enroll()}
          />
        ) : (
          <>
            {segmentGroup && segmentGroup.segments.length > 0 && (
              <SegmentStageBar
                segments={segmentGroup.segments}
                activeSegmentId={checkpointSegment?.segmentId ?? null}
                onSelectSegment={(segment) => {
                  if (segment.cleared) return;
                  setCheckpointSegment(segment);
                }}
              />
            )}

            <article className="min-h-[160px]">
              {selected.contentRef && selected.contentRef.trim().length > 0 ? (
                <MathMarkdown
                  content={selected.contentRef}
                  className="font-body2-normal text-text-main"
                />
              ) : (
                <p className="font-body2-normal text-text-sub2">
                  콘텐츠 준비 중이에요.
                </p>
              )}
            </article>

            {segmentGroup && segmentGroup.segments.length > 0 && (
              <ConceptNoteRewardPanel
                unlocked={segmentGroup.noteSlotUnlocked}
                dayType={segmentGroup.dayType}
              />
            )}

            <LessonProblems problems={selected.problems} />

            <footer className="border-line-line2 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              {selected.progressStatus === 'COMPLETED' ? (
                <span className="text-system-success font-label-heading flex items-center gap-1.5">
                  <CheckCircle2 size={18} />
                  학습 완료
                </span>
              ) : (
                <span className="font-caption-normal text-text-sub2">
                  {selected.progressStatus === 'IN_PROGRESS'
                    ? '학습 중인 차시예요.'
                    : '학습을 시작해 보세요.'}
                </span>
              )}

              <div className="flex gap-2">
                {selected.progressStatus === 'NOT_STARTED' && (
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={isUpdating}
                    onClick={() =>
                      updateProgress({
                        lessonId: selected.lessonId,
                        payload: { status: 'IN_PROGRESS' },
                      })
                    }
                  >
                    학습 시작
                  </Button>
                )}
                {selected.progressStatus !== 'COMPLETED' && (
                  <Button
                    size="small"
                    disabled={isUpdating}
                    onClick={() =>
                      updateProgress({
                        lessonId: selected.lessonId,
                        payload: { status: 'COMPLETED' },
                      })
                    }
                  >
                    완료 표시
                  </Button>
                )}
              </div>
            </footer>
          </>
        )}
      </section>

      {checkpointSegment && (
        <SegmentCheckpointDialog
          isOpen={checkpointSegment != null}
          onOpenChange={(open) => {
            if (!open) setCheckpointSegment(null);
          }}
          segment={checkpointSegment}
          lessonId={selected.lessonId}
          // ⛔ 회장 확인 필요: enrollmentId를 노출하는 조회 API가 없다
          // (segment-checkpoint-dialog.tsx 상단 주석 참조). 연동 전까지 null.
          enrollmentId={null}
          onCleared={() => setCheckpointSegment(null)}
        />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────
 * 이 차시의 문제 — 연결된 오픈챌린지로 이동.
 *  난이도는 오렌지 단일 accent 강도 한 축으로 표현.
 * ────────────────────────────────────────────────────*/
const DIFFICULTY_BADGE = {
  TOP: { label: '최상', className: 'bg-orange-9 text-white' },
  HIGH: { label: '상', className: 'bg-orange-7 text-white' },
  MID: { label: '중', className: 'bg-orange-4 text-gray-11' },
  LOW: { label: '하', className: 'bg-gray-3 text-gray-11' },
} as const;

const LessonProblems = ({ problems }: { problems: LessonProblem[] }) => {
  if (problems.length === 0) {
    return (
      <section
        aria-label="이 차시의 문제"
        className="border-line-line2 rounded-[12px] border border-dashed p-5 text-center"
      >
        <p className="font-caption-normal text-text-sub2">
          이 차시의 문제는 준비 중이거나 잠겨 있어요.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="이 차시의 문제"
      className="flex flex-col gap-2"
    >
      <h2 className="font-label-heading text-text-main">이 차시의 문제</h2>
      <ul className="flex flex-col gap-2">
        {[...problems]
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((problem) => {
            const badge = DIFFICULTY_BADGE[problem.difficulty];
            return (
              <li key={problem.challengeId}>
                <Link
                  href={PUBLIC.OPEN_CHALLENGE.DETAIL(problem.challengeId)}
                  className="group border-line-line2 hover:border-key-color-primary flex items-center gap-3 rounded-[12px] border bg-white px-4 py-3 transition-colors"
                >
                  <span
                    className={cn(
                      'font-caption-heading shrink-0 rounded-md px-2 py-0.5',
                      badge.className
                    )}
                  >
                    {badge.label}
                  </span>
                  <span className="font-body2-normal text-text-main min-w-0 flex-1 truncate">
                    {problem.title}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-text-sub2 group-hover:text-key-color-primary shrink-0"
                  />
                </Link>
              </li>
            );
          })}
      </ul>
    </section>
  );
};

const LockedPanel = ({
  isEnrolling,
  onEnroll,
}: {
  isEnrolling: boolean;
  onEnroll: () => void;
}) => (
  <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
    <span className="bg-gray-1 text-text-sub2 flex size-14 items-center justify-center rounded-full">
      <Lock size={26} />
    </span>
    <div className="flex flex-col gap-1">
      <p className="font-body1-heading text-text-main">
        수강 신청하면 열려요
      </p>
      <p className="font-caption-normal text-text-sub2 text-balance">
        무료 맛보기 차시 이후 내용은 수강 신청 후 볼 수 있어요. 지금은 무료로
        등록할 수 있어요.
      </p>
    </div>
    <Button
      size="medium"
      disabled={isEnrolling}
      onClick={onEnroll}
    >
      {isEnrolling ? '신청 중…' : '무료로 수강 신청하기'}
    </Button>
  </div>
);

const LessonViewSkeleton = () => (
  <div className="flex flex-col gap-6 lg:flex-row">
    <div className="flex w-full flex-col gap-2 lg:w-[320px]">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="border-line-line2 bg-gray-1 h-16 animate-pulse rounded-[12px] border"
        />
      ))}
    </div>
    <div className="border-line-line2 bg-gray-1 h-80 flex-1 animate-pulse rounded-[12px] border" />
  </div>
);
