import { domain } from '@/entities/course/core';
import { dto, payload } from '@/entities/course/infrastructure';

export * from './infrastructure';
export * from './core';
export * from './types';

export const course = {
  dto,
  domain,
  payload,
};
