import { domain, helpers } from '@/entities/parent-report/core';
import { dto } from '@/entities/parent-report/infrastructure';

export * from './infrastructure';
export * from './core';
export * from './types';

export const parentReport = {
  dto,
  domain,
  helpers,
};
