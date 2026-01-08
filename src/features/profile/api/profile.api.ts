import { repository } from '@/entities/profile';

export const profileApi = {
  /**
   * 프로필 조회
   * @returns FrontendProfile
   */
  getProfile: (memberId: string) => repository.profile.getProfile(memberId),
};
