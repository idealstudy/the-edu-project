'use client';

import { type ReactNode } from 'react';

import { cn } from '@/shared/lib';

/* ─────────────────────────────────────────────────────
 * 지표 톤
 *  - positive : 긍정(고민시간·조교활용) — 오렌지 강조
 *  - caution  : 주의(해설의존) — 절제된 경고 톤(질책 아님)
 * ────────────────────────────────────────────────────*/
type MetricTone = 'positive' | 'caution';

type MetricCardProps = {
  icon: ReactNode;
  label: string;
  /** 큰 글씨로 보여 줄 대표 값(예: "3분 20초", "42%") */
  value: string;
  /** 게이지로 보여 줄 비율(0~100). 없으면 게이지 생략 */
  percent?: number;
  /** 한 줄 회고·맥락 카피 */
  helper: string;
  tone: MetricTone;
};

const TONE = {
  positive: {
    iconWrap: 'bg-orange-1',
    icon: 'text-orange-7',
    bar: 'bg-orange-7',
    track: 'bg-gray-1',
  },
  caution: {
    iconWrap: 'bg-system-warning-alt',
    icon: 'text-system-warning',
    bar: 'bg-system-warning',
    track: 'bg-gray-1',
  },
} as const;

/* ─────────────────────────────────────────────────────
 * 지표 카드 1종 — 자녀 리포트 지표 시각화
 *  숫자는 tabular-nums, 게이지는 transform/opacity만(모션 절제).
 * ────────────────────────────────────────────────────*/
export const MetricCard = ({
  icon,
  label,
  value,
  percent,
  helper,
  tone,
}: MetricCardProps) => {
  const t = TONE[tone];
  const ratio =
    percent === undefined
      ? undefined
      : Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <section
      className="border-line-line1 flex flex-col gap-4 rounded-[12px] border bg-white p-5"
      aria-label={label}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
            t.iconWrap
          )}
        >
          <span className={t.icon}>{icon}</span>
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="font-caption-heading text-text-sub2">{label}</span>
          <span className="font-headline1-heading text-text-main tabular-nums">
            {value}
          </span>
        </div>
      </div>

      {ratio !== undefined && (
        <div className={cn('h-2 w-full overflow-hidden rounded-full', t.track)}>
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none',
              t.bar
            )}
            style={{ width: `${ratio}%` }}
          />
        </div>
      )}

      <p className="font-caption-normal text-text-sub1 leading-relaxed">
        {helper}
      </p>
    </section>
  );
};
