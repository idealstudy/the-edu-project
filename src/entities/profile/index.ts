import { domain } from '@/entities/profile/core';
import { dto } from '@/entities/profile/infrastructure';

/* ─────────────────────────────────────────────────────
 * API
 * ────────────────────────────────────────────────────*/
export * from './infrastructure';
export * from './core';
export * from './mapper';

/* ─────────────────────────────────────────────────────
 * 스키마
 * ────────────────────────────────────────────────────*/
export * from './schema';

export const profile = {
  dto,
  domain,
};

/* ─────────────────────────────────────────────────────
 * 타입
 * ────────────────────────────────────────────────────*/
export * from './types';
