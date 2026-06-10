import { domain, helpers } from '@/entities/tree/core';
import { dto } from '@/entities/tree/infrastructure';

export * from './infrastructure';
export * from './core';
export * from './types';

export const tree = {
  dto,
  domain,
  helpers,
};
