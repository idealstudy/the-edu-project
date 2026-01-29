import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { domain } from '../core';
import type { TeacherOnboardingStepType } from '../types';
import { dto } from './onboarding.dto';

/* ─────────────────────────────────────────────────────
 * [Read] 온보딩 현황 조회
 * ────────────────────────────────────────────────────*/
const getTeacherOnboarding = async () => {
  const response = await api.private.get('/teacher/onboarding');
  return domain.schema.parse(unwrapEnvelope(response, dto.teacher));
};

/* ─────────────────────────────────────────────────────
 * [Create] 온보딩 단계 완료 처리
 * ────────────────────────────────────────────────────*/
const saveTeacherOnboarding = async (stepType: TeacherOnboardingStepType) => {
  await api.private.post(
    '/teacher/onboarding',
    { stepType },
    {
      withCredentials: true,
    }
  );
};

export const repository = {
  teacher: {
    getTeacherOnboarding,
    saveTeacherOnboarding,
  },
};
