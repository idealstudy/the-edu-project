'use client';

import { cn } from '@/shared/lib';
import { Lock, PenLine, Sparkles } from 'lucide-react';

type ConceptNoteRewardPanelProps = {
  unlocked: boolean;
  dayType: string;
};

/* ─────────────────────────────────────────────────────
 * 보상 사슬 — 전 세그먼트 클리어 → 개념노트 슬롯 해제 → 다음 Day 오픈
 *  (frd-v2 §4.1·4.2, 보상은 시청이 아니라 능동 행위에만)
 *  개념노트 실제 작성·제출(daily_submission, api-contract-v2 P3)은
 *  이 슬라이스 범위 밖이라 슬롯 해제 상태 표시까지만 구현한다.
 * ────────────────────────────────────────────────────*/
export const ConceptNoteRewardPanel = ({
  unlocked,
  dayType,
}: ConceptNoteRewardPanelProps) => {
  if (dayType !== 'LECTURE_NOTE') return null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[12px] border p-4',
        unlocked
          ? 'border-key-color-primary bg-orange-1'
          : 'border-line-line2 border-dashed bg-white'
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          unlocked ? 'bg-key-color-primary text-white' : 'bg-gray-1 text-text-inactive'
        )}
      >
        {unlocked ? <Sparkles size={18} /> : <Lock size={18} />}
      </span>
      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            'font-body2-heading',
            unlocked ? 'text-key-color-primary' : 'text-text-main'
          )}
        >
          {unlocked ? '개념노트 슬롯이 열렸어요' : '개념노트 슬롯 잠김'}
        </span>
        <span className="font-caption-normal text-text-sub2">
          {unlocked
            ? '전 세그먼트를 클리어했어요. 개념노트를 쓰면 다음 Day가 열려요.'
            : '끝까지 재생해도 열리지 않아요. 모든 체크포인트를 맞혀야 열려요.'}
        </span>
      </div>
      {unlocked && (
        <PenLine
          size={16}
          className="text-key-color-primary ml-auto shrink-0"
        />
      )}
    </div>
  );
};
