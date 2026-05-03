import { domain } from './core';
import { dto } from './infrastructure';

/* ─────────────────────────────────────────────────────
 * API
 * ────────────────────────────────────────────────────*/
export * from './infrastructure';
export * from './core';
export * from './types';

/* ─────────────────────────────────────────────────────
 * 스키마
 * ────────────────────────────────────────────────────*/
export const parent = {
  domain,
  dto,
};
