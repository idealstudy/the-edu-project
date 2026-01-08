import { profileMapper } from '@/entities/profile/mapper';
import { FrontendProfile, ProfileDTO } from '@/entities/profile/types';
import { api } from '@/shared/api';
import { CommonResponse } from '@/types';

import { adapters } from './profile.adapters';

/* ─────────────────────────────────────────────────────
 * [Read] 내 프로필 조회
 * ────────────────────────────────────────────────────*/
const getMyProfile = async (): Promise<FrontendProfile> => {
  const response =
    await api.private.get<CommonResponse<ProfileDTO>>('/members/profile');

  const validateResponse = adapters.fromApi.parse(response);

  return profileMapper.toDomain(validateResponse.data ?? []);
};

export const repository = {
  profile: {
    getMyProfile,
  },
};
