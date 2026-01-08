import { repository } from '@/entities/profile';

export const profileApi = {
  /**
   * 내 프로필 조회
   * @returns FrontendProfile
   */
  getMyProfile: () => repository.profile.getMyProfile(),
};
