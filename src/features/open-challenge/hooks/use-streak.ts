'use client';

import { openChallengeKeys, repository } from '@/entities/open-challenge';
import { useQuery } from '@tanstack/react-query';

/* ─────────────────────────────────────────────────────
 * 내 스트릭 스냅샷 조회 훅 (D-Home 동기 헤더용)
 *  GET /api/common/me/streak
 *  — 비로그인 시 enabled=false로 호출 억제. 컴포넌트 수준에서 제어.
 * ────────────────────────────────────────────────────*/
export const useMyStreakQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: openChallengeKeys.myStreak(),
    queryFn: repository.getMyStreak,
    enabled: options?.enabled ?? true,
  });
