'use client';

import { cn } from '@/shared/lib';

import { CORE_STEP_COUNT, type OnboardingStep } from '../model/steps';

/* ─────────────────────────────────────────────────────
 * 진행 인디케이터 — 필수 4막대 + 선택 진단(점선) 1막대
 *  done(채움) / now(현재, 옅음) / opt(선택, 점선).
 * ────────────────────────────────────────────────────*/
type StepProgressProps = {
  /** 0-based: 현재 필수 스텝 인덱스 (0~3). 진단·체험·공개는 4로 본다. */
  coreIndex: number;
  /** 진단 이후 단계(체험·공개)인지 — 전체 done 처리 */
  beyondCore?: boolean;
  step: OnboardingStep;
};

const stepMeta = (
  step: OnboardingStep
): { n: string; t: string; tone?: 'done' } => {
  switch (step) {
    case 'grade':
      return { n: 'STEP 1', t: '/ 4 · 기본 정보' };
    case 'elective':
      return { n: 'STEP 2', t: '/ 4 · 기본 정보' };
    case 'selfGrade':
      return { n: 'STEP 3', t: '/ 4 · 기본 정보' };
    case 'weakUnits':
      return { n: 'STEP 4', t: '/ 4 · 약점 진단' };
    case 'diagnosis':
      return { n: '선택 진단', t: '· 건너뛰어도 돼요' };
    case 'experience':
      return { n: '체험 문제', t: '· 딱 한 문제만' };
    case 'reveal':
      return { n: '진단 완료', t: '· 내 약점 트리가 만들어졌어요', tone: 'done' };
  }
};

export const StepProgress = ({
  coreIndex,
  beyondCore,
  step,
}: StepProgressProps) => {
  const meta = stepMeta(step);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'font-caption-heading',
            meta.tone === 'done'
              ? 'text-system-success'
              : 'text-key-color-primary'
          )}
        >
          {meta.n}
        </span>
        <span className="font-caption-normal text-text-sub2">{meta.t}</span>
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: CORE_STEP_COUNT }).map((_, i) => {
          const done = beyondCore || i < coreIndex;
          const now = !beyondCore && i === coreIndex;
          return (
            <span
              key={i}
              className={cn(
                'h-[5px] flex-1 rounded-full',
                done && 'bg-key-color-primary',
                now && 'bg-key-color-primary opacity-45',
                !done && !now && 'bg-line-line1'
              )}
            />
          );
        })}
        {/* 선택 진단 막대 — 점선 표현 */}
        <span
          className={cn(
            'h-[5px] flex-1 rounded-full',
            'bg-[length:9px_5px] bg-[repeating-linear-gradient(90deg,var(--color-line-line1)_0_5px,transparent_5px_9px)]',
            step === 'diagnosis' && 'opacity-100',
            beyondCore &&
              'bg-key-color-primary bg-none' /* 진단 이후는 채움 */
          )}
        />
      </div>
    </div>
  );
};
