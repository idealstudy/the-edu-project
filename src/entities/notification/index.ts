import { domain } from '@/entities/notification/core';
import { dto } from '@/entities/notification/infrastructure';

/* ─────────────────────────────────────────────────────
 * API
 * ────────────────────────────────────────────────────*/
export * from './infrastructure';
export * from './core';
export * from './mapper';
export * from './hooks/use-notification-query';

/* ─────────────────────────────────────────────────────
 * 스키마
 * ────────────────────────────────────────────────────*/
export * from './schema';

export const notification = {
  dto,
  domain,
};

/* ─────────────────────────────────────────────────────
 * 타입
 * ────────────────────────────────────────────────────*/
export * from './types';
