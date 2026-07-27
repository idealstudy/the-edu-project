'use client';

import { type Lesson } from '@/entities/course';
import { lessonDurationLabel } from '@/features/course/lib/format';
import { cn } from '@/shared/lib';
import { CheckCircle2, Lock, NotebookPen, PlayCircle } from 'lucide-react';

const PROGRESS_LABEL = {
  NOT_STARTED: null,
  IN_PROGRESS: '학습 중',
  COMPLETED: '완료',
} as const;

type LessonRowProps = {
  lesson: Lesson;
  index: number;
  isActive?: boolean;
  /** 버튼으로 동작시킬지 — 기본은 onSelect 유무로 판단 */
  interactive?: boolean;
  onSelect?: (lesson: Lesson) => void;
};

/* ─────────────────────────────────────────────────────
 * 차시 행 — 잠금/진도 표시. interactive(또는 onSelect)면 버튼으로 동작.
 * ────────────────────────────────────────────────────*/
export const LessonRow = ({
  lesson,
  index,
  isActive = false,
  onSelect,
  interactive = Boolean(onSelect),
}: LessonRowProps) => {
  const progressLabel = PROGRESS_LABEL[lesson.progressStatus];
  const durationLabel = lessonDurationLabel(lesson.durationSec);
  /** durationSec=null·thumbnailUrl=null = 영상이 아니라 문제풀이 Day(lesson_problem 연결). */
  const isProblemSession = lesson.durationSec == null;
  const problemCountLabel =
    lesson.problems.length > 0 ? `문제 ${lesson.problems.length}제` : '문제풀이';

  const content = (
    <>
      <span
        className={cn(
          'relative flex h-11 w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[8px]',
          isProblemSession
            ? lesson.isLocked
              ? 'bg-gray-1'
              : 'bg-orange-1'
            : 'bg-gray-1'
        )}
      >
        {isProblemSession ? (
          <NotebookPen
            size={20}
            className={lesson.isLocked ? 'text-text-sub2' : 'text-key-color-primary'}
          />
        ) : lesson.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- 외부 CDN 썸네일, 다수(23강) 목록 최적화 불필요
          <img
            src={lesson.thumbnailUrl}
            alt=""
            loading="lazy"
            className={cn(
              'size-full object-cover',
              lesson.isLocked && 'opacity-60'
            )}
          />
        ) : (
          <span
            className={cn(
              'font-caption-heading flex size-full items-center justify-center tabular-nums',
              lesson.isLocked
                ? 'bg-gray-1 text-text-sub2'
                : 'bg-orange-1 text-key-color-primary'
            )}
          >
            {index + 1}
          </span>
        )}
        {isProblemSession ? (
          <span className="font-caption-normal absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[10px] leading-tight text-white">
            {problemCountLabel}
          </span>
        ) : (
          durationLabel && (
            <span className="font-caption-normal absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[10px] leading-tight text-white">
              {durationLabel}
            </span>
          )
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            'font-body2-heading truncate',
            lesson.isLocked ? 'text-text-sub2' : 'text-text-main'
          )}
        >
          {lesson.title}
        </span>
        {progressLabel && (
          <span className="font-caption-normal text-text-sub2">
            {progressLabel}
          </span>
        )}
      </span>

      <span className="shrink-0">
        {lesson.isLocked ? (
          <Lock
            size={18}
            className="text-text-sub2"
          />
        ) : lesson.progressStatus === 'COMPLETED' ? (
          <CheckCircle2
            size={18}
            className="text-system-success"
          />
        ) : (
          <PlayCircle
            size={18}
            className="text-key-color-primary"
          />
        )}
      </span>
    </>
  );

  const baseClassName = cn(
    'flex w-full items-center gap-3 rounded-[12px] border px-4 py-3 text-left',
    isActive
      ? 'border-key-color-primary bg-orange-1'
      : 'border-line-line2 bg-white',
    interactive && !lesson.isLocked && 'hover:border-key-color-primary cursor-pointer',
    interactive && lesson.isLocked && 'cursor-not-allowed'
  );

  if (!interactive) {
    return <div className={baseClassName}>{content}</div>;
  }

  return (
    <button
      type="button"
      className={baseClassName}
      onClick={() => onSelect?.(lesson)}
    >
      {content}
    </button>
  );
};
