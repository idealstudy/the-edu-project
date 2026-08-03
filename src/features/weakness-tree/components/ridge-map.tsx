'use client';

import { type RidgeNode } from '../lib/ridge';

type RidgeMapProps = {
  peaks: RidgeNode[];
  selectedPeakId: string | null;
  onSelectPeak: (peak: RidgeNode) => void;
};

/* ─────────────────────────────────────────────────────
 * 정복 능선 — v4 프로토타입(mvp-e-약점트리-재설계-v4.html) 이식
 *  - 봉우리 = [색 농도 + 높이 + % + 마커 1개 + 이름]만. 배지 도배 금지.
 *  - 마커는 봉우리당 단 하나: 정복(🚩) / 약점(⚠) — 나머지 상태는 마커 없음.
 *  - 90%+(정복)만 트로피 그라데이션 + shine 스윕, 그 외는 평면 색.
 * ────────────────────────────────────────────────────*/
export const RidgeMap = ({
  peaks,
  selectedPeakId,
  onSelectPeak,
}: RidgeMapProps) => (
  <div className="flex h-[260px] items-stretch gap-3 overflow-x-auto px-1 pt-9 md:h-[320px] md:gap-3.5">
    {peaks.map((peak) => {
      const untested = peak.attemptCount === 0 && peak.masteryScore <= 0;
      const height = untested ? 14 : Math.max(18, peak.masteryScore);
      const isMastered = peak.intensity === 'mastered';
      const isWeak = peak.intensity === 'weak';
      const isSelected = selectedPeakId === peak.nodeId;

      return (
        <button
          key={peak.nodeId}
          type="button"
          onClick={() => onSelectPeak(peak)}
          aria-expanded={isSelected}
          aria-label={`${peak.displayName}, ${
            untested ? '미진단' : isMastered ? '정복' : isWeak ? '약점' : '진행'
          } ${untested ? 0 : peak.masteryScore}퍼센트, 누르면 세부 트리`}
          className="flex min-w-[92px] flex-1 flex-col bg-transparent p-0 font-sans"
        >
          <div className="border-line-line2 relative flex flex-1 items-end justify-center border-b-2">
            <div
              className="relative flex w-full items-start justify-center overflow-hidden rounded-t-[12px] pt-2.5 transition-[height] duration-700 ease-out"
              style={{
                height: `${height}%`,
                background: untested
                  ? undefined
                  : isMastered
                    ? 'linear-gradient(135deg, var(--orange-5), var(--orange-7) 55%, var(--orange-10))'
                    : isWeak
                      ? 'var(--tree-weak)'
                      : 'var(--tree-progress)',
                border: untested
                  ? '1.5px dashed var(--gray-3, #e0e0e0)'
                  : undefined,
                backgroundColor: untested ? 'var(--tree-untested)' : undefined,
                borderBottom: untested ? 0 : undefined,
                boxShadow: isSelected
                  ? '0 0 0 3px var(--bg,#fcfbfa), 0 0 0 5px var(--orange-7)'
                  : undefined,
              }}
            >
              {isMastered && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                  <span
                    className="absolute top-0 left-[-60%] h-full w-[45%]"
                    style={{
                      background:
                        'linear-gradient(100deg, transparent, rgba(255,255,255,.45), transparent)',
                      animation: 'ridge-trophy-sweep 4.6s ease-in-out infinite',
                    }}
                  />
                </span>
              )}

              {isMastered && (
                <span
                  aria-hidden
                  className="absolute -top-7 left-1/2 -translate-x-1/2 text-[17px] leading-none"
                >
                  🚩
                </span>
              )}
              {isWeak && (
                <span
                  aria-hidden
                  className="text-system-warning absolute -top-7 left-1/2 -translate-x-1/2 text-[16px] leading-none font-bold"
                >
                  ⚠
                </span>
              )}

              <span
                className={
                  'font-body1-heading tabular-nums ' +
                  (untested
                    ? 'text-text-sub2'
                    : isWeak
                      ? 'text-orange-12'
                      : 'text-white')
                }
              >
                {untested ? '0%' : `${peak.masteryScore}%`}
              </span>
            </div>
          </div>
          <span className="font-body2-heading text-text-sub1 mt-3 line-clamp-2 h-11 text-center leading-tight [text-wrap:balance] break-keep">
            {peak.displayName}
          </span>
        </button>
      );
    })}
  </div>
);
