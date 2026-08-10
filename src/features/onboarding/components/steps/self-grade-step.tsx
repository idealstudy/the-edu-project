'use client';

import type { OnboardingSelfGrade } from '@/entities/onboarding';
import { cn } from '@/shared/lib';

import { GRADE_NUMBERS, SELF_GRADE_UNKNOWN } from '../../model/steps';
import { QuestionHeader } from '../question-header';

/* ─────────────────────────────────────────────────────
 * STEP 3 · 본인 등급 — 1~9 그리드 + "잘 모르겠어요"
 *  정직 카피("솔직할수록 정확"). 비공개·언제든 변경.
 *  추천(PR5)에 넘길 값.
 * ────────────────────────────────────────────────────*/
type SelfGradeStepProps = {
  value: OnboardingSelfGrade | null;
  onChange: (grade: OnboardingSelfGrade) => void;
};

export const SelfGradeStep = ({ value, onChange }: SelfGradeStepProps) => {
  const unknownSelected = value === SELF_GRADE_UNKNOWN;

  return (
    <div className="flex flex-col gap-5">
      <QuestionHeader
        title={
          <>
            지금 수학 등급은
            <br />
            어느 정도예요?
          </>
        }
        sub={
          <>
            <b>솔직할수록</b> 추천이 정확해져요. 비공개이고 언제든 바꿀 수
            있어요.
          </>
        }
      />

      <div className="grid grid-cols-3 gap-2.5">
        {GRADE_NUMBERS.map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(n)}
              className={cn(
                'rounded-row font-headline2-heading flex min-h-14 flex-col items-center justify-center border tabular-nums transition',
                'focus-visible:ring-key-color-primary focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
                selected
                  ? 'border-key-color-primary bg-key-color-primary text-white'
                  : 'border-line-line1 text-text-main bg-white'
              )}
            >
              {n}
              {selected && (
                <span className="font-caption-normal text-orange-1 mt-0.5">
                  선택됨
                </span>
              )}
            </button>
          );
        })}

        <button
          type="button"
          aria-pressed={unknownSelected}
          onClick={() => onChange(SELF_GRADE_UNKNOWN)}
          className={cn(
            'rounded-row font-label-heading col-span-3 flex min-h-12 items-center justify-center border transition',
            'focus-visible:ring-key-color-primary focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
            unknownSelected
              ? 'border-key-color-primary bg-background-orange text-orange-10'
              : 'border-line-line1 text-text-sub2 bg-white'
          )}
        >
          잘 모르겠어요 · 진단으로 알려주세요
        </button>
      </div>
    </div>
  );
};
