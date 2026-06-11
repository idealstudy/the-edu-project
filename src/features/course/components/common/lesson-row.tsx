'use client';

import { type Lesson } from '@/entities/course';
import { cn } from '@/shared/lib';
import { CheckCircle2, Lock, PlayCircle } from 'lucide-react';

const PROGRESS_LABEL = {
  NOT_STARTED: null,
  IN_PROGRESS: '학습 중',
  COMPLETED: '완료',
} as const;

type LessonRowProps = {
  lesson: Lesson;
  index: number;
  isActive?: boolean;
  onSelect?: (lesson: Lesson) => void;
};

/* ─────────────────────────────────────────────────────
 * 차시 행 — 잠금/진도 표시. onSelect 가 있으면 버튼으로 동작.
 * ────────────────────────────────────────────────────*/
export const LessonRow = ({
  lesson,
  index,
  isActive = false,
  onSelect,
}: LessonRowProps) => {
  const interactive = Boolean(onSelect);
  const progressLabel = PROGRESS_LABEL[lesson.progressStatus];

  const content = (
    <>
      <span
        className={cn(
          'font-caption-heading flex size-7 shrink-0 items-center justify-center rounded-full tabular-nums',
          lesson.isLocked
            ? 'bg-gray-1 text-text-sub2'
            : 'bg-orange-1 text-key-color-primary'
        )}
      >
        {index + 1}
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
