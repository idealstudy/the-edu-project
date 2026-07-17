'use client';

import { type LessonSegment } from '@/entities/course';
import { cn } from '@/shared/lib';
import { CheckCircle2, Lock, PlayCircle } from 'lucide-react';

type SegmentStageBarProps = {
  segments: LessonSegment[];
  activeSegmentId: number | null;
  onSelectSegment: (segment: LessonSegment) => void;
};

/* ─────────────────────────────────────────────────────
 * 세그먼트 스테이지바 (frd-v2 §4 · api-contract-v2 ⑦)
 *  - 5~10분 단위로 쪼갠 세그먼트를 순서대로 보여준다.
 *  - "재생 완료율"이 아니라 "체크포인트 클리어" 여부만 진행으로 인정한다
 *    (회장 원칙: 보상은 시청이 아니라 능동 행위에). 다음 세그먼트는 이전
 *    세그먼트가 클리어돼야 선택 가능 — 순서 스킵을 막아 능동 행위를 강제한다.
 * ────────────────────────────────────────────────────*/
export const SegmentStageBar = ({
  segments,
  activeSegmentId,
  onSelectSegment,
}: SegmentStageBarProps) => {
  const sorted = [...segments].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <nav
      aria-label="세그먼트 진행 단계"
      className="flex flex-col gap-2"
    >
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {sorted.map((segment, index) => {
          const previousCleared =
            index === 0 || sorted[index - 1]?.cleared === true;
          const isLocked = !segment.cleared && !previousCleared;
          const isActive = segment.segmentId === activeSegmentId;

          return (
            <button
              key={segment.segmentId}
              type="button"
              disabled={isLocked}
              aria-current={isActive}
              aria-label={`${index + 1}. ${segment.title}${
                segment.cleared ? ' (클리어)' : isLocked ? ' (잠김)' : ''
              }`}
              onClick={() => !isLocked && onSelectSegment(segment)}
              className={cn(
                'flex h-9 min-w-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 transition-colors',
                'font-caption-heading',
                segment.cleared &&
                  'bg-key-color-primary text-white',
                !segment.cleared &&
                  !isLocked &&
                  'bg-orange-1 text-key-color-primary',
                isLocked && 'bg-gray-1 text-text-inactive cursor-not-allowed',
                isActive && 'ring-key-color-primary ring-2 ring-offset-1'
              )}
            >
              {segment.cleared ? (
                <CheckCircle2 size={14} />
              ) : isLocked ? (
                <Lock size={14} />
              ) : (
                <PlayCircle size={14} />
              )}
              {index + 1}
            </button>
          );
        })}
      </div>
      <p className="font-caption-normal text-text-sub2">
        {sorted.filter((s) => s.cleared).length}/{sorted.length} 세그먼트
        클리어 — 시청이 아니라 체크포인트 정답으로만 채워져요.
      </p>
    </nav>
  );
};
