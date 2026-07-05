'use client';

import { useEffect } from 'react';

import { useMyLevelQuery } from '@/features/level';
import { useMyPointWalletQuery } from '@/features/point/hooks/use-point';
import { useSession } from '@/providers/session';
import { trackHomeView } from '@/shared/lib/analytics';

import { useMyStreakQuery } from '../../hooks/use-streak';
import { StreakBanner } from './streak-banner';

/* ─────────────────────────────────────────────────────
 * 로그인 홈 동기 헤더 (D-Home)
 *  - 상단 1줄 compact strip: 🔥streak · Lv.N · P포인트
 *  - StreakBanner(7일 도트) 배선
 *  - home_view 이벤트 발화
 *  - 비로그인이면 null 반환(데이터 불필요)
 * ────────────────────────────────────────────────────*/
export const MotiveHeader = () => {
  const { status, member } = useSession();
  const isAuth = status === 'authenticated';

  const { data: streak } = useMyStreakQuery({ enabled: isAuth });
  const { data: level } = useMyLevelQuery();
  const { data: wallet } = useMyPointWalletQuery();

  /* home_view 이벤트 — 데이터가 모두 로드된 뒤 1회 발화 */
  useEffect(() => {
    if (!isAuth || streak == null || level == null || wallet == null) return;
    trackHomeView(
      {
        streak_day: streak.streakDays,
        level: level.level,
        points: wallet.balance,
      },
      member?.role ?? null
    );
  }, [isAuth, streak, level, wallet]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuth) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Compact one-liner: 🔥스트릭 | Lv.N | P포인트 */}
      <div className="flex items-center gap-4 px-1">
        {/* 스트릭 */}
        <div className="flex items-center gap-1.5">
          <span
            className="text-lg leading-none"
            role="img"
            aria-label="streak"
          >
            🔥
          </span>
          <span className="font-body2-heading text-orange-7">
            {streak?.streakDays ?? 0}일 연속
          </span>
        </div>

        <span className="text-gray-4 select-none">·</span>

        {/* 레벨 + 경험치 진행 바 */}
        <div className="flex items-center gap-2">
          <span className="font-body2-heading text-text-main">
            Lv.{level?.level ?? 1}
          </span>
          {level != null && (
            <div className="bg-gray-2 h-2 w-20 overflow-hidden rounded-full">
              <div
                className="bg-orange-7 h-full rounded-full transition-all duration-500"
                style={{ width: `${level.progressPercent}%` }}
              />
            </div>
          )}
        </div>

        <span className="text-gray-4 select-none">·</span>

        {/* 포인트 */}
        <div className="flex items-center gap-1">
          <span className="font-body2-heading text-text-main">
            {(wallet?.balance ?? 0).toLocaleString()}
          </span>
          <span className="text-gray-6 text-sm">P</span>
        </div>
      </div>

      {/* StreakBanner 배선 — 7일 도트 캘린더 (死코드 배선) */}
      {streak != null && (
        <StreakBanner
          streakDays={streak.streakDays}
          todayCompleted={streak.todayCompleted}
        />
      )}
    </div>
  );
};
