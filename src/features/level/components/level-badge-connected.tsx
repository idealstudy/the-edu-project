'use client';

import { LevelBadge } from '@/features/point/components/level-badge';

import { useMyLevelQuery } from '../hooks/use-level';

/* ─────────────────────────────────────────────────────
 * LevelBadge connected 래퍼
 *  GET /api/common/me/level 을 읽어 presentational LevelBadge에 주입.
 *  - 에러 시에도 형태는 유지(레벨 Lv.1·게이지 0)하여 레이아웃이 깨지지 않게.
 *  레벨=성장 지표(포인트와 별개 축)라는 UI 원칙은 LevelBadge가 유지.
 * ────────────────────────────────────────────────────*/
export const LevelBadgeConnected = () => {
  const { data, isLoading, isError } = useMyLevelQuery();

  return (
    <LevelBadge
      level={data?.level}
      progressPercent={data?.progressPercent}
      expToNextLevel={data?.expToNextLevel}
      isLoading={isLoading}
      isError={isError}
    />
  );
};
