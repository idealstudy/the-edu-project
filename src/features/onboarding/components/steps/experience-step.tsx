'use client';

import { MathMarkdown } from '@/shared/components/markdown';
import { cn } from '@/shared/lib';

import { COACH_CHIPS } from '../../model/steps';
import { QuestionHeader } from '../question-header';

/* ─────────────────────────────────────────────────────
 * 1문제 체험 — 진단 1문제 미리보기
 *  코치 칩(정답 미제공 톤). 실제 풀이는 오픈챌린지로 링크(CTA).
 *  보기 선택은 체험용 로컬 state.
 * ────────────────────────────────────────────────────*/
const CHOICES = ['-1', '1', '2', '3', '5'];
const CHOICE_LABELS = ['①', '②', '③', '④', '⑤'];

type ExperienceStepProps = {
  selectedChoice: number | null;
  onSelectChoice: (index: number) => void;
};

export const ExperienceStep = ({
  selectedChoice,
  onSelectChoice,
}: ExperienceStepProps) => (
  <div className="flex flex-col gap-4">
    <QuestionHeader title="한 문제만 풀어볼게요" />

    <div className="border-line-line1 rounded-card flex flex-col gap-4 border bg-white p-4.5">
      <span className="font-caption-heading bg-background-orange text-orange-10 w-fit rounded-full px-2.5 py-1">
        수학Ⅰ · 지수와 로그
      </span>
      <div className="font-body2-normal text-text-main leading-relaxed">
        <MathMarkdown
          content={
            '$\\log_2 8 + \\log_3 \\frac{1}{9}$ 의 값은? (아래에서 골라요)'
          }
        />
      </div>
      <div className="flex flex-col gap-2">
        {CHOICES.map((choice, i) => {
          const on = selectedChoice === i;
          return (
            <button
              key={choice}
              type="button"
              aria-pressed={on}
              onClick={() => onSelectChoice(i)}
              className={cn(
                'rounded-button font-label-normal flex items-center gap-3 border px-3.5 py-3 text-left transition',
                'focus-visible:ring-key-color-primary focus-visible:ring-2 focus-visible:outline-none',
                on
                  ? 'border-key-color-primary bg-background-orange'
                  : 'border-line-line1'
              )}
            >
              <span
                className={cn(
                  'border-precision font-caption-heading flex size-5.5 shrink-0 items-center justify-center rounded-full',
                  on
                    ? 'border-key-color-primary bg-key-color-primary text-white'
                    : 'border-line-line2 text-text-sub2'
                )}
              >
                {CHOICE_LABELS[i]}
              </span>
              {choice}
            </button>
          );
        })}
      </div>
    </div>

    {/* 코치 칩 — 정답 미제공 톤 */}
    <div className="rounded-card bg-background-orange px-4 py-3.5">
      <p className="font-caption-heading text-orange-10 leading-snug">
        막히면 정답 대신 같이 생각해요. 어떤 게 필요해요?
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {COACH_CHIPS.map((chip) => (
          <span
            key={chip}
            className="border-line-line1 font-caption-heading text-text-sub2 rounded-full border bg-white px-3 py-2"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  </div>
);
