import type { GrowthState } from '@/entities/growth/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { dto } from './growth.dto';

/* ─────────────────────────────────────────────────────
 * [READ] 학생 성장 나무 현재 상태
 * ────────────────────────────────────────────────────*/
const getState = async (): Promise<GrowthState> => {
  const response = await api.private.get('/student/growth');
  return unwrapEnvelope(response, dto.state);
};

export const repository = {
  getState,
};
