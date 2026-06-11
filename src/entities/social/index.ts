import { domain } from '@/entities/social/core';
import { dto, payload } from '@/entities/social/infrastructure';

export * from './infrastructure';
export * from './core';
export * from './types';

export const social = {
  dto,
  domain,
  payload,
};
