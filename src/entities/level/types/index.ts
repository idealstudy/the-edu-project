import { domain } from '@/entities/level/core';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * Domain 추론 Type
 * ────────────────────────────────────────────────────*/
export type UserLevel = z.infer<typeof domain.userLevel>;
export type BadgeConditionType = z.infer<typeof domain.badgeConditionType>;
export type BadgeDomain = z.infer<typeof domain.badge>;

/* ─────────────────────────────────────────────────────
 * UI-ready Type — 뱃지 (조건 안내 라벨 포함)
 * ────────────────────────────────────────────────────*/
export type Badge = BadgeDomain & {
  /** 미보유 뱃지 획득 조건 안내 문구 */
  conditionLabel: string;
};
