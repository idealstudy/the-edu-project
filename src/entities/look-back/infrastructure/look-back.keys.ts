import type { LookBackPeriod } from './look-back.dto';

export const lookBackKeys = {
  all: ['student-look-back'] as const,
  period: (period: LookBackPeriod, offset = 0) =>
    [...lookBackKeys.all, period, offset] as const,
};
