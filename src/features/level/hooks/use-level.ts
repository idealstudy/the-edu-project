'use client';

import { levelKeys, repository } from '@/entities/level';
import { useQuery } from '@tanstack/react-query';

/* ─────────────────────────────────────────────────────
 * 내 레벨 조회 훅 (GET /api/common/me/level)
 * ────────────────────────────────────────────────────*/
export const useMyLevelQuery = () =>
  useQuery({
    queryKey: levelKeys.me(),
    queryFn: repository.getMyLevel,
  });

/* ─────────────────────────────────────────────────────
 * 내 뱃지 카탈로그 조회 훅 (GET /api/common/me/badges)
 * ────────────────────────────────────────────────────*/
export const useMyBadgesQuery = () =>
  useQuery({
    queryKey: levelKeys.badges(),
    queryFn: repository.getMyBadges,
  });
