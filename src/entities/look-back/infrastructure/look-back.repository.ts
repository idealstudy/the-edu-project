import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { type LookBackPeriod, lookBackDto } from './look-back.dto';

export type { LookBackPeriod } from './look-back.dto';

const getLookBack = async (period: LookBackPeriod, offset = 0) => {
  const response = await api.private.get('/student/look-back', {
    params: { period, offset },
  });
  return unwrapEnvelope(response, lookBackDto);
};

export const lookBackRepository = { getLookBack };
