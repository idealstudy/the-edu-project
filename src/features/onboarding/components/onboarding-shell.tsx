'use client';

import type { ReactNode } from 'react';

import { cn } from '@/shared/lib';

import type { OnboardingStep } from '../model/steps';
import { StepProgress } from './step-progress';

/* ─────────────────────────────────────────────────────
 * 온보딩 셸 — 상단(로고·뒤로·진행) / 본문 / 하단 고정 CTA
 *  태블릿 퍼스트: 중앙 정렬 컨테이너(max 480), 한 컬럼.
 * ────────────────────────────────────────────────────*/
type OnboardingShellProps = {
  step: OnboardingStep;
  coreIndex: number;
  beyondCore?: boolean;
  /** 상단 우측 액션 — 뒤로 / 건너뛰기 / 완료 라벨 */
  topRight?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
};

export const OnboardingShell = ({
  step,
  coreIndex,
  beyondCore,
  topRight,
  children,
  footer,
}: OnboardingShellProps) => (
  <div className="bg-system-background-alt flex min-h-screen w-full justify-center">
    <div className="flex w-full max-w-120 flex-col">
      {/* 상단 — sticky */}
      <header className="bg-system-background-alt sticky top-0 z-10 px-5 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-body2-heading text-text-main tracking-tight">
            혼공<span className="text-key-color-primary">일등</span>
          </span>
          {topRight}
        </div>
        <StepProgress
          step={step}
          coreIndex={coreIndex}
          beyondCore={beyondCore}
        />
      </header>

      {/* 본문 */}
      <main className="flex-1 px-5 pt-6 pb-4">{children}</main>

      {/* 하단 고정 CTA */}
      <footer
        className={cn(
          'bg-system-background-alt border-line-line1 sticky bottom-0 border-t px-5 pt-3.5 pb-6'
        )}
      >
        {footer}
      </footer>
    </div>
  </div>
);
