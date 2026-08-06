'use client';

import type { OnboardingElective } from '@/entities/onboarding';

import { ELECTIVE_OPTIONS } from '../../model/steps';
import { QuestionHeader } from '../question-header';
import { SelectCard } from '../select-card';

/* ─────────────────────────────────────────────────────
 * STEP 2 · 선택과목 — 공통은 고정 안내, 선택과목 1개
 *  트리 범위가 여기서 정해진다.
 * ────────────────────────────────────────────────────*/
type ElectiveStepProps = {
  value: OnboardingElective | null;
  onChange: (elective: OnboardingElective) => void;
};

export const ElectiveStep = ({ value, onChange }: ElectiveStepProps) => (
  <div className="flex flex-col gap-5">
    <QuestionHeader
      title={
        <>
          수학 <em>선택과목</em>은요?
        </>
      }
      sub="공통수학1·2, 대수, 미적분Ⅰ은 기본으로 포함돼요."
    />
    <div
      role="radiogroup"
      aria-label="수학 선택과목"
      className="flex flex-col gap-2.5"
    >
      <SelectCard
        label="공통수학1·2 · 대수 · 미적분Ⅰ"
        meta="기본 포함 (변경 불가)"
        selected={false}
        disabled
      />
      {ELECTIVE_OPTIONS.map((opt) => (
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
