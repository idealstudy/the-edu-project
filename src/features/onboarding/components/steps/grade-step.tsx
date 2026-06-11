'use client';

import type { OnboardingGrade } from '@/entities/onboarding';

import { GRADE_OPTIONS } from '../../model/steps';
import { QuestionHeader } from '../question-header';
import { SelectCard } from '../select-card';

/* ─────────────────────────────────────────────────────
 * STEP 1 · 학년 — 큰 RadioCard 단일 선택
 * ────────────────────────────────────────────────────*/
type GradeStepProps = {
  value: OnboardingGrade | null;
  onChange: (grade: OnboardingGrade) => void;
};

export const GradeStep = ({ value, onChange }: GradeStepProps) => (
  <div className="flex flex-col gap-5">
    <QuestionHeader
      title="몇 학년이에요?"
      sub="학년에 맞는 출제 범위로 문제를 추천해요."
    />
    <div
      role="radiogroup"
      aria-label="학년"
      className="flex flex-col gap-2.5"
    >
      {GRADE_OPTIONS.map((opt) => (
        <SelectCard
          key={opt.value}
          label={opt.label}
          meta={opt.meta}
          selected={value === opt.value}
          onSelect={() => onChange(opt.value)}
        />
      ))}
    </div>
  </div>
);
