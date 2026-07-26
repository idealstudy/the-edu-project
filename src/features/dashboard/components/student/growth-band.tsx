'use client';

import { cn } from '@/shared/lib';

import { TreeIcon } from '../growth/tree-icon';
import type { GrowthSummary } from '../../mock/mvp-g-dashboard.mock';

type Props = {
  /**
   * 실 데이터가 준비되면 여기로 채운다. 없으면(=지금) "준비 중" 빈 상태만 그린다.
   * ⛔ 백엔드 계약 필요: 레벨/xp/스트릭 게이미피케이션 도메인 미구현.
   */
  summary?: GrowthSummary;
  className?: string;
};

/**
 * 성장 띠 — MVP-G v3 밀도 ㉮(얇은 성장 띠) 레이아웃 채택.
 * 실측 없는 레벨·xp·스트릭 숫자는 렌더하지 않는다(회장 지시 2026-07-23).
 */
export const GrowthBand = ({ summary, className }: Props) => {
  if (!summary) {
    return (
      <section
        className={cn(
          'bg-gray-white border-gray-4 flex items-center gap-4.5 rounded-2xl border px-5.5 py-3.5',
          className
        )}
      >
        <TreeIcon stage={0} size={40} className="opacity-40 grayscale" />
        <div className="min-w-0 flex-1">
          <p className="font-body2-heading text-gray-10">준비 중이에요</p>
          <p className="font-caption-normal text-gray-8 mt-0.5">
            학습이 쌓이면 온도나무가 여기서 자라요
          </p>
        </div>
      </section>
    );
  }

  const xpRatio = Math.min(
    100,
    Math.round((summary.xp / summary.xpToNextLevel) * 100)
  );
  // v4 — 시듦 단계(1/2/휴면)는 띠 톤을 낮춰 "회고를 쓰면 되돌아온다"는 회복 여지를 시각으로 남긴다.
  // (죽음 단계 없음 — 회장 확정: 공부 안 하면 시들고, 기록하면 회복, 죽지 않는다.)
  const isWilting = summary.stage !== 0;

  return (
    <section
      className={cn(
        'flex items-center gap-4.5 rounded-2xl border px-5.5 py-3.5',
        isWilting ? 'bg-gray-1 border-gray-3' : 'bg-gray-white border-gray-4',
        className
      )}
    >
      <TreeIcon stage={summary.stage} size={40} />
      <span
        className={cn(
          'font-body2-heading whitespace-nowrap',
          isWilting ? 'text-gray-9' : 'text-gray-12'
        )}
      >
        온도나무 Lv.{summary.level}{' '}
        <span className="font-caption-normal text-gray-8">
          · {summary.daysGrown}일째{isWilting && ' · 기록하면 회복돼요'}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="bg-gray-2 h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-orange-7 h-full rounded-full"
            style={{ width: `${xpRatio}%` }}
          />
        </div>
      </div>
      <span className="text-orange-7 font-body2-heading whitespace-nowrap">
        🔥 {summary.streakDays}
        <span className="font-caption-normal text-gray-8 block text-center">
          연속
        </span>
      </span>
    </section>
  );
};
